#!/bin/sh
# Persist Keystatic content + uploaded photos across Zerops deploys.
#
# Important: do NOT symlink content/ or public/* into the volume.
# Keystatic's local tree walker skips directory symlinks → "Bad data".
set -eu

CMS="${CMS_DATA_DIR:-/srv/cms}"
MEDIA_DIRS="galerie vizualizace-foto vizualizace-dokonceno vizualizace pudorysy stav docs"

mkdir -p "$CMS/content" content
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d" "public/$d"
done

# Keep a pristine copy from this deploy before volume restore.
SEED=$(mktemp -d)
cp -a content/. "$SEED/content/" 2>/dev/null || mkdir -p "$SEED/content"
mkdir -p "$SEED/public"
for d in $MEDIA_DIRS; do
  mkdir -p "$SEED/public/$d"
  if [ -d "public/$d" ]; then
    cp -a "public/$d/." "$SEED/public/$d/" 2>/dev/null || true
  fi
done

# First boot: seed volume from deploy.
if [ ! -f "$CMS/.initialized" ]; then
  echo "[cms] seeding persistent volume from deploy..."
  cp -a "$SEED/content/." "$CMS/content/"
  for d in $MEDIA_DIRS; do
    cp -a "$SEED/public/$d/." "$CMS/public/$d/" 2>/dev/null || true
  done
  touch "$CMS/.initialized"
  echo "[cms] seed done"
fi

# Volume → working tree (real files).
echo "[cms] restoring content + media from volume..."
cp -a "$CMS/content/." content/
for d in $MEDIA_DIRS; do
  mkdir -p "public/$d"
  cp -a "$CMS/public/$d/." "public/$d/" 2>/dev/null || true
done

# If site.json is invalid JSON, fall back to deploy seed.
if ! node -e "JSON.parse(require('fs').readFileSync('content/site.json','utf8'))" 2>/dev/null; then
  echo "[cms] site.json invalid — restoring deploy seed"
  cp -a "$SEED/content/." content/
  cp -a content/. "$CMS/content/"
fi

# Drop gallery rows that point at missing files (fixes broken thumbnails).
node scripts/prune-missing-media.mjs || true
cp -a content/site.json "$CMS/content/site.json" 2>/dev/null || true

# Keep volume in sync while the app runs.
(
  while true; do
    sleep 8
    cp -a content/. "$CMS/content/" 2>/dev/null || true
    for d in $MEDIA_DIRS; do
      mkdir -p "$CMS/public/$d"
      cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    done
  done
) &

rm -rf "$SEED"
exec npm run start
