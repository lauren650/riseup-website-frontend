"use client";

import { useState } from "react";
import { updateEmailTemplate } from "@/lib/actions/email-templates";
import { Button } from "@/components/ui/button";
import type { EmailTemplateRow } from "@/lib/actions/email-templates";

const PLACEHOLDER_HINT: Record<string, string> = {
  upload_instructions: "{{companyName}}, {{uploadUrl}}",
  receipt: "{{companyName}}, {{packageName}}, {{amountFormatted}}, {{paidAtDate}}, {{stripeInvoiceId}}",
  sponsor_confirmation: "{{contactName}}, {{companyName}}",
  sponsor_admin_notification: "{{companyName}}, {{contactName}}, {{contactEmail}}, {{contactPhone}}, {{websiteUrl}}, {{description}}, {{logoUrl}}",
  sponsor_interest_confirmation: "{{name}}, {{companyName}}",
  sponsor_interest_admin_notification: "{{companyName}}, {{name}}, {{email}}, {{phone}}",
  contact_form_to_admin: "{{name}}, {{email}}, {{subject}}, {{message}}, {{phone}}",
  artwork_approval_request: "{{companyName}}, {{approvalUrl}}",
};

export function EmailTemplateEditor({ template }: { template: EmailTemplateRow }) {
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.html_body);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const result = await updateEmailTemplate(template.template_key, {
      subject,
      html_body: htmlBody,
    });
    setPending(false);
    if (result.success) {
      setMessage({ type: "success", text: "Saved." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to save." });
    }
  }

  const placeholders = PLACEHOLDER_HINT[template.template_key] ?? "";

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{template.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Key: <code className="rounded bg-white/10 px-1">{template.template_key}</code>
          {placeholders && (
            <> · Placeholders: <code className="rounded bg-white/10 px-1">{placeholders}</code></>
          )}
        </p>
      </div>
      <div className="mb-4">
        <label htmlFor={`subject-${template.id}`} className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Subject
        </label>
        <input
          id={`subject-${template.id}`}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="mb-4">
        <label htmlFor={`body-${template.id}`} className="mb-1.5 block text-sm font-medium text-muted-foreground">
          HTML body
        </label>
        <textarea
          id={`body-${template.id}`}
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? "Saving…" : "Save"}
        </Button>
        {message && (
          <span
            className={
              message.type === "success"
                ? "text-sm text-green-400"
                : "text-sm text-red-400"
            }
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
