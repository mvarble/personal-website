#!/bin/sh
ffmpeg -ss 20.0 -t 2.0 -i yogurt.mp4 -f gif yogurt.gif
convert yogurt.gif -coalesce -repage 0x0 -crop 1200x1200+50+50 -resize 256x256 -quality 10 +repage yogurt-optimized.gif
