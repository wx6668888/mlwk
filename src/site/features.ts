// Build-time switches.
// VITE_INSPIRATION=1 shows the inspiration projects (third-party reference photography, internal preview only).
// Off by default, so a normal build never includes them in pages, routes or navigation.
export const inspirationEnabled = import.meta.env.VITE_INSPIRATION === "1";
