export let ACTIVE_MODULE = "";

export function setActiveModule(slug: string) {
  ACTIVE_MODULE = slug.toLowerCase();
}
