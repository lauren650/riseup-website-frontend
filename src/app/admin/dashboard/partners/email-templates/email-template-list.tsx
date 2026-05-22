"use client";

import { useState } from "react";
import type { EmailTemplateRow } from "@/lib/actions/email-templates";
import { EmailTemplateEditor } from "./email-template-editor";

export function EmailTemplateList({
  templates,
}: {
  templates: EmailTemplateRow[];
}) {
  const [selectedKey, setSelectedKey] = useState<string>(
    templates[0]?.template_key ?? ""
  );
  const selected = templates.find((t) => t.template_key === selectedKey);

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-muted-foreground">
        No templates found. Run the database migration to seed email templates.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <label htmlFor="template-select" className="mb-2 block text-sm font-medium text-muted-foreground">
          Select template to edit
        </label>
        <select
          id="template-select"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.template_key}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <EmailTemplateEditor
          key={selected.template_key}
          template={selected}
        />
      )}
    </section>
  );
}
