/* zaman-akademik-takvim — Zaman Akademik Takvim — ay şeridi, bugün işareti, kalan gün ve tür süzgeci (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Eğitim yılı takvimi: üstte ay şeridi (her ayda olay noktaları, bugünün ayında dikey işaret ve tarih), yanında sıradaki olaya kalan gün sayacı (sayfa dilinde Intl), kayıt/sınav/tatil gibi tür çipleriyle çoklu süzme; altta olaylar ay ay gruplanmış satırlar (gün, hafta günü, tür, tarih aralığı). Geçmiş olaylar soluk, süren olay vurgulu. JS yokken tüm olaylar ay ay tam liste.
   Üretici: scripts/modul-fabrika (aile timeline) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ etiket (yıl/tarih), baslik, metin?, ikon?, img?, url? }] — metinler dil sözlüğü; başlıksız satır atlanır. */
const P = "modulex-zaman-akademik-takvim";
const IMG_KOK = "/img/";
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
/* --- aile: timeline --- */
const kayitlar = veri.map((o) => ({
  etiket: metinAl(o, ["etiket", "year", "yil", "tarih", "date"]), baslik: metinAl(o, ["baslik", "title", "name"]),
  metin: metinAl(o, ["metin", "text", "description", "aciklama"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  img: medyaUrl(ilk(o, ["img", "image"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const yH = (k, s) => (k.etiket ? `<p class="${P}-${s || "yil"}">${esc(k.etiket)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="" width="800" height="560" loading="lazy" decoding="async" />` : "");
/* --- modül: zaman-akademik-takvim --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = veri.filter((o) => metinAl(o, ["baslik", "title", "name"]));
    const gunAl = (v) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || "").trim()); return m && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1 && +m[3] <= 31 ? m[0] : ""; };
    const tf = (o) => { try { return new Intl.DateTimeFormat(dil || undefined, Object.assign({ timeZone: "UTC" }, o)); } catch (x) { return null; } };
    const tar = (iso) => new Date(`${iso}T00:00:00Z`);
    const bic = (f, iso, y) => { try { return f ? f.format(tar(iso)) : y; } catch (x) { return y; } };
    const fAy = tf({ month: "short" }); const fAyYil = tf({ month: "long", year: "numeric" }); const fYil = tf({ year: "numeric" });
    const fGun = tf({ day: "numeric" }); const fHg = tf({ weekday: "short" }); const fKisa = tf({ day: "numeric", month: "short" });
    const TT = [];
    const E = A.map((k, i) => {
      const o = R[i] || {};
      const t = metinAl(o, ["tur", "type", "kategori", "category"]);
      if (t && !TT.includes(t)) TT.push(t);
      const g = gunAl(k.etiket);
      const son = g ? gunAl(metinAl(o, ["bitis", "son", "end"])) : "";
      return { k, i, g, son: son > g ? son : "", t, ti: t ? TT.indexOf(t) : -1 };
    });
    E.sort((a, b) => (a.g && b.g ? (a.g < b.g ? -1 : a.g > b.g ? 1 : a.i - b.i) : a.g ? -1 : b.g ? 1 : a.i - b.i));
    const id = (x) => `${P}-{{id}}-${x}`;
    const ton = (ti) => (ti > -1 ? ` data-ton="${ti % 4}"` : "");
    const tarihli = E.filter((e) => e.g);
    const aylar = [];
    if (tarihli.length) {
      const dolu = [...new Set(tarihli.map((e) => e.g.slice(0, 7)))];
      let [y, m] = dolu[0].split("-").map(Number);
      const [sy, sm] = dolu[dolu.length - 1].split("-").map(Number);
      if ((sy - y) * 12 + (sm - m) > 14) aylar.push(...dolu);
      else while (y < sy || (y === sy && m <= sm)) { aylar.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } }
    }
    const serit = aylar.length ? `<ol class="${P}-aylar">${aylar.map((a, j) => {
      const ev = tarihli.filter((e) => e.g.startsWith(a));
      const yil = j === 0 || a.endsWith("-01") ? `<span class="${P}-ayyil">${esc(bic(fYil, `${a}-01`, a.slice(0, 4)))}</span>` : "";
      const ic2 = `${yil}<span class="${P}-ayad">${esc(bic(fAy, `${a}-01`, a.slice(5)))}</span><span class="${P}-noktalar" aria-hidden="true">${ev.map((e) => `<span class="${P}-nokta"${ton(e.ti)} data-tur="${e.ti}"></span>`).join("")}</span>`;
      return `<li class="${P}-ay${ev.length ? "" : ` ${P}-ay--bos`}" data-ay="${a}">${ev.length ? `<a class="${P}-aybag" href="#${id(`a${a}`)}">${ic2}</a>` : `<span class="${P}-aybag">${ic2}</span>`}</li>`;
    }).join("")}</ol>` : "";
    const satir = (e) => {
      const k = e.k;
      const tarih = e.g ? `<time class="${P}-tarih" datetime="${e.g}"><span class="${P}-tgun">${esc(bic(fGun, e.g, e.g.slice(8)))}</span><span class="${P}-thg">${esc(bic(fHg, e.g, ""))}</span></time>`
        : k.etiket ? `<p class="${P}-tarih ${P}-tarih--serbest">${esc(k.etiket)}</p>` : `<span class="${P}-tarih" aria-hidden="true"></span>`;
      let aralik = "";
      if (e.son) { try { aralik = fKisa && fKisa.formatRange ? fKisa.formatRange(tar(e.g), tar(e.son)) : ""; } catch (x) { aralik = ""; } }
      const ust = (e.t ? `<span class="${P}-tur">${esc(e.t)}</span>` : "") + (aralik ? `<span class="${P}-aralik">${esc(aralik)}</span>` : "");
      return `<li class="${P}-olay" id="${id(`e${e.i}`)}"${ton(e.ti)} data-tur="${e.ti}"${e.g ? ` data-gun="${e.g}"` : ""}${e.son ? ` data-son="${e.son}"` : ""} data-baslik="${esc(k.baslik)}">${tarih}<div class="${P}-ogovde">${ust ? `<p class="${P}-oust">${ust}</p>` : ""}${bH(k, "kbaslik", "h4")}${mH(k)}</div>${ikonH(k.ikon, `${P}-oikon`)}</li>`;
    };
    const gruplar = [];
    E.forEach((e) => { const a = e.g ? e.g.slice(0, 7) : ""; let g = gruplar.find((x) => x.a === a); if (!g) { g = { a, E: [] }; gruplar.push(g); } g.E.push(e); });
    const grupH = gruplar.map((g) => `<li class="${P}-grup"${g.a ? ` id="${id(`a${g.a}`)}"` : ""}>${g.a ? `<h3 class="${P}-grupad">${esc(bic(fAyYil, `${g.a}-01`, g.a))}</h3>` : ""}<ol class="${P}-olaylar">${g.E.map(satir).join("")}</ol></li>`).join("");
    const cipler = TT.length > 1 ? `<div class="${P}-cipler" role="group"${B.baslik ? ` aria-label="${esc(B.baslik)}"` : ""} data-cipler hidden>${TT.map((t, ti) => `<button type="button" class="${P}-cip" data-ton="${ti % 4}" data-tur="${ti}" aria-pressed="false"><span class="${P}-cnokta" aria-hidden="true"></span>${esc(t)}<span class="${P}-csay">${esc(sayiBicim(E.filter((e) => e.ti === ti).length, 0))}</span></button>`).join("")}</div>` : "";
    const YA = metinAl(des, ["yaklasanAd"]);
    const sayac = tarihli.length ? `<p class="${P}-sayac" data-sayac hidden><span class="${P}-sikon material-symbols-outlined" aria-hidden="true">event_upcoming</span><span class="${P}-syazi">${YA ? `<span class="${P}-sad">${esc(YA)}</span>` : ""}<a class="${P}-sbag" data-sbag href="#${id("g")}"></a></span><span class="${P}-skalan" data-kalan aria-live="polite"></span></p>` : "";
    return `<div class="${P}-takvim" data-takvim>${cipler || sayac ? `<div class="${P}-arac">${sayac}${cipler}</div>` : ""}${serit}<ol class="${P}-gruplar" id="${id("g")}">${grupH}</ol></div>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
