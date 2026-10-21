#!/usr/bin/env python3
"""生成 Pages 部署目录：只包含运行所需的静态资源与 Functions。"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist"

FILES = [
    "index.html", "app.js", "style.css", "sw.js", "passkey.js", "manifest.json",
    "help.html", "privacy.html", "terms.html", "_headers",
    "logo.png", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png",
]
DIRS = ["functions", "static"]

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

for name in FILES:
    src = ROOT / name
    if src.is_file():
        shutil.copy2(src, OUT / name)

for name in DIRS:
    src = ROOT / name
    if src.is_dir():
        shutil.copytree(src, OUT / name)

count = sum(1 for _ in OUT.rglob("*") if _.is_file())
print(f"prepared {count} files in {OUT}")
