/* ders-programi-tablo — Ders Programı Tablo — gün × saat ızgarası, seviye süzgeci, mobilde gün sekmesi (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Kayıtların `gun` (1–7 ISO ya da dil sözlüğü) ve `saat` alanlarından gün sütunlu, saat satırlı gerçek bir tablo (<table>, th scope); hücrede ders çipi: ad, öğretmen/salon (metin), seviye rozeti (seviyeye göre ton). Üstte `seviye` değerlerinden türeyen çipler tabloyu süzer; 768 px altında gün sekmesi tek gün sütununu gösterir (açılışta bugün). Günü/saati olmayan dersler tablonun altında çip listesi.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-ders-programi-tablo";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: ders-programi-tablo --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const x = (i, ks) => metinAl(R[i] || {}, ks);
    const dk = (v) => { const m = /(\d{1,2})[:.](\d{2})/.exec(v); return m ? (+m[1]) * 60 + (+m[2]) : 9999; };
    const gunAdi = (n) => { try { return new Intl.DateTimeFormat(dil || undefined, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, n, 12))); } catch (e) { return String(n); } };
    const GN = [];
    const SA = [];
    const SV = [];
    const D = A.map((k, i) => {
      const gv = R[i] ? ilk(R[i], ["gun", "day"]) : "";
      const gs = typeof gv === "object" ? NaN : Number(gv);
      const gt = pick(gv).trim();
      let g = -1;
      if (Number.isInteger(gs) && gs >= 1 && gs <= 7) { g = GN.findIndex((z) => z.iso === gs); if (g === -1) { GN.push({ iso: gs, ad: gunAdi(gs), n: gs }); g = GN.length - 1; } }
      else if (gt) { g = GN.findIndex((z) => !z.iso && z.ad === gt); if (g === -1) { GN.push({ iso: 0, ad: gt, n: 100 + GN.length }); g = GN.length - 1; } }
      const sa = x(i, ["saat", "time"]);
      if (sa && !SA.includes(sa)) SA.push(sa);
      const sv = x(i, ["seviye", "level", "sinif"]);
      if (sv && !SV.includes(sv)) SV.push(sv);
      return { k, g: g === -1 ? null : GN[g], sa, sv: sv ? SV.indexOf(sv) : -1, svAd: sv };
    });
    const GS = GN.slice().sort((a, b) => a.n - b.n);
    SA.sort((a, b) => dk(a) - dk(b));
    const cip = (d) => `<div class="${P}-ders ${P}-ders--r${Math.max(0, d.sv) % 4}" data-sev="${d.sv < 0 ? "" : d.sv}">${ikonH(d.k.ikon, `${P}-dikon`)}<strong class="${P}-dad">${esc(d.k.baslik)}</strong>${d.k.metin ? `<span class="${P}-dkim">${satirlar(d.k.metin)}</span>` : ""}${d.svAd ? `<em class="${P}-dsev">${esc(d.svAd)}</em>` : ""}</div>`;
    const tablo = D.filter((d) => d.g && d.sa);
    const serbest = D.filter((d) => !(d.g && d.sa));
    const filtre = SV.length > 1 ? `<div class="${P}-filtre" role="group" aria-label="${esc(metinAl(des, ["seviyeAd"]) || "@category@")}"><button type="button" class="${P}-fcip" data-fsev="" aria-pressed="true">@all@</button>${SV.map((v, j) => `<button type="button" class="${P}-fcip" data-fsev="${j}" aria-pressed="false"><span class="${P}-fnokta ${P}-fnokta--r${j % 4}" aria-hidden="true"></span>${esc(v)}</button>`).join("")}</div>` : "";
    const gunsec = tablo.length && GS.length > 1 ? `<div class="${P}-gunsec" role="tablist" aria-label="${esc(metinAl(des, ["gunAd"]) || B.baslik)}">${GS.map((g, j) => `<button type="button" role="tab" class="${P}-gsec" data-gsec="${j}" data-iso="${g.iso || ""}" aria-selected="${j === 0}">${esc(g.ad)}</button>`).join("")}</div>` : "";
    const tbl = tablo.length ? `<div class="${P}-cerceve"><table class="${P}-tablo"${B.baslik ? ` aria-labelledby="${P}-{{id}}-b"` : ""}><thead><tr><th scope="col" class="${P}-kose">@booking-time@</th>${GS.map((g, j) => `<th scope="col" data-g="${j}">${esc(g.ad)}</th>`).join("")}</tr></thead><tbody>${SA.filter((sa) => tablo.some((d) => d.sa === sa)).map((sa) => `<tr><th scope="row"><bdi dir="ltr">${esc(sa)}</bdi></th>${GS.map((g, j) => { const h = tablo.filter((d) => d.g === g && d.sa === sa); return `<td data-g="${j}"${h.length ? "" : ` class="${P}-bos"`}>${h.map(cip).join("")}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>` : "";
    return `<div class="${P}-program" data-ders><div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div>${filtre || gunsec ? `<div class="${P}-cubuk">${filtre}${gunsec}</div>` : ""}${tbl}${serbest.length ? `<div class="${P}-serbest">${serbest.map(cip).join("")}</div>` : ""}${ctaHtml()}</div>`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
