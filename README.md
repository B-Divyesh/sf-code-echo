# Code Echo

Code Echo is a Chrome extension for developers and learners reading unfamiliar
code. It reads selected code one syntax part at a time.

Try the isolated sample at `/demo/?demo=1`. It starts with a JavaScript
selection and has a banner and reset action. **Start for real** discards the
sample and returns to the product. The sample uses only
`demo:code-echo:` localStorage keys.

The extension opens selected code with `Alt+Shift+E`. Press `R` in the reader
to replay the current part. Press `Ctrl+Shift+Y` to replay the latest selection.

## Run

```sh
npm ci
npm run dev
npm run dev:site
```

Load `.output/chrome-mv3` in `chrome://extensions` with Developer mode on.

## Verify and build

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The project pins Playwright 1.58.2 for the supplied browser.

Every visitor-facing claim is listed in `.factory/claims.json`. Run each listed
command after a build. The browser tests use `/demo/?demo=1` from a clean
context. They cover reader parts, isolation, privacy, offline use, and reader
controls.

## Deploy

Deploy `dist/site/` as the static site.

## Privacy and terms

Read [Privacy](site/privacy/index.html) and [Terms](site/terms/index.html).

## License

MIT. See [LICENSE](LICENSE).
