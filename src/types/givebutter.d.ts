// Type declarations for GiveButter widget custom elements
// See: https://help.givebutter.com/en/articles/6464859

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          align?: string;
          account?: string;
        },
        HTMLElement
      >;
      "givebutter-giving-form": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          account: string;
          campaign?: string;
          "theme-color"?: string;
          "embed-url"?: string;
          "max-width"?: string;
          "iframe-class"?: string;
          "footer-class"?: string;
          "show-goal-bar"?: string;
        },
        HTMLElement
      >;
    }
  }
}
