// mindwalk's web client enforces correctness with tsc, vitest, and
// playwright; eslint is not part of this repository's toolchain. This
// flat config exists so a globally installed eslint (e.g. from a
// wrapper pipeline) exits cleanly instead of failing with "no config".
// Replace it wholesale if eslint is ever adopted for real.
export default [
  {
    ignores: ["**/*"],
  },
];
