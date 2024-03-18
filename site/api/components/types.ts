export interface LinkGetter {
  (typeRef: string): string | null;
}
