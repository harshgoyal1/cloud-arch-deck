#!/usr/bin/env python3
"""Recolour a transparent-PNG wordmark so it works on light and dark slides.

Most brand kits ship a white-on-transparent logo. Dropped on a white slide it
renders as nothing — the most common "the logo is missing" bug. This tints the
artwork through its own alpha channel, so one source file gives every variant.

    python brand_logo.py assets/brand-wordmark.png out/ --crop 0,130,417,160 \
        --tint white:ffffff --tint ink:150027 --tint brand:831B83

--crop is x,y,w,h in the source image's own pixels; use it to trim the padding
around a wordmark that sits inside a square canvas. Omit it to keep the full frame.
"""
import argparse, base64, pathlib, shutil, struct, subprocess, sys


def png_size(path):
    """Width and height straight out of the PNG IHDR chunk — no image library needed."""
    with open(path, "rb") as fh:
        head = fh.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit(f"{path} is not a PNG")
    return struct.unpack(">II", head[16:24])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source"); ap.add_argument("outdir")
    ap.add_argument("--crop", help="x,y,w,h in source pixels")
    ap.add_argument("--tint", action="append", required=True, metavar="NAME:HEX")
    ap.add_argument("--width", type=int, default=1311)
    a = ap.parse_args()
    if not shutil.which("rsvg-convert"):
        sys.exit("rsvg-convert not found. Install it:  brew install librsvg")

    src = pathlib.Path(a.source)
    b64 = base64.b64encode(src.read_bytes()).decode()
    out = pathlib.Path(a.outdir); out.mkdir(parents=True, exist_ok=True)

    w0, h0 = png_size(src)
    if a.crop:
        x, y, w, h = (float(v) for v in a.crop.split(","))
    else:
        x, y, w, h = 0, 0, w0, h0

    for spec in a.tint:
        name, hexv = spec.split(":")
        r, g, b = (int(hexv[i:i + 2], 16) / 255 for i in (0, 2, 4))
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
               f'width="{w}" height="{h}" viewBox="{x} {y} {w} {h}">'
               f'<filter id="t" color-interpolation-filters="sRGB">'
               f'<feColorMatrix type="matrix" values="0 0 0 0 {r} 0 0 0 0 {g} 0 0 0 0 {b} 0 0 0 1 0"/></filter>'
               f'<image filter="url(#t)" x="0" y="0" width="{w0}" height="{h0}" '
               f'xlink:href="data:image/png;base64,{b64}"/></svg>')
        tmp = out / (name + ".svg"); tmp.write_text(svg, encoding="utf-8")
        png = out / (name + ".png")
        cmd = ["rsvg-convert", "-w", str(a.width), "-o", str(png), str(tmp)]
        subprocess.run(cmd, check=True)
        tmp.unlink()
        print("wrote", png)


if __name__ == "__main__":
    main()
