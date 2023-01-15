### Deno Base64 to png

Tested Deno version: v1.21.3

```
deno run --allow-net --allow-write https://raw.githubusercontent.com/Nismit/try-deno/main/index.ts
```

```
// png to mp4 (30 fps)
ffmpeg -r 30 -i ./output/%03d.png -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -vcodec libx264 -pix_fmt yuv420p -r 60 ./output/out.mp4
// mp4 to gif 20 fps
ffmpeg -i ./output/out.mp4 -filter_complex "[0:v] fps=20,scale=500:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" ./output/output-palette.gif
// mp4 to gif 30 fps 2.0x play speed
ffmpeg -i ./output/out.mp4 -filter_complex "[0:v] setpts=PTS/2.0,fps=30,scale=500:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" ./output/output-palette.gif
// 30 fps
ffmpeg -i ./output/out.mp4 -filter_complex "[0:v] fps=30,scale=500:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" ./output/output-palette.gif
```
