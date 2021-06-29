# Change Log

All notable changes to the "change-color-format" extension will be documented in this file.

## 1.1.0

- fix: rgb(a) to hex conversion (#18) (Thanks @fritz-c)
- build: upgraded entire package to use latest vscode extension template, it was super out of date
- fix: added workarounds for `color` package [rounding bug](https://github.com/Qix-/color/issues/127). Colors are now properly rounded and have max of 1 significant decimal when appropriate for the color format.

## 1.0.1 (Unreleased internal fixes)

- Fixed eslint/prettier running on ALL files, not just ones that lint-staged passed in

## 1.0.0

- Initial release
