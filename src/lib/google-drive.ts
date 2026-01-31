import { google } from 'googleapis';

/**
 * Google Drive client for sponsor upload workflow
 * Uses service account authentication for automated operations
 */

// Initialize Drive client with service account
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Creates a folder in Google Drive
 * @param folderName - Name of the folder
 * @param parentFolderId - Parent folder ID (optional, defaults to root sponsor folder)
 * @returns Folder ID
 */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  const finalParentId = parentFolderId || rootFolderId;
  
  const fileMetadata: {
    name: string;
    mimeType: string;
    parents?: string[];
  } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (finalParentId) {
    fileMetadata.parents = [finalParentId];
  }

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    if (!response.data.id) {
      throw new Error('Failed to create folder: No ID returned');
    }

    return response.data.id;
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    throw new Error(`Failed to create Drive folder: ${folderName}`);
  }
}

/**
 * Uploads a file to Google Drive
 * @param fileName - Name for the file
 * @param fileBuffer - File contents as Buffer
 * @param mimeType - MIME type of the file
 * @param parentFolderId - Folder to upload to
 * @returns File ID
 */
export async function uploadFileToDrive(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  parentFolderId: string
): Promise<string> {
  const drive = getDriveClient();

  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId],
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: fileBuffer as any, // Buffer to stream conversion handled by googleapis
      },
      fields: 'id',
    });

    if (!response.data.id) {
      throw new Error('Failed to upload file: No ID returned');
    }

    return response.data.id;
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw new Error(`Failed to upload file: ${fileName}`);
  }
}

/**
 * Gets the package folder ID, creating it if it doesn't exist
 * @param packageName - Name of the sponsorship package
 * @returns Package folder ID
 */
export async function getOrCreatePackageFolder(
  packageName: string
): Promise<string> {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  // Search for existing folder
  try {
    const response = await drive.files.list({
      q: `name='${packageName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    // If found, return existing folder ID
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // If not found, create new folder
    return await createDriveFolder(packageName, rootFolderId);
  } catch (error) {
    console.error('Error getting/creating package folder:', error);
    throw new Error(`Failed to manage package folder: ${packageName}`);
  }
}

/**
 * Creates a sponsor-specific folder within a package folder
 * @param companyName - Name of the company
 * @param invoiceId - Stripe invoice ID
 * @param packageFolderId - Parent package folder ID
 * @returns Sponsor folder ID
 */
export async function createSponsorFolder(
  companyName: string,
  invoiceId: string,
  packageFolderId: string
): Promise<string> {
  const folderName = `${companyName} - ${invoiceId}`;
  return await createDriveFolder(folderName, packageFolderId);
}

/**
 * Gets a public URL for a Drive file (requires file to be shared)
 * Note: This returns a Drive URL, not a direct download link
 * @param fileId - Drive file ID
 * @returns Public Drive URL
 */
export function getDriveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Gets a folder URL for viewing in Drive
 * @param folderId - Drive folder ID
 * @returns Drive folder URL
 */
export function getDriveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
