from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import exifread

from convert_111_to_jpeg import safe_custom_metadata


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("jpeg_folder", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--prefix", default="111/")
    args = parser.parse_args()

    entries = {}
    for path in sorted(args.jpeg_folder.glob("*.jpg")):
        key = f"{args.prefix}{path.name}"
        with path.open("rb") as file:
            tags = exifread.process_file(file, details=False, strict=False)
        gps_found = bool(tags.get("GPS GPSLatitude") or tags.get("GPS GPSLongitude"))
        approved = safe_custom_metadata(path)
        entries[key] = {
            "key": key,
            "etag": None,
            "size": path.stat().st_size,
            "uploaded": None,
            "parsedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "parser": "safe-exif-local-v1",
            "status": "parsed" if approved else "not-found",
            "gpsFound": gps_found,
            "approved": approved,
        }

    manifest = {
        "version": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "entries": entries,
    }
    args.output.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(entries)} entries to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
