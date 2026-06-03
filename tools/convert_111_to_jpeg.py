from __future__ import annotations

import argparse
from fractions import Fraction
from pathlib import Path

import exifread
import piexif
import rawpy
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener


RAW_EXTS = {".dng", ".raf", ".raw", ".arw", ".cr2", ".cr3", ".nef", ".orf"}
PIL_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def convert_raw(path: Path) -> Image.Image:
    try:
        with rawpy.imread(str(path)) as raw:
            rgb = raw.postprocess(
                use_camera_wb=True,
                output_bps=8,
                no_auto_bright=False,
            )
        return Image.fromarray(rgb, "RGB")
    except rawpy.LibRawFileUnsupportedError:
        return convert_pil(path)


def convert_pil(path: Path) -> Image.Image:
    image = Image.open(path)
    image = ImageOps.exif_transpose(image)
    if image.mode not in {"RGB", "L"}:
        image = image.convert("RGB")
    if image.mode == "L":
        image = image.convert("RGB")
    return image


def output_name(path: Path) -> str:
    return f"{path.stem}.jpg"


def safe_exif(path: Path) -> bytes | None:
    with path.open("rb") as file:
        tags = exifread.process_file(file, details=False, strict=False)

    make = tag_text(tags, "Image Make")
    model = tag_text(tags, "Image Model")
    lens = tag_text(tags, "EXIF LensModel")
    captured_at = first_tag(tags, "EXIF DateTimeOriginal", "EXIF DateTimeDigitized", "Image DateTime")
    exposure = rational_tag(tags, "EXIF ExposureTime")
    f_number = rational_tag(tags, "EXIF FNumber")
    iso = int_tag(tags, "EXIF ISOSpeedRatings", "EXIF PhotographicSensitivity")
    focal_length = rational_tag(tags, "EXIF FocalLength")

    zeroth = {piexif.ImageIFD.Orientation: 1}
    exif = {}

    if make:
        zeroth[piexif.ImageIFD.Make] = make
    if model:
        zeroth[piexif.ImageIFD.Model] = model
    if captured_at:
        zeroth[piexif.ImageIFD.DateTime] = captured_at
        exif[piexif.ExifIFD.DateTimeOriginal] = captured_at
        exif[piexif.ExifIFD.DateTimeDigitized] = captured_at
    if lens:
        exif[piexif.ExifIFD.LensModel] = lens
    if exposure:
        exif[piexif.ExifIFD.ExposureTime] = exposure
    if f_number:
        exif[piexif.ExifIFD.FNumber] = f_number
    if iso:
        exif[piexif.ExifIFD.ISOSpeedRatings] = iso
    if focal_length:
        exif[piexif.ExifIFD.FocalLength] = focal_length

    if len(zeroth) == 1 and not exif:
        return None

    return piexif.dump({"0th": zeroth, "Exif": exif, "GPS": {}, "1st": {}, "thumbnail": None})


def safe_custom_metadata(path: Path) -> dict[str, str]:
    with path.open("rb") as file:
        tags = exifread.process_file(file, details=False, strict=False)

    metadata = {
        "capturedAt": normalize_capture_date(first_tag(tags, "EXIF DateTimeOriginal", "EXIF DateTimeDigitized", "Image DateTime")),
        "cameraMake": tag_text(tags, "Image Make"),
        "cameraModel": tag_text(tags, "Image Model"),
        "lens": tag_text(tags, "EXIF LensModel"),
        "shutter": format_shutter(rational_float(tags, "EXIF ExposureTime")),
        "aperture": format_aperture(rational_float(tags, "EXIF FNumber")),
        "iso": tag_text(tags, "EXIF ISOSpeedRatings") or tag_text(tags, "EXIF PhotographicSensitivity"),
        "focalLength": format_focal_length(rational_float(tags, "EXIF FocalLength")),
    }
    if metadata["cameraMake"] and metadata["cameraModel"]:
        metadata["camera"] = (
            metadata["cameraModel"]
            if metadata["cameraModel"].lower().startswith(metadata["cameraMake"].lower())
            else f"{metadata['cameraMake']} {metadata['cameraModel']}"
        )
    return {key: value for key, value in metadata.items() if value}


def first_tag(tags, *names: str) -> str | None:
    for name in names:
        value = tag_text(tags, name)
        if value:
            return value
    return None


def tag_text(tags, name: str) -> str | None:
    value = tags.get(name)
    if value is None:
        return None
    text = str(value).replace("\x00", "").strip()
    return text or None


def rational_tag(tags, name: str) -> tuple[int, int] | None:
    value = tag_text(tags, name)
    if not value:
        return None
    try:
        frac = Fraction(value).limit_denominator(1_000_000)
    except ValueError:
        return None
    if frac.denominator == 0:
        return None
    return (frac.numerator, frac.denominator)


def rational_float(tags, name: str) -> float | None:
    rational = rational_tag(tags, name)
    if not rational:
        return None
    return rational[0] / rational[1]


def int_tag(tags, *names: str) -> int | None:
    for name in names:
        value = tag_text(tags, name)
        if not value:
            continue
        try:
            return int(float(value))
        except ValueError:
            continue
    return None


def normalize_capture_date(value: str | None) -> str | None:
    if not value:
        return None
    parts = value.strip().split(" ")
    date = parts[0].replace(":", "-")
    if len(parts) > 1:
        return f"{date}T{parts[1]}"
    return date


def format_aperture(value: float | None) -> str | None:
    if not value:
        return None
    return f"f/{round_nice(value)}"


def format_focal_length(value: float | None) -> str | None:
    if not value:
        return None
    return f"{round_nice(value)}mm"


def format_shutter(value: float | None) -> str | None:
    if not value:
        return None
    if value >= 1:
        return f"{round_nice(value)}s"
    denominator = round(1 / value)
    return f"1/{denominator}" if denominator > 0 else None


def round_nice(value: float) -> str:
    rounded = round(value, 1)
    return str(int(rounded)) if rounded.is_integer() else str(rounded)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--quality", type=int, default=92)
    parser.add_argument("--max-width", type=int, default=0)
    args = parser.parse_args()

    register_heif_opener()
    args.output.mkdir(parents=True, exist_ok=True)

    converted = 0
    skipped = 0
    failed: list[tuple[str, str]] = []

    for path in sorted(args.source.iterdir()):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext not in RAW_EXTS and ext not in PIL_EXTS:
            skipped += 1
            continue

        target = args.output / output_name(path)
        try:
            image = convert_raw(path) if ext in RAW_EXTS else convert_pil(path)
            if args.max_width and image.width > args.max_width:
                ratio = args.max_width / image.width
                image = image.resize((args.max_width, round(image.height * ratio)), Image.Resampling.LANCZOS)
            exif = safe_exif(path)
            save_args = {
                "quality": args.quality,
                "optimize": True,
                "progressive": True,
            }
            if exif:
                save_args["exif"] = exif
            image.save(target, "JPEG", **save_args)
            converted += 1
            print(f"converted {path.name} -> {target.name}")
        except Exception as exc:
            failed.append((path.name, str(exc)))
            print(f"failed {path.name}: {exc}")

    print(f"converted={converted} skipped={skipped} failed={len(failed)} output={args.output}")
    if failed:
        for name, error in failed:
            print(f"FAILED\t{name}\t{error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
