import { notFound } from "next/navigation";
import { getUploadByToken } from "@/lib/actions/sponsor-upload";
import { UploadForm } from "./upload-form";
import Link from "next/link";

export const metadata = {
  title: "Upload your logo | RiseUp Youth Football",
  description: "Upload your company logo and website for the RiseUp Partners page.",
};

type Props = { params: Promise<{ token: string }> };

export default async function UploadPage({ params }: Props) {
  const { token } = await params;
  const result = await getUploadByToken(token);

  if (!result) {
    notFound();
  }

  const { upload, packageName } = result;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Partner upload
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your logo and website so we can feature you on our Partners page
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-white">{upload.company_name}</span>
            <span className="mx-2">·</span>
            {packageName}
          </p>
        </div>

        <UploadForm token={token} />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/partners" className="transition-colors hover:text-white">
            Back to Partners
          </Link>
        </p>
      </div>
    </div>
  );
}
