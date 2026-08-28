# Code Echo demo

Open `/demo/?demo=1` or `/?demo=1`. The latter redirects to the isolated demo.

The demo starts with a JavaScript `parseHTTPResponse` selection. Its first syntax
chunk and spoken form are already visible. **Reset demo** restores that sample.
**Start for real** leaves the demo and returns to the product page.

All demo writes use the `demo:code-echo:` localStorage namespace. The normal
site uses its existing `code-echo-` key namespace, and the demo never reads or
writes those keys. The demo has no extension storage access.
