#!/bin/sh
# Render startup script:
# 1. Copy bundled images from public/uploads/ to the persistent disk (if not already there)
# 2. Start the Next.js production server

DISK_DIR="${RENDER_DISK_PATH:-/var/data}/question-images"
BUNDLE_DIR="./public/uploads"

echo "=== Render Startup: Syncing images to persistent disk ==="

# Create the persistent disk images directory if it doesn't exist
mkdir -p "$DISK_DIR"

# Count existing files on persistent disk
EXISTING=$(find "$DISK_DIR" -maxdepth 1 -type f | wc -l)
echo "Persistent disk has $EXISTING image(s) in $DISK_DIR"

# Copy bundled images that don't already exist on the persistent disk
if [ -d "$BUNDLE_DIR" ]; then
  BUNDLED=$(find "$BUNDLE_DIR" -maxdepth 1 -type f | wc -l)
  echo "Bundle has $BUNDLED image(s) in $BUNDLE_DIR"

  COPIED=0
  for file in "$BUNDLE_DIR"/*; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    if [ ! -f "$DISK_DIR/$filename" ]; then
      cp "$file" "$DISK_DIR/$filename"
      COPIED=$((COPIED + 1))
    fi
  done

  echo "Copied $COPIED new image(s) to persistent disk"
else
  echo "No bundle directory found at $BUNDLE_DIR — skipping image sync"
fi

TOTAL=$(find "$DISK_DIR" -maxdepth 1 -type f | wc -l)
echo "Persistent disk now has $TOTAL image(s)"
echo "=== Starting Next.js server ==="

# Start the Next.js production server
exec npm start
