"use client";

import { useId, useLayoutEffect, useState } from "react";
import { FORM_STARTED_AT_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";

/**
 * Off-screen field plus a hidden start time. Bots that fill every input
 * or post the form immediately are rejected on the server.
 */
export function SpamTrapFields() {
  const honeypotId = useId();
  const [formStartedAt, setFormStartedAt] = useState("");

  useLayoutEffect(() => {
    setFormStartedAt(String(Date.now()));
  }, []);

  return (
    <>
      <div hidden aria-hidden="true">
        <label htmlFor={honeypotId}>Confirm email</label>
        <input
          id={honeypotId}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input type="hidden" name={FORM_STARTED_AT_FIELD} value={formStartedAt} />
    </>
  );
}
