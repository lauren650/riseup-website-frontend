/**
 * Loads the GiveButter Widgets library once per page.
 * @see https://docs.givebutter.com/widgets/getting-started
 */

const SCRIPT_SELECTOR = 'script[data-givebutter-widgets]';

let loadPromise: Promise<void> | null = null;
let loaded = false;

export function markGivebutterWidgetsLoaded(): void {
  loaded = true;
  loadPromise = Promise.resolve();
}

export function markGivebutterWidgetsFailed(): void {
  loadPromise = null;
}

export function isGivebutterWidgetsLoaded(): boolean {
  if (loaded) return true;
  const script = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
  return script?.getAttribute("data-loaded") === "true";
}

export function loadGivebutterWidgetsScript(accountId: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (loaded || isGivebutterWidgetsLoaded()) {
    loaded = true;
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      loaded = true;
      resolve();
    };

    const existing = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => {
          loadPromise = null;
          reject(new Error("GiveButter widgets script failed"));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(accountId)}`;
    script.async = true;
    script.dataset.givebutterWidgets = "true";
    script.onload = () => {
      script.dataset.loaded = "true";
      finish();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("GiveButter widgets script failed to load"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
