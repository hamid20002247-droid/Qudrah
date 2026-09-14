/** Instant jump to top — used on route and in-app phase changes. */
export function scrollWindowToTop(behavior: ScrollBehavior = "auto") {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
