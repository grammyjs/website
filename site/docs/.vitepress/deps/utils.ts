import { withBase } from "vitepress";
import { lookup } from "mrmime";
import { useData } from "vitepress";
import { isExternal } from "./shared";
export function throttleAndDebounce(fn: () => void, delay: number | undefined) {
  let timeoutId: string | number | NodeJS.Timeout | undefined;
  let called = false;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!called) {
      fn();
      (called = true) && setTimeout(() => (called = false), delay);
    } else {
      timeoutId = setTimeout(fn, delay);
    }
  };
}
export function ensureStartingSlash(path: string) {
  return /^\//.test(path) ? path : `/${path}`;
}
export function normalizeLink(url: string) {
  const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
  if (
    isExternal(url) ||
    url.startsWith("#") ||
    !protocol.startsWith("http") ||
    (/\.(?!html|md)\w+($|\?)/i.test(url) && lookup(url))
  ) {
    return url;
  }
  const { site } = useData();
  const normalizedPath = pathname.endsWith("/") || pathname.endsWith(".html")
    ? url
    : url.replace(
      /(?:(^\.+)\/)?.*$/,
      `$1${
        pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")
      }${search}${hash}`,
    );
  return withBase(normalizedPath);
}
