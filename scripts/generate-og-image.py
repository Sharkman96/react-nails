"""Open Graph share image 1200x630 from a gallery photo."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

OG_WIDTH = 1200
OG_HEIGHT = 630
SOURCE = "client/public/images/gallery/20251219_135103.jpg"
OUTPUT = "client/public/og-image.jpg"
RESAMPLE_LANCZOS = getattr(getattr(Image, "Resampling", Image), "LANCZOS")


def crop_center_cover(img: Image.Image, width: int, height: int) -> Image.Image:
    target_ratio = width / height
    iw, ih = img.size
    current_ratio = iw / ih

    if current_ratio > target_ratio:
        new_w = int(ih * target_ratio)
        left = (iw - new_w) // 2
        box = (left, 0, left + new_w, ih)
    else:
        new_h = int(iw / target_ratio)
        top = (ih - new_h) // 2
        box = (0, top, iw, top + new_h)

    cropped = img.crop(box)
    return cropped.resize((width, height), RESAMPLE_LANCZOS)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / SOURCE
    out = root / OUTPUT

    if not src.exists():
        raise SystemExit(f"Source image not found: {src}")

    with Image.open(src) as img:
        og = crop_center_cover(img.convert("RGB"), OG_WIDTH, OG_HEIGHT)
        out.parent.mkdir(parents=True, exist_ok=True)
        og.save(out, format="JPEG", quality=88, optimize=True, progressive=True)

    print(f"Wrote {out} ({OG_WIDTH}x{OG_HEIGHT})")


if __name__ == "__main__":
    main()
