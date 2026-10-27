# DLTS Video Player (Able)

Accessible HTML5 video player for NYU Digital Library Technology Services, built on [Able Player](https://ableplayer.github.io/ableplayer/). Static HTML/CSS/JS — no build step.

## Run locally

Do not open `index.html` as a file. The player uses ES modules, so it needs an HTTP server.

```bash
python3 -m http.server 8080
```

Then open [http://127.0.0.1:8080](http://127.0.0.1:8080) (http, not https).

