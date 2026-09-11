#!/usr/bin/env bash
# Render a pptx to page images so every slide can be inspected before it ships.
# Generating a deck is not the same as looking at one. Every layout defect this
# kit warns about was found here, not in the code.
#
#   ./render.sh out/deck.pptx            # all slides
#   ./render.sh out/deck.pptx 3 5        # slides 3 to 5 only
set -eo pipefail   # not -u: macOS bash 3.2 errors on empty array expansion
PPTX="${1:?usage: render.sh <file.pptx> [first] [last]}"
FIRST="${2:-}"; LAST="${3:-}"
command -v pdftoppm >/dev/null || {
  echo "pdftoppm not found — brew install poppler / apt install poppler-utils / scoop install poppler"; exit 1; }

OUT="$(mktemp -d)"
PDF="$OUT/$(basename "${PPTX%.*}").pdf"

# pptx -> pdf. LibreOffice wherever it exists; no installer puts soffice.exe on
# PATH on Windows, so look where the scoop and MSI installs each put it. Failing
# that, WPS Office's wpscli does the same conversion — its ppt2pdf is free where
# its ppt2photo is paywalled, which is why this still goes through pdftoppm.
SOFFICE="${SOFFICE:-/Applications/LibreOffice.app/Contents/MacOS/soffice}"
[ -x "$SOFFICE" ] || SOFFICE="$(command -v soffice || true)"
if [ -z "$SOFFICE" ]; then
  for c in "$HOME/scoop/apps/libreoffice/current/LibreOffice/program/soffice.exe" \n           "/c/Program Files/LibreOffice/program/soffice.exe" \n           "/c/Program Files (x86)/LibreOffice/program/soffice.exe"; do
    [ -x "$c" ] && { SOFFICE="$c"; break; }
  done
fi
WPSCLI="${WPSCLI:-}"
if [ -z "$SOFFICE" ] && [ -z "$WPSCLI" ]; then
  WPSCLI="$(ls -d "$HOME/AppData/Local/Kingsoft/WPS Office"/*/clitool/wpscli.exe 2>/dev/null | sort -V | tail -1)"
fi

# wpscli is a native Windows binary and cannot read an MSYS path.
winpath() { if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else echo "$1"; fi; }

if [ -n "$SOFFICE" ]; then
  "$SOFFICE" --headless --convert-to pdf --outdir "$OUT" "$PPTX" >/dev/null 2>&1
elif [ -n "$WPSCLI" ]; then
  "$WPSCLI" ppt2pdf "$(winpath "$PPTX")" --output "$(winpath "$OUT")\\" >/dev/null 2>&1
else
  echo "no pptx->pdf converter found — install LibreOffice (brew install --cask libreoffice /"
  echo "apt install libreoffice / scoop install libreoffice), or WPS Office on Windows"; exit 1
fi
[ -f "$PDF" ] || { echo "conversion produced no pdf at $PDF"; exit 1; }
RANGE=()
[ -n "$FIRST" ] && RANGE+=(-f "$FIRST")
[ -n "$LAST" ] && RANGE+=(-l "$LAST")
pdftoppm -jpeg -r 140 ${RANGE[@]+"${RANGE[@]}"} "$PDF" "$OUT/slide"
echo "$OUT"
ls "$OUT"/slide*.jpg
