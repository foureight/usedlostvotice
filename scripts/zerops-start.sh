#!/bin/sh
# Rule: what you upload online stays. Deploys never add local photos/content
# into a live volume. Volume (/srv/cms) is the only source after first boot.
set -eu

CMS="${CMS_DATA_DIR:-/srv/cms}"
MEDIA_DIRS="galerie vizualizace-foto vizualizace-dokonceno vizualizace pudorysy stav docs"

mkdir -p "$CMS/content" content
for d in $MEDIA_DIRS; do
  mkdir -p "$CMS/public/$d" "public/$d"
done

# First boot only (empty volume): copy this deploy once, then never again.
if [ ! -f "$CMS/.initialized" ]; then
  echo "[cms] first boot — seed volume once from deploy"
  cp -a content/. "$CMS/content/" 2>/dev/null || true
  for d in $MEDIA_DIRS; do
    if [ -d "public/$d" ]; then
      cp -a "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    fi
  done
  touch "$CMS/.initialized"
fi

# Every start: throw away deploy-local public/content and load ONLINE volume.
echo "[cms] load online volume → app (no local merge)"
rm -rf content
mkdir -p content
cp -a "$CMS/content/." content/

for d in $MEDIA_DIRS; do
  mkdir -p "public/$d"
  # Clear deploy-packaged files in this folder, then restore volume files only.
  find "public/$d" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  if [ -d "$CMS/public/$d" ]; then
    cp -a "$CMS/public/$d/." "public/$d/" 2>/dev/null || true
  fi
done

# Tiny admin stub if volume never had it (no media).
if [ ! -f content/photos.json ]; then
  printf '%s\n' '{"note":"Nahrání jde rovnou na web (volume). Deploy nic nedoplňuje."}' > content/photos.json
  cp -a content/photos.json "$CMS/content/photos.json"
fi

# Drop broken refs only — never add photos from disk/seed.
node scripts/restore-media-refs.mjs || true

# Persist content JSON (after prune) back to volume — do NOT wipe volume media.
cp -a content/. "$CMS/content/" 2>/dev/null || true

# While running: keep volume in sync with uploads/edits (additive copy).
# -u copies only files newer than the volume copy, so the loop no longer
# rewrites every photo/PDF (~20 MB) to the volume every 8 seconds.
(
  while true; do
    sleep 8
    cp -au content/. "$CMS/content/" 2>/dev/null || true
    for d in $MEDIA_DIRS; do
      mkdir -p "$CMS/public/$d"
      cp -au "public/$d/." "$CMS/public/$d/" 2>/dev/null || true
    done
  done
) &

exec npm run start
