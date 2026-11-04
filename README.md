# Usedlost Vodice

Samostatná prezentace prodeje domu ve Vodicích u Tábora (Pilský rybník).

## Spuštění

```bash
npm install
npm run dev
```

Otevřete [http://127.0.0.1:43210](http://127.0.0.1:43210).

## Administrace

Admin: [http://127.0.0.1:43210/keystatic](http://127.0.0.1:43210/keystatic)

Chráněno HTTP Basic Auth — nastavte `ADMIN_USER` a `ADMIN_PASSWORD` / `KEYSTATIC_ADMIN_PASSWORD` v `.env.local` / Zerops.

- **Celý web** — texty, cena, FAQ, galerie, místa…
- **Poptávky** — záznamy z kontaktního formuláře (stav Nová / Kontaktováno / Vyřízeno)
- **E-mail / SMTP** — host, port, přihlášení, příjemci poptávek z formuláře

Na produkci: https://usedlostvodice.cz/keystatic (zkratka `/zmensito` přesměruje sem — Keystatic vyžaduje cestu `/keystatic`). SMTP heslo můžete nastavit i jako env `SMTP_PASSWORD` (má přednost).

Poptávky se ukládají do `content/inquiries/`. Při novém deployi na Zerops se runtime soubory mohou přepsat — SMTP e-mail zůstává zálohou.

## Zerops

Projekt `usedlost-vodice` běží na Zerops (org foureight).

- Preview: https://app-32c6-3000.prg1.zerops.app
- Deploy bez GitHubu: `zcli push app -P <PROJECT_ID> --setup app`
- Import / recreate: `zerops-import.yml` (minRam 1 GB — Next.js na LIGHT 0.12 GB OOM)

Až bude kód na `foureight/usedlostvotice`, napojte Pipelines & CI/CD (větev `main`, setup `app`) a nastavte `NEXT_PUBLIC_SITE_URL` na ostrou doménu.

Lokálně ověřte build: `npm run build && npm run start`.

## Obsah

- Texty: `src/data/property.ts`
- Fotky: `public/galerie`, `public/stav`, `public/vizualizace*`
- PDF studie: `public/docs`
