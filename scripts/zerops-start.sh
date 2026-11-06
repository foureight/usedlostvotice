#!/bin/sh
# Online CMS volume is the only source of content + photos after first boot.
# Deploy must never inject local seed galleries/files into a live site.
set -eu

CMS="${CMS_DATA_DIR:-/srv/cms}"
MEDIA_DIRS="galerie vizualizace-foto vizualizace-dokonceno vizualizace pudorysy stav docs"

mkdir -p "$CMS/content" content
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d" "public/$d"
done

# First boot only: copy deploy tree into empty volume.
if [ ! -f "$CMS/.initialized" ]; then
  echo "[cms] first boot — seeding volume from deploy once"
  cp -a content/. "$CMS/content/" 2>/dev/null || true
  for d in $MEDIA_DIRS; do
    if [ -d "public/$d" ]; then
      cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    fi
  done
  touch "$CMS/.initialized"
fi

# Always: volume → working tree (online wins).
echo "[cms] restoring from volume (online only)..."
cp -a "$CMS/content/." content/
for d in $MEDIA_DIRS; do
  mkdir -p "public/$d"
  # Replace folder contents with volume — do not keep deploy leftovers.
  find "public/$d" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "$CMS/public/$d/." "public/$d/" 2>/dev/null || true
done

# Allow brand-new empty singleton stubs from deploy (e.g. photos.json) if missing online.
SEED_CONTENT=$(mktemp -d)
cp -a content/. "$SEED_CONTENT/" 2>/dev/null || true
# Re-read deploy stubs from image: content was just overwritten by volume;
# pull missing filenames from the built-in image copy kept beside the app if present.
# (No media copy — only JSON stubs.)
for stub in photos.json; do
  if [ ! -f "content/$stub" ] && [ -f "/var/task/content/$stub" ]; then
    cp -a "/var/task/content/$stub" "content/$stub" || true
  fi
done
# Prefer stub baked next to start script package: use git-deployed file from image
# before volume wipe — we saved nothing. Write minimal stub if still missing.
if [ ! -f content/photos.json ]; then
  printf '%s\n' '{"note":"Nahrávání fotek je nahoře. Platí jen fotky uložené online na webu."}' > content/photos.json
fi
rm -rf "$SEED_CONTENT"

# Prune broken refs only — never invent galleries from seed/disk.
node scripts/restore-media-refs.mjs || true

# Sync runtime → volume.
cp -a content/. "$CMS/content/" 2>/dev/null || true
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d"
  find "$CMS/public/$d" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
done

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

exec npm run start
