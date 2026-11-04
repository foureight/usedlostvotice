"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type GalleryItem = { src?: string; alt?: string; kind?: string; label?: string };
type TabId =
  | "zaklad"
  | "lokalita"
  | "parametry"
  | "texty"
  | "galerie"
  | "fotovize"
  | "faq"
  | "dostavba"
  | "kontakty"
  | "seo"
  | "email"
  | "poptavky";

const TABS: { id: TabId; label: string }[] = [
  { id: "zaklad", label: "Základ" },
  { id: "lokalita", label: "Lokalita" },
  { id: "parametry", label: "Parametry" },
  { id: "texty", label: "Texty" },
  { id: "galerie", label: "Galerie" },
  { id: "fotovize", label: "Fotovize" },
  { id: "faq", label: "FAQ" },
  { id: "dostavba", label: "Dostavba" },
  { id: "kontakty", label: "Kontakty" },
  { id: "seo", label: "SEO / AI" },
  { id: "email", label: "E-mail" },
  { id: "poptavky", label: "Poptávky" },
];

const GALLERY_TARGETS = [
  { id: "gallery", field: "gallery", label: "Galerie", needsKind: true },
  { id: "visualizationsPhoto", field: "visualizationsPhoto", label: "Fotovize", needsKind: false },
  {
    id: "visualizationsDokonceno",
    field: "visualizationsDokonceno",
    label: "Vize dokončení",
    needsKind: false,
  },
  { id: "visualizations", field: "visualizations", label: "Studie", needsKind: false },
  { id: "plans", field: "plans", label: "Půdorysy", needsKind: false },
] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  multiline,
  type = "text",
}: {
  value: string | number | undefined;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  if (multiline) {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    );
  }
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function StringListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="admin-list-block">
      <div className="admin-list-head">
        <strong>{label}</strong>
        <button
          type="button"
          className="admin-btn ghost"
          onClick={() => onChange([...(values || []), ""])}
        >
          + Přidat
        </button>
      </div>
      {(values || []).map((item, i) => (
        <div key={i} className="admin-list-row">
          <textarea
            value={item}
            rows={2}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="admin-btn danger"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
          >
            Smazat
          </button>
        </div>
      ))}
    </div>
  );
}

