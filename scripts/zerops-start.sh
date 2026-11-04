#!/bin/sh
# Persist Keystatic content + uploaded photos across Zerops deploys.
#
# Important: do NOT symlink content/ or public/* into the volume.
# Keystatic's local tree walker uses Dirent.isDirectory()/isFile() and
# skips directory symlinks → singleton shows "Bad data" / Create.
set -eu

CMS="${CMS_DATA_DIR:-/srv/cms}"
MEDIA_DIRS="galerie vizualizace-foto vizualizace-dokonceno vizualizace pudorysy stav docs"

mkdir -p "$CMS/content"
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d" "public/$d"
done
mkdir -p content

# First boot: copy deployed seed into the volume.
if [ ! -f "$CMS/.initialized" ]; then
  echo "[cms] seeding persistent volume from deploy..."
  if [ -d content ] && [ "$(ls -A content 2>/dev/null || true)" != "" ]; then
    cp -a content/. "$CMS/content/"
  fi
  for d in $MEDIA_DIRS; do
    if [ -d "public/$d" ] && [ "$(ls -A "public/$d" 2>/dev/null || true)" != "" ]; then
      cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    fi
  done
  touch "$CMS/.initialized"
  echo "[cms] seed done"
fi

# Volume → working tree (real files so Keystatic can read them).
echo "[cms] restoring content + media from volume..."
cp -a "$CMS/content/." content/
for d in $MEDIA_DIRS; do
  mkdir -p "public/$d"
  cp -a "$CMS/public/$d/." "public/$d/" 2>/dev/null || true
done

# Keep volume in sync while the app runs (admin uploads / Keystatic Save).
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
