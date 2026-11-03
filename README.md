# DLTS Video Player (Able)

Accessible HTML5 video player for NYU Digital Library Technology Services, built on [Able Player](https://ableplayer.github.io/ableplayer/).

- Source lives in `js/` as split modules.
- `pnpm build` uses Vite (library mode) to bundle them into `dist/dlts-able-player.js` for other projects.
- The demo loads the modules directly — you do not need the bundle to run locally.
- `mountDltsPlayer` is the public API: importing the script only loads the library; you still pass your own `<video>` and playlist.

## File Paths

- `js/dlts-player.js` — exportable js script (`mountDltsPlayer` object)
- `js/*.js` — componenets (controls, HLS, overlay, captions, …)
- `js/demo.js`, `js/testplaylist.js` — test demo files
- `dist/dlts-able-player.js` — bundled file other apps import (compiled output)
- `build/` — upstream Able Player (not the compile output)

## Run locally

Do not open `index.html` as a file. The player uses ES modules, so it needs an HTTP server. `pnpm start` runs the Vite dev server (live reload, no browser caching).

```bash
pnpm start
```

Then open [http://localhost:8080](http://localhost:8080) (http, not https).

## Build

After changing files in `js/`, refresh the bundle:

```bash
pnpm build
```

That writes `dist/dlts-able-player.js`.

## Use in another project

Copy:

- `dist/dlts-able-player.js`
- `build/ableplayer.min.js`
- `build/ableplayer.min.css`
- `styles.css`

Load jQuery, hls.js, and Able Player, then import and mount:

```html
<video id="player" preload="metadata"></video>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js"></script>
<script src="build/ableplayer.min.js"></script>
<script type="module">
  import { mountDltsPlayer } from "./dlts-able-player.js";

  mountDltsPlayer({
    video: document.getElementById("player"),
    playlist: [
      {
        title: "Reel 1",
        hlsSrc: "https://example.org/video.m3u8",
        poster: "https://example.org/poster.jpg",
        captions: [
          { srclang: "en", label: "English", src: "https://example.org/en.vtt" },
          { srclang: "es", label: "Spanish", src: "https://example.org/es.vtt" },
        ],
      },
    ],
    index: 0,
  });
</script>
```

- Do not put `data-able-player` on the `<video>` — `mountDltsPlayer` constructs Able Player after it sets poster and tracks.

