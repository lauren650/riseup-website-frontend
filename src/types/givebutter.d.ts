// Type declarations for GiveButter widget custom element
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
    }
  }
}
