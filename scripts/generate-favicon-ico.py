"""Raster app icons for legacy favicons, PWA manifest and Schema.org logo."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


def render_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = max(1, size // 14)
    draw.ellipse([pad, pad, size - pad, size - pad], fill=(196, 69, 105, 255))
    inner = pad + max(1, size // 28)
    draw.ellipse([inner, inner, size - inner, size - inner], fill=(255, 107, 157, 255))

    cx = size // 2
    cy = size // 2 + max(1, size // 32)
    cap_w = max(3, size // 5)
    cap_h = max(2, size // 8)
    top = cy - size // 3
    rad = max(1, size // 32)
    draw.rounded_rectangle(
        [cx - cap_w // 2, top, cx + cap_w // 2, top + cap_h],
        radius=rad,
        fill=(255, 255, 255, 250),
    )

    bw = max(4, size // 3)
    bh = max(6, size // 2 - cap_h)
    draw.ellipse(
        [cx - bw // 2, cy - bh // 2, cx + bw // 2, cy + bh // 2],
        fill=(255, 255, 255, 245),
    )

    sp = max(1, size // 16)
    hx = cx + bw // 4
    hy = cy - bh // 4
    draw.ellipse([hx, hy, hx + sp, hy + sp], fill=(255, 255, 255, 210))
    return img


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    public_dir = root / "client" / "public"

    favicon = public_dir / "favicon.ico"
    favicon_sizes = (16, 32, 48)
    favicon_images = [render_icon(s) for s in favicon_sizes]
    favicon_images[0].save(favicon, format="ICO", append_images=favicon_images[1:])
    print(f"Wrote {favicon}")

    for size in (192, 512):
      logo = public_dir / f"logo{size}.png"
      render_icon(size).save(logo, format="PNG")
      print(f"Wrote {logo}")


if __name__ == "__main__":
    main()