function GalleryEditor({
  items,
  onChange,
  showKind,
  showLabel,
}: {
  items: GalleryItem[];
  onChange: (next: GalleryItem[]) => void;
  showKind?: boolean;
  showLabel?: boolean;
}) {
  return (
    <div className="admin-gallery">
      {(items || []).map((item, i) => (
        <div key={`${item.src}-${i}`} className="admin-gallery-card">
          <div className="admin-gallery-thumb">
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt={item.alt || ""} />
            ) : (
              <div className="admin-gallery-empty">Bez fotky</div>
            )}
          </div>
          <div className="admin-gallery-fields">
            <Field label="Cesta">
              <TextInput
                value={item.src || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, src: v };
                  onChange(next);
                }}
              />
            </Field>
            <Field label="Popisek / alt">
              <TextInput
                value={item.alt || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, alt: v };
                  onChange(next);
                }}
              />
            </Field>
            {showLabel ? (
              <Field label="Label">
                <TextInput
                  value={item.label || ""}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = { ...item, label: v };
                    onChange(next);
                  }}
                />
              </Field>
            ) : null}
            {showKind ? (
              <Field label="Typ">
                <select
                  value={item.kind || "exterier"}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, kind: e.target.value };
                    onChange(next);
                  }}
                >
                  <option value="exterier">Exteriér</option>
                  <option value="interier">Interiér</option>
                  <option value="stav">Stav</option>
                </select>
              </Field>
            ) : null}
            <div className="admin-row-actions">
              <button
                type="button"
                className="admin-btn ghost"
                disabled={i === 0}
                onClick={() => {
                  if (i === 0) return;
                  const next = [...items];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-btn ghost"
                disabled={i === items.length - 1}
                onClick={() => {
                  if (i >= items.length - 1) return;
                  const next = [...items];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChange(next);
                }}
              >
                ↓
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminApp({ authenticated }: { authenticated: boolean }) {
  const [authed, setAuthed] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<TabId>("zaklad");
  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [seo, setSeo] = useState<Record<string, unknown> | null>(null);
  const [smtp, setSmtp] = useState<Record<string, unknown> | null>(null);
  const [inquiries, setInquiries] = useState<
    {
      slug: string;
      name?: string;
      email?: string;
      phone?: string;
      note?: string;
      createdAt?: string;
      status?: string;
    }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<(typeof GALLERY_TARGETS)[number]["id"]>(
    "gallery",
  );
  const [uploadKind, setUploadKind] = useState("exterier");

  const location = (site?.location || {}) as Record<string, unknown>;
  const specs = (site?.specs || {}) as Record<string, unknown>;
  const architecture = (site?.architecture || {}) as Record<string, unknown>;
  const completion = (site?.completion || {}) as Record<string, unknown>;
  const contact = (site?.contact || {}) as Record<string, unknown>;

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/content", { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Načtení selhalo (${res.status})`);
    const data = await res.json();
    setSite(data.site);
    setSeo(data.seo);
    setSmtp(data.smtp);
    setInquiries(data.inquiries || []);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load().catch((err) => {
      setError(true);
      setMessage(String(err.message || err));
    });
  }, [authed, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setMessage("");
    const res = await fetch("/api/admin/content", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError(true);
      setMessage("Špatné heslo.");
      return;
    }
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/admin/content", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthed(false);
    setSite(null);
    setSeo(null);
    setSmtp(null);
    setPassword("");
  }

  const patchSite = (patch: Record<string, unknown>) =>
    setSite((prev) => (prev ? { ...prev, ...patch } : prev));

  const patchNested = (
    key: string,
    nested: Record<string, unknown>,
  ) =>
    setSite((prev) =>
      prev
        ? {
            ...prev,
            [key]: { ...((prev[key] as Record<string, unknown>) || {}), ...nested },
          }
        : prev,
    );

  async function save() {
    if (!site || !seo || !smtp) return;
    setBusy(true);
    setError(false);
    setMessage("Ukládám…");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ site, seo, smtp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Uložení selhalo (${res.status})`);
      setSite(data.site);
      setSeo(data.seo);
      setSmtp(data.smtp);
      setMessage("Uloženo. Změny jsou hned na webu.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Uložení selhalo");
    } finally {
      setBusy(false);
    }
  }

  async function runRepair() {
    setBusy(true);
    setError(false);
    setMessage("Opravuji a zmenšuji fotky…");
    try {
      const res = await fetch("/api/admin/repair", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Oprava selhala (${res.status})`);
      await load();
      setMessage(
        `Opraveno: −${data.removedCount ?? 0} chybějících, zmenšeno ${data.optimized ?? 0} fotek.`,
      );
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Oprava selhala");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploadBusy(true);
    setError(false);
    setMessage(`Nahrávám ${files.length} fotek…`);
    try {
      const list = [...files];
      let uploaded = 0;
      for (let i = 0; i < list.length; i += 3) {
        const chunk = list.slice(i, i + 3);
        const form = new FormData();
        form.set("target", uploadTarget);
        form.set("kind", uploadKind);
        for (const file of chunk) form.append("files", file);
        const res = await fetch("/api/admin/photos", {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Upload selhal (${res.status})`);
        uploaded += data.added ?? chunk.length;
      }
      await load();
      setMessage(`Nahráno ${uploaded} fotek (automaticky zmenšeno).`);
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Upload selhal");
    } finally {
      setUploadBusy(false);
    }
  }

  const uploadMeta = useMemo(
    () => GALLERY_TARGETS.find((t) => t.id === uploadTarget)!,
    [uploadTarget],
  );

  if (!authed) {
    return (
      <div className="admin-shell admin-login">
        <div className="admin-login-card">
          <p className="admin-kicker">Usedlost Vodice</p>
          <h1>Administrace</h1>
          <p className="admin-muted">
            Přihlaste se pro editaci textů a fotek na webu.
          </p>
          <form onSubmit={login} className="admin-login-form">
            <Field label="Heslo">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
            </Field>
            {message ? (
              <p className={`admin-status ${error ? "err" : "ok"}`}>{message}</p>
            ) : null}
            <button type="submit" className="admin-btn primary">
              Přihlásit
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!site || !seo || !smtp) {
    return (
      <div className="admin-shell">
        <p className="admin-status">{message || "Načítám administraci…"}</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <p className="admin-kicker">Usedlost Vodice</p>
          <h1>Administrace webu</h1>
        </div>
        <div className="admin-top-actions">
          <a className="admin-btn ghost" href="/" target="_blank" rel="noreferrer">
            Otevřít web
          </a>
          <button type="button" className="admin-btn ghost" onClick={logout}>
            Odhlásit
          </button>
          <button type="button" className="admin-btn ghost" disabled={busy} onClick={runRepair}>
            Opravit / zmenšit fotky
          </button>
          <button type="button" className="admin-btn primary" disabled={busy} onClick={save}>
            {busy ? "Ukládám…" : "Uložit změny"}
          </button>
        </div>
      </header>

      {message ? (
        <p className={`admin-status ${error ? "err" : "ok"}`}>{message}</p>
      ) : null}

      <section className="admin-upload">
        <strong>Nahrát fotky</strong>
        <select
          value={uploadTarget}
          onChange={(e) =>
            setUploadTarget(e.target.value as (typeof GALLERY_TARGETS)[number]["id"])
          }
          disabled={uploadBusy}
        >
          {GALLERY_TARGETS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {uploadMeta.needsKind ? (
          <select
            value={uploadKind}
            onChange={(e) => setUploadKind(e.target.value)}
            disabled={uploadBusy}
          >
            <option value="exterier">Exteriér</option>
            <option value="interier">Interiér</option>
            <option value="stav">Stav</option>
          </select>
        ) : null}
        <label className="admin-btn primary file">
          {uploadBusy ? "Nahrávám…" : "Vybrat soubory"}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploadBusy}
            onChange={(e) => {
              void onUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <span className="admin-muted">PNG/JPEG se při uploadu zmenší na max. 2000 px.</span>
      </section>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === "zaklad" ? (
          <div className="admin-grid">
            <Field label="Brand">
              <TextInput value={String(site.brand || "")} onChange={(v) => patchSite({ brand: v })} />
            </Field>
            <Field label="Hlavní titulek">
              <TextInput value={String(site.title || "")} onChange={(v) => patchSite({ title: v })} multiline />
            </Field>
            <Field label="Krátký titulek">
              <TextInput
                value={String(site.shortTitle || "")}
                onChange={(v) => patchSite({ shortTitle: v })}
              />
            </Field>
            <Field label="Cena (Kč)">
              <TextInput
                type="number"
                value={Number(site.price || 0)}
                onChange={(v) => patchSite({ price: Number(v) || 0 })}
              />
            </Field>
            <Field label="Cena (zobrazení)">
              <TextInput
                value={String(site.priceLabel || "")}
                onChange={(v) => patchSite({ priceLabel: v })}
              />
            </Field>
            <Field label="Poznámka k ceně">
              <TextInput
                value={String(site.priceNote || "")}
                onChange={(v) => patchSite({ priceNote: v })}
              />
            </Field>
            <Field label="URL inzerátu">
              <TextInput
                value={String(site.listingUrl || "")}
                onChange={(v) => patchSite({ listingUrl: v })}
              />
            </Field>
            <Field label="ID inzerátu">
              <TextInput
                value={String(site.listingId || "")}
                onChange={(v) => patchSite({ listingId: v })}
              />
            </Field>
          </div>
        ) : null}

        {tab === "lokalita" ? (
          <div className="admin-grid">
            {(
              [
                ["village", "Obec"],
                ["houseNumber", "Číslo popisné"],
                ["postalCode", "PSČ"],
                ["cadastral", "Katastr"],
                ["district", "Okres"],
                ["region", "Kraj"],
                ["country", "Země"],
                ["addressLine", "Adresa"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  value={String(location[key] || "")}
                  onChange={(v) => patchNested("location", { [key]: v })}
                />
              </Field>
            ))}
            <Field label="Parcelní číslo">
              <TextInput
                multiline
                value={String(location.parcel || "")}
                onChange={(v) => patchNested("location", { parcel: v })}
              />
            </Field>
            <Field label="Popis okolí">
              <TextInput
                multiline
                value={String(location.vicinity || "")}
                onChange={(v) => patchNested("location", { vicinity: v })}
              />
            </Field>
            <Field label="Zeměpisná šířka">
              <TextInput
                type="number"
                value={Number(location.geoLat || 0)}
                onChange={(v) => patchNested("location", { geoLat: Number(v) })}
              />
            </Field>
            <Field label="Zeměpisná délka">
              <TextInput
                type="number"
                value={Number(location.geoLng || 0)}
                onChange={(v) => patchNested("location", { geoLng: Number(v) })}
              />
            </Field>
            <StringListEditor
              label="V okolí"
              values={(location.nearby as string[]) || []}
              onChange={(nearby) => patchNested("location", { nearby })}
            />
          </div>
        ) : null}

        {tab === "parametry" ? (
          <div className="admin-grid">
            {(
              [
                ["usableArea", "Užitná plocha"],
                ["builtUpHouse", "Zastavěná dům"],
                ["builtUpBarn", "Zastavěná stodola"],
                ["plotArea", "Pozemek"],
                ["gardenArea", "Zahrada"],
                ["floors", "Podlaží"],
                ["basementFloors", "Suterén"],
                ["rooms", "Pokojů"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  type="number"
                  value={Number(specs[key] || 0)}
                  onChange={(v) => patchNested("specs", { [key]: Number(v) || 0 })}
                />
              </Field>
            ))}
            {(
              [
                ["disposition", "Dispozice"],
                ["construction", "Konstrukce"],
                ["ownership", "Vlastnictví"],
                ["furnishing", "Vybavení"],
                ["energy", "PENB"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  value={String(specs[key] || "")}
                  onChange={(v) => patchNested("specs", { [key]: v })}
                />
              </Field>
            ))}
            <Field label="Stav">
              <TextInput
                multiline
                value={String(specs.condition || "")}
                onChange={(v) => patchNested("specs", { condition: v })}
              />
            </Field>
            <StringListEditor
              label="Sítě"
              values={(specs.utilities as string[]) || []}
              onChange={(utilities) => patchNested("specs", { utilities })}
            />
          </div>
        ) : null}

        {tab === "texty" ? (
          <>
            <StringListEditor
              label="Úvodní texty"
              values={(site.summary as string[]) || []}
              onChange={(summary) => patchSite({ summary })}
            />
            <div className="admin-list-block">
              <div className="admin-list-head">
                <strong>Highlights</strong>
                <button
                  type="button"
                  className="admin-btn ghost"
                  onClick={() =>
                    patchSite({
                      highlights: [
                        ...((site.highlights as { title: string; text: string }[]) || []),
                        { title: "", text: "" },
                      ],
                    })
                  }
                >
                  + Přidat
                </button>
              </div>
              {((site.highlights as { title: string; text: string }[]) || []).map((h, i) => (
                <div key={i} className="admin-list-row stack">
                  <input
                    placeholder="Název"
                    value={h.title}
                    onChange={(e) => {
                      const highlights = [...((site.highlights as { title: string; text: string }[]) || [])];
                      highlights[i] = { ...h, title: e.target.value };
                      patchSite({ highlights });
                    }}
                  />
                  <textarea
                    placeholder="Text"
                    rows={3}
                    value={h.text}
                    onChange={(e) => {
                      const highlights = [...((site.highlights as { title: string; text: string }[]) || [])];
                      highlights[i] = { ...h, text: e.target.value };
                      patchSite({ highlights });
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() =>
                      patchSite({
                        highlights: ((site.highlights as { title: string; text: string }[]) || []).filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    Smazat
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {tab === "galerie" ? (
          <GalleryEditor
            showKind
            items={(site.gallery as GalleryItem[]) || []}
            onChange={(gallery) => patchSite({ gallery })}
          />
        ) : null}

        {tab === "fotovize" ? (
          <div className="admin-stack">
            <h2>Fotovize</h2>
            <GalleryEditor
              items={(site.visualizationsPhoto as GalleryItem[]) || []}
              onChange={(visualizationsPhoto) => patchSite({ visualizationsPhoto })}
            />
            <h2>Vize dokončení</h2>
            <GalleryEditor
              items={(site.visualizationsDokonceno as GalleryItem[]) || []}
              onChange={(visualizationsDokonceno) => patchSite({ visualizationsDokonceno })}
            />
            <h2>Studie</h2>
            <GalleryEditor
              items={(site.visualizations as GalleryItem[]) || []}
              onChange={(visualizations) => patchSite({ visualizations })}
            />
            <h2>Půdorysy</h2>
            <GalleryEditor
              showLabel
              items={(site.plans as GalleryItem[]) || []}
              onChange={(plans) => patchSite({ plans })}
            />
          </div>
        ) : null}

        {tab === "faq" ? (
          <div className="admin-list-block">
            <div className="admin-list-head">
              <strong>FAQ</strong>
              <button
                type="button"
                className="admin-btn ghost"
                onClick={() =>
                  patchSite({
                    faqs: [...((site.faqs as { q: string; a: string }[]) || []), { q: "", a: "" }],
                  })
                }
              >
                + Přidat
              </button>
            </div>
            {((site.faqs as { q: string; a: string }[]) || []).map((f, i) => (
              <div key={i} className="admin-list-row stack">
                <input
                  placeholder="Otázka"
                  value={f.q}
                  onChange={(e) => {
                    const faqs = [...((site.faqs as { q: string; a: string }[]) || [])];
                    faqs[i] = { ...f, q: e.target.value };
                    patchSite({ faqs });
                  }}
                />
                <textarea
                  placeholder="Odpověď"
                  rows={4}
                  value={f.a}
                  onChange={(e) => {
                    const faqs = [...((site.faqs as { q: string; a: string }[]) || [])];
                    faqs[i] = { ...f, a: e.target.value };
                    patchSite({ faqs });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={() =>
                    patchSite({
                      faqs: ((site.faqs as { q: string; a: string }[]) || []).filter((_, j) => j !== i),
                    })
                  }
                >
                  Smazat
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "dostavba" ? (
          <div className="admin-grid">
            <Field label="Studio">
              <TextInput
                value={String(architecture.studio || "")}
                onChange={(v) => patchNested("architecture", { studio: v })}
              />
            </Field>
            <Field label="Název studie">
              <TextInput
                value={String(architecture.studyTitle || "")}
                onChange={(v) => patchNested("architecture", { studyTitle: v })}
              />
            </Field>
            <Field label="Rok studie">
              <TextInput
                type="number"
                value={Number(architecture.studyYear || 0)}
                onChange={(v) => patchNested("architecture", { studyYear: Number(v) || 0 })}
              />
            </Field>
            <Field label="Investoři">
              <TextInput
                value={String(architecture.investors || "")}
                onChange={(v) => patchNested("architecture", { investors: v })}
              />
            </Field>
            <Field label="E-mail studia">
              <TextInput
                value={String(architecture.email || "")}
                onChange={(v) => patchNested("architecture", { email: v })}
              />
            </Field>
            <Field label="PDF cesta">
              <TextInput
                value={String(architecture.pdf || "")}
                onChange={(v) => patchNested("architecture", { pdf: v })}
              />
            </Field>
            <Field label="Koncept">
              <TextInput
                multiline
                value={String(architecture.concept || "")}
                onChange={(v) => patchNested("architecture", { concept: v })}
              />
            </Field>
            <StringListEditor
              label="Autoři"
              values={(architecture.authors as string[]) || []}
              onChange={(authors) => patchNested("architecture", { authors })}
            />
            <Field label="Tým">
              <TextInput
                value={String(completion.team || "")}
                onChange={(v) => patchNested("completion", { team: v })}
              />
            </Field>
            <Field label="Partner">
              <TextInput
                value={String(completion.partner || "")}
                onChange={(v) => patchNested("completion", { partner: v })}
              />
            </Field>
            <Field label="URL týmu">
              <TextInput
                value={String(completion.teamUrl || "")}
                onChange={(v) => patchNested("completion", { teamUrl: v })}
              />
            </Field>
            <Field label="URL partnera">
              <TextInput
                value={String(completion.partnerUrl || "")}
                onChange={(v) => patchNested("completion", { partnerUrl: v })}
              />
            </Field>
            <Field label="Nadpis sekce">
              <TextInput
                value={String(completion.headline || "")}
                onChange={(v) => patchNested("completion", { headline: v })}
              />
            </Field>
            <StringListEditor
              label="Texty sekce"
              values={(completion.text as string[]) || []}
              onChange={(text) => patchNested("completion", { text })}
            />
          </div>
        ) : null}

        {tab === "kontakty" ? (
          <div className="admin-grid">
            {(
              [
                ["ownerName", "Majitel — jméno"],
                ["ownerNote", "Majitel — poznámka"],
                ["ownerEmail", "Majitel — e-mail"],
                ["ownerPhone", "Majitel — telefon"],
                ["agentName", "Agent — jméno"],
                ["agentNote", "Agent — poznámka"],
                ["agentEmail", "Agent — e-mail"],
                ["agentPhone", "Agent — telefon"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  value={String(contact[key] || "")}
                  onChange={(v) => patchNested("contact", { [key]: v })}
                />
              </Field>
            ))}
          </div>
        ) : null}

        {tab === "seo" ? (
          <div className="admin-grid">
            <Field label="SEO title">
              <TextInput
                value={String(seo.seoTitle || "")}
                onChange={(v) => setSeo({ ...seo, seoTitle: v })}
              />
            </Field>
            <Field label="SEO description">
              <TextInput
                multiline
                value={String(seo.seoDescription || "")}
                onChange={(v) => setSeo({ ...seo, seoDescription: v })}
              />
            </Field>
            <Field label="AI shrnutí">
              <TextInput
                multiline
                value={String(seo.aioSummary || "")}
                onChange={(v) => setSeo({ ...seo, aioSummary: v })}
              />
            </Field>
            <StringListEditor
              label="Keywords"
              values={(seo.keywords as string[]) || []}
              onChange={(keywords) => setSeo({ ...seo, keywords })}
            />
            <StringListEditor
              label="SEO odstavce"
              values={(seo.seoBody as string[]) || []}
              onChange={(seoBody) => setSeo({ ...seo, seoBody })}
            />
            <StringListEditor
              label="GEO odstavce"
              values={(seo.geoBody as string[]) || []}
              onChange={(geoBody) => setSeo({ ...seo, geoBody })}
            />
            <StringListEditor
              label="AI bullets"
              values={(seo.aioBullets as string[]) || []}
              onChange={(aioBullets) => setSeo({ ...seo, aioBullets })}
            />
          </div>
        ) : null}

        {tab === "email" ? (
          <div className="admin-grid">
            <label className="admin-field checkbox">
              <input
                type="checkbox"
                checked={Boolean(smtp.enabled)}
                onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })}
              />
              <span>Odesílání e-mailů zapnuto</span>
            </label>
            {(
              [
                ["host", "SMTP host"],
                ["user", "Uživatel"],
                ["password", "Heslo"],
                ["fromEmail", "From e-mail"],
                ["fromName", "From jméno"],
                ["toEmail", "To"],
                ["ccEmail", "Cc"],
                ["subjectPrefix", "Prefix předmětu"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  type={key === "password" ? "password" : "text"}
                  value={String(smtp[key] || "")}
                  onChange={(v) => setSmtp({ ...smtp, [key]: v })}
                />
              </Field>
            ))}
            <Field label="Port">
              <TextInput
                type="number"
                value={Number(smtp.port || 587)}
                onChange={(v) => setSmtp({ ...smtp, port: Number(v) || 587 })}
              />
            </Field>
            <label className="admin-field checkbox">
              <input
                type="checkbox"
                checked={Boolean(smtp.secure)}
                onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
              />
              <span>TLS/SSL (secure)</span>
            </label>
          </div>
        ) : null}

        {tab === "poptavky" ? (
          <div className="admin-inquiries">
            {inquiries.length === 0 ? <p className="admin-muted">Zatím žádné poptávky.</p> : null}
            {inquiries.map((row) => (
              <article key={row.slug} className="admin-inquiry">
                <header>
                  <strong>{row.name || "Bez jména"}</strong>
                  <span>{row.createdAt || ""}</span>
                </header>
                <p>
                  <a href={`mailto:${row.email}`}>{row.email}</a>
                  {row.phone ? ` · ${row.phone}` : ""}
                </p>
                <p>{row.note}</p>
                <p className="admin-muted">Stav: {row.status || "new"}</p>
              </article>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
