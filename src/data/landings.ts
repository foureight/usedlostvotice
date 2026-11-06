/**
 * SEO landing pages — not linked in main nav/footer.
 * Indexed via sitemap for search queries buyers actually use.
 */
export type LandingPage = {
  slug: string;
  /** Primary search phrase people type */
  keyword: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  bullets: string[];
  body: string[];
  relatedKeywords: string[];
};

export const landings: LandingPage[] = [
  {
    slug: "prodej-domu-vodice",
    keyword: "prodej domu Vodice",
    title: "Prodej domu Vodice — Vodice 17 u Tábora, Pilský rybník",
    description:
      "Prodej domu Vodice: Usedlost Vodice 17 (Vodice u Tábora, okres Tábor) na hrázi Pilského rybníka. 5+1, 237 m², pozemek 1 762 m², stodola. Cena 5 150 000 Kč. usedlostvodice.cz",
    h1: "Prodej domu Vodice",
    lead: "Hledáte prodej domu Vodice? Usedlost Vodice je aktuální nabídka domu čp. 17 v obci Vodice u Tábora (okres Tábor) — přímo na hrázi Pilského rybníka. Oficiální web: usedlostvodice.cz.",
    bullets: [
      "Adresa: Vodice 17, 391 53 Vodice (Vodice u Tábora)",
      "Okres Tábor · hráz Pilského rybníka",
      "5+1 · 237 m² užitné · pozemek 1 762 m² · stodola 169 m²",
      "Cena 5 150 000 Kč · zahájená rekonstrukce",
    ],
    body: [
      "Při hledání „prodej domu Vodice“, „dům Vodice“ nebo „Vodice 17 na prodej“ jde o tuto konkrétní usedlost — ne o Vodice u Lhenic na Prachaticku a ne o památkovou usedlost čp. 25.",
      "Kompletní fotky, studie a kontakt na prohlídku najdete na hlavní prezentaci usedlostvodice.cz. Majitel: Michal Burda · makléř: Bio Reality.",
    ],
    relatedKeywords: [
      "prodej domu Vodice u Tábora",
      "dům Vodice 17",
      "usedlost Vodice na prodej",
      "Vodice 17 okres Tábor",
      "prodej usedlosti Vodice",
    ],
  },
  {
    slug: "prodej-domu-tabor",
    keyword: "prodej domu Tábor",
    title: "Prodej domu Tábor a Táborsko — Usedlost Vodice u Pilského rybníka",
    description:
      "Prodej rodinného domu 5+1 na Táborsku (okres Tábor), Vodice 17 u Pilského rybníka. 237 m², pozemek 1 762 m², stodola. Cena 5 150 000 Kč.",
    h1: "Prodej domu Tábor / Táborsko",
    lead: "Hledáte prodej domu Tábor nebo bydlení na Táborsku? Usedlost Vodice je rodinný dům 5+1 asi 25 km od Tábora — na hrázi Pilského rybníka, s velkým pozemkem a stodolou.",
    bullets: [
      "Okres Tábor · Vodice 17 · ~25 km od města Tábor",
      "Dispozice 5+1 · 237 m² užitné · pozemek 1 762 m²",
      "Cena 5 150 000 Kč včetně pozemku (osobní vlastnictví)",
      "Zahájená rekonstrukce — okna, střecha, elektro, peletové topení",
    ],
    body: [
      "Kupující, kteří zadávají „prodej domu Tábor“ nebo „rodinný dům Táborsko“, často hledají klidnější alternativu k městské zástavbě — s dojezdem do Tábora za práci, školy a služby. Usedlost Vodice leží v obci Vodice u Tábora (ne Vodice u Lhenic).",
      "Nemovitost nabízí prostor pro trvalé bydlení i další rozvoj stodoly. Oficiální prezentace: usedlostvodice.cz. Prohlídky domluvíte přímo s majitelem nebo přes Bio Reality.",
    ],
    relatedKeywords: [
      "prodej domu Táborsko",
      "rodinný dům Tábor okolí",
      "dům 5+1 Tábor",
      "prodej usedlosti okres Tábor",
    ],
  },
  {
    slug: "prodej-domu-jizni-cechy",
    keyword: "prodej domu Jižní Čechy",
    title: "Prodej domu Jižní Čechy — usedlost u rybníka na Táborsku",
    description:
      "Prodej domu v Jižních Čechách (Jihočeský kraj): Usedlost Vodice u Pilského rybníka, okres Tábor. 5+1, stodola, pozemek 1 762 m². 5 150 000 Kč.",
    h1: "Prodej domu Jižní Čechy",
    lead: "Hledáte prodej domu Jižní Čechy / Jihočeský kraj s přírodou a klidem? Tato usedlost stojí na hrázi rybníka v okrese Tábor — typické jihočeské okolí rybníků a luk.",
    bullets: [
      "Jihočeský kraj · okres Tábor · Přírodní park Polánka",
      "Poloha u vody: hráz Pilského rybníka",
      "Rodinný dům 5+1 + stodola 169 m²",
      "Dojezd Pacov ~8 km · Tábor ~25 km · Praha ~90 km",
    ],
    body: [
      "Fráze jako „prodej domu Jižní Čechy“, „dům Jihočeský kraj“ nebo „usedlost Jižní Čechy“ často míří na venkovské bydlení u vody. Usedlost Vodice přesně sedí na tento záměr — bez záměny s jinými „Vodicemi“ na Prachaticku.",
      "Detail nabídky, fotky a kontakt najdete na hlavní prezentaci usedlostvodice.cz.",
    ],
    relatedKeywords: [
      "prodej domu Jihočeský kraj",
      "usedlost Jižní Čechy",
      "dům u rybníka Jižní Čechy",
      "venkovský dům Jižní Čechy",
    ],
  },
  {
    slug: "dum-u-rybnika",
    keyword: "dům u rybníka",
    title: "Dům u rybníka k prodeji — Pilský rybník, Vodice u Tábora",
    description:
      "Dům u rybníka na prodej: Usedlost Vodice přímo na hrázi Pilského rybníka (okres Tábor). 5+1, pozemek 1 762 m², stodola. 5 150 000 Kč.",
    h1: "Dům u rybníka k prodeji",
    lead: "Hledáte dům u rybníka — bydlení u vody s výhledem a klidem? Usedlost Vodice stojí přímo na hrázi Pilského rybníka, na hranici Přírodního parku Polánka.",
    bullets: [
      "Poloha: hráz Pilského rybníka · Vodice 17",
      "Výhled na vodu a okolní krajinu",
      "Pozemek 1 762 m² · stodola k dalšímu využití",
      "Cena 5 150 000 Kč",
    ],
    body: [
      "Dotazy „dům u rybníka“, „prodej domu u vody“ nebo „Pilský rybník bydlení“ patří mezi typické záměry lidí, kteří chtějí venkov + kontakt s přírodou. Tato nabídka je jedna konkrétní usedlost — ne chatová osada.",
      "Prohlídka na místě nejlíp ukáže atmosféru. Kontakt a termín na usedlostvodice.cz.",
    ],
    relatedKeywords: [
      "Pilský rybník bydlení",
      "prodej domu u vody",
      "dům u rybníka Táborsko",
      "usedlost u rybníka",
    ],
  },
  {
    slug: "dum-se-stodolou",
    keyword: "dům se stodolou",
    title: "Dům se stodolou a pozemkem — Usedlost Vodice (Táborsko)",
    description:
      "Prodej domu se stodolou: 5+1, stodola 169 m², pozemek 1 762 m². Vodice u Tábora, hráz Pilského rybníka. Cena 5 150 000 Kč.",
    h1: "Dům se stodolou a pozemkem",
    lead: "Hledáte dům se stodolou, dílnou nebo hospodářským zázemím? Součástí Usedlosti Vodice je stodola 169 m² a velký pozemek — prostor pro zahradu, sklad i budoucí přestavbu.",
    bullets: [
      "Stodola 169 m² · pozemek 1 762 m²",
      "Rodinný dům 5+1 · 237 m² užitné",
      "Zahájená rekonstrukce domu",
      "Možnost dostavby se stejným týmem (MY76 / Atelier SAD)",
    ],
    body: [
      "Kupující často kombinují „dům se stodolou“, „usedlost stodola pozemek“ nebo „vesnický dům hospodářské budovy“. Tahle nabídka spojuje obytnou část s hospodářským objektem v jednom celku u rybníka.",
      "Studie a fotky jsou na usedlostvodice.cz — domluvte si prohlídku.",
    ],
    relatedKeywords: [
      "usedlost stodola pozemek",
      "prodej usedlosti se stodolou",
      "vesnický dům stodola",
      "dům dílna pozemek Táborsko",
    ],
  },
  {
    slug: "dum-k-rekonstrukci-taborsko",
    keyword: "dům k rekonstrukci Táborsko",
    title: "Dům k rekonstrukci Táborsko — zahájená rekonstrukce u rybníka",
    description:
      "Dům s zahájenou rekonstrukcí na Táborsku: Vodice u Tábora, 5+1, peletové topení, nová okna a střecha. Stodola + pozemek. 5 150 000 Kč.",
    h1: "Dům s zahájenou rekonstrukcí na Táborsku",
    lead: "Hledáte dům k rekonstrukci nebo naopak dům, kde už je hrubá práce rozjetá? U Usedlosti Vodice je rekonstrukce zahájená (okna s trojskly, zateplená střecha, elektro, peletové vytápění) — můžete navázat vlastním dokončením.",
    bullets: [
      "Stav: zahájená velkorysá rekonstrukce",
      "Architektura: Dílna architektury · realizace MY76 / Atelier SAD",
      "Prostor dokončit interiéry podle sebe",
      "Stodola zůstává příležitostí k dalšímu využití",
    ],
    body: [
      "Lidé při koupi často hledají „dům k rekonstrukci“, „dům po rekonstrukci“ nebo „usedlost rekonstrukce“. Tato nemovitost sedí spíš na střed: práce už začaly, ale prostor pro vlastní dokončení zbývá.",
      "Detaily, studie a kontakt: usedlostvodice.cz.",
    ],
    relatedKeywords: [
      "dům k rekonstrukci okres Tábor",
      "usedlost rekonstrukce",
      "prodej domu zahájená rekonstrukce",
      "rodinný dům peletové topení Táborsko",
    ],
  },
  {
    slug: "prodej-domu-pacov",
    keyword: "prodej domu Pacov",
    title: "Prodej domu Pacov a okolí — Usedlost Vodice (~8 km)",
    description:
      "Prodej domu v okolí Pacova: Usedlost Vodice asi 8 km od Pacova, u Pilského rybníka. 5+1, stodola, pozemek 1 762 m². 5 150 000 Kč.",
    h1: "Prodej domu Pacov a okolí",
    lead: "Hledáte prodej domu Pacov nebo bydlení v okolí Pacova s dojezdem do města? Usedlost Vodice je asi 8 km od Pacova — klid obce u rybníka, služby Pacova na dosah.",
    bullets: [
      "Vzdálenost Pacov ≈ 8 km",
      "Vodice u Tábora · Pilský rybník",
      "5+1 · stodola · pozemek 1 762 m²",
      "Cena 5 150 000 Kč",
    ],
    body: [
      "Lokální dotazy typu „prodej domu Pacov“, „dům Pacov okolí“ nebo „usedlost u Pacova“ míří na stejný region jako Táborsko. Tato usedlost je konkrétní adresa Vodice 17 — vhodná i pro dojezd do Pacova.",
      "Prohlídky a formulář na usedlostvodice.cz.",
    ],
    relatedKeywords: [
      "dům Pacov okolí",
      "prodej usedlosti Pacov",
      "rodinný dům u Pacova",
      "Vodice u Pacova dům",
    ],
  },
];

export function getLanding(slug: string): LandingPage | undefined {
  return landings.find((l) => l.slug === slug);
}

export function getLandingSlugs(): string[] {
  return landings.map((l) => l.slug);
}
