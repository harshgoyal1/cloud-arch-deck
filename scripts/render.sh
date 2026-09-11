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
SOFFICE="${SOFFICE:-/Applications/LibreOffice.app/Contents/MacOS/soffice}"
[ -x "$SOFFICE" ] || SOFFICE="$(command -v soffice || true)"
[ -n "$SOFFICE" ] || { echo "LibreOffice not found — brew install --cask libreoffice"; exit 1; }
command -v pdftoppm >/dev/null || { echo "pdftoppm not found — brew install poppler"; exit 1; }

OUT="$(mktemp -d)"
"$SOFFICE" --headless --convert-to pdf --outdir "$OUT" "$PPTX" >/dev/null 2>&1
PDF="$OUT/$(basename "${PPTX%.*}").pdf"
RANGE=()
[ -n "$FIRST" ] && RANGE+=(-f "$FIRST")
[ -n "$LAST" ] && RANGE+=(-l "$LAST")
pdftoppm -jpeg -r 140 ${RANGE[@]+"${RANGE[@]}"} "$PDF" "$OUT/slide"
echo "$OUT"
ls "$OUT"/slide*.jpg
