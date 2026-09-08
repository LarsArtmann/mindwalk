// Ambient declarations for side-effect imports the bundler handles but
// TypeScript cannot resolve on its own (TS2882 under strict side-effect
// import checking). vite/client covers asset imports; the explicit CSS
// wildcard also covers bare specifier imports like
// `@fontsource-variable/fraunces/standard.css`.
/// <reference types="vite/client" />

declare module "*.css";
