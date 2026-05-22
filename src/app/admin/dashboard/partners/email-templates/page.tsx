import Link from "next/link";
import { getEmailTemplates } from "@/lib/actions/email-templates";
import { EmailTemplateList } from "./email-template-list";

export default async function EmailTemplatesPage() {
  const templates = await getEmailTemplates();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email templates</h1>
          <p className="mt-1 text-muted-foreground">
            Edit subject and HTML for partner, invoice, and contact emails. Use{" "}
            <code className="rounded bg-white/10 px-1">{"{{variableName}}"}</code>{" "}
            for placeholders.
          </p>
        </div>
        <Link
          href="/admin/dashboard/partners"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          Back to Partner Dashboard
        </Link>
      </div>

      <EmailTemplateList templates={templates} />
    </div>
  );
}
