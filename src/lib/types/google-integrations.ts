/**
 * Type definitions for Google Drive and Sheets integrations
 * Used across sponsor upload workflow (Phases 8-12)
 */

export interface GoogleDriveFolder {
  id: string;
  name: string;
  parentId: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  folderId: string;
}

export interface SponsorUploadWorkflow {
  invoiceId: string;
  companyName: string;
  packageName: string;
  packageId: string;
  amount: number;
  driveFolderId: string;
  uploadToken: string;
  tokenExpiresAt: Date;
}

/**
 * Package benefit flags for flexible sponsorship benefits
 */
export interface PackageBenefits {
  includes_website_benefit: boolean;
  includes_banner: boolean;
  includes_tshirt: boolean;
  includes_golf_sign: boolean;
  includes_game_day: boolean;
}

/**
 * Complete sponsorship package with benefits
 */
export interface SponsorshipPackageWithBenefits extends PackageBenefits {
  id: string;
  name: string;
  cost: number;
  description: string | null;
  closing_date: string | null;
  total_slots: number;
  available_slots: number;
  created_at: string;
  updated_at: string;
}

/**
 * Upload token status
 */
export type UploadTokenStatus = 'pending' | 'completed' | 'expired';

/**
 * Sponsor upload record from database
 */
export interface SponsorUploadRecord {
  id: string;
  invoice_id: string;
  upload_token: string;
  company_name: string;
  package_id: string;
  logo_url: string | null;
  website_url: string | null;
  drive_folder_id: string;
  drive_file_id: string | null;
  sheets_row_index: number | null;
  status: UploadTokenStatus;
  uploaded_at: string | null;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}
