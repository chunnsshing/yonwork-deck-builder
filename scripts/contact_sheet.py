#!/usr/bin/env python3
"""Dev helper: tile screenshots into one image.  contact_sheet.py out.png img1.png img2.png … [--cols 3] [--scale .4]"""
import sys
from PIL import Image
args = sys.argv[1:]
cols = int(args[args.index("--cols") + 1]) if "--cols" in args else 3
scale = float(args[args.index("--scale") + 1]) if "--scale" in args else 0.4
files = [a for a in args[1:] if a.endswith(".png") and a != args[0]]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = int(ims[0].width * scale), int(ims[0].height * scale)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w + (cols + 1) * 8, rows * h + (rows + 1) * 8), (60, 60, 66))
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, h), Image.LANCZOS), (8 + (i % cols) * (w + 8), 8 + (i // cols) * (h + 8)))
sheet.save(args[0])
