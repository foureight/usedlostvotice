#!/bin/sh
# Persist Keystatic content + uploaded photos across Zerops deploys.
set -eu

CMS="${CMS_DATA_DIR:-/srv/cms}"
MEDIA_DIRS="galerie vizualizace-foto vizualizace-dokonceno vizualizace pudorysy stav docs"

mkdir -p "$CMS/content"
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d"
done

# First boot: copy deployed seed into the volume.
if [ ! -f "$CMS/.initialized" ]; then
  echo "[cms] seeding persistent volume from deploy..."
  if [ -d content ]; then
    cp -a content/. "$CMS/content/"
  fi
  for d in $MEDIA_DIRS; do
    if [ -d "public/$d" ]; then
      cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    fi
  done
  touch "$CMS/.initialized"
  echo "[cms] seed done"
else
  echo "[cms] using existing persistent volume"
fi

# Point the app at the volume (deploy tree is replaced every push).
rm -rf content
ln -sfn "$CMS/content" content
for d in $MEDIA_DIRS; do
  rm -rf "public/$d"
  ln -sfn "$CMS/public/$d" "public/$d"
done

exec npm run start
