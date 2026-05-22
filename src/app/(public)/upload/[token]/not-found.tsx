import Link from "next/link";

export default function UploadNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-white">Link invalid or expired</h1>
        <p className="mt-2 text-muted-foreground">
          This upload link may have expired or already been used. If you need a new
          link, please contact us.
        </p>
        <Link
          href="/partners"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to Partners
        </Link>
      </div>
    </div>
  );
}
