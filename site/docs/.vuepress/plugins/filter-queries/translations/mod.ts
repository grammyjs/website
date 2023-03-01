import enTranslation from "./en.ts";

export interface Translation {
  title: string;
  introduction: string;
  generate: {
    L1: (L1: string, accessInfo: string) => string;
    L2: (L1: string, L2: string, accessInfo: string) => string;
    L3: (L1: string, L2: string, L3: string, accessInfo: string) => string;
  };
  // additional docs for a filter query
  prefixDocs: Record<string, string>;
}

// key should be the root of the folder of that translation.
export const TRANSLATIONS: Record<string, Translation> = {
  "/": enTranslation,
};
