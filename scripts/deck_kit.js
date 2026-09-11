// deck_kit.js — slide shells, layout blocks and cloud-diagram primitives for pptxgenjs.
//
//   const pptx = require("pptxgenjs");
//   const kit  = require("./scripts/deck_kit.js");
//   const p = new pptx(); p.layout = "LAYOUT_WIDE";
//   const k = kit.bind(p, { logo: "assets/logo/ink.png", logoDark: "assets/logo/white.png" });
//
// Every value is inches on a 13.333 x 7.5 slide. Blocks that stack return their own
// bottom edge — use it rather than guessing the next y and finding the overlap later.

const DEFAULT_THEME = {
  ink: "0F172A", brand: "2563EB", spark: "0EA5E9",
  paper: "F8FAFC", white: "FFFFFF", tint: "EFF4FF", rule: "DDE3ED",
  body: "1F2937", muted: "64748B",
  ok: "15803D", okBg: "E7F3EA", warn: "B45309", warnBg: "FBF0DE",
  bad: "B91C1C", badBg: "FBE9E9",
  console: "111827", consolePanel: "1E293B", consoleInk: "F1F5F9", consoleMuted: "94A3B8",
  vnet: "2B6CB0", subnet: "94A3B8", peer: "15803D",
  head: "Georgia", sans: "Calibri", mono: "Courier New",
};
const W = 13.333, H = 7.5;

function bind(p, opts = {}) {
  const t = Object.assign({}, DEFAULT_THEME, opts.theme || {});
  const S = p.ShapeType;
  const M = opts.margin === undefined ? 0.55 : opts.margin;
  const logo = opts.logo, logoDark = opts.logoDark, aspect = opts.logoAspect || 2.43;
  let N = 0;

  const k = {
    t, S, M, W, H, n: () => N,

    /* ------------------------------------------------ primitives */
    txt(s, text, a) {
      s.addText(text, {
        x: a.x, y: a.y, w: a.w, h: a.h || 0.22, fontFace: a.f || t.sans, fontSize: a.fs || 9,
        bold: !!a.b, italic: !!a.i, color: a.c || t.body, align: a.a || "left",
        valign: a.v || "middle", margin: 0, lineSpacing: a.ls, charSpacing: a.cs,
      });
    },
    box(s, a) {
      s.addShape(a.r === 0 ? S.rect : S.roundRect, {
        x: a.x, y: a.y, w: a.w, h: a.h, rectRadius: a.r === undefined ? 0.06 : a.r,
        fill: a.fill ? { color: a.fill } : { type: "none" },
        line: { color: a.line || t.rule, width: a.lw || 0.75, dashType: a.dash ? "dash" : "solid" },
      });
    },
    rect(s, x, y, w, h, c) { s.addShape(S.rect, { x, y, w, h, fill: { color: c }, line: { color: c } }); },
    icon(s, path, x, y, size) { s.addImage({ path, x, y, w: size, h: size }); },
    arrow(s, x1, y1, x2, y2, a = {}) {
      const span = Math.hypot(x2 - x1, y2 - y1);
      if (a.both && span < 0.2) return k.line(s, x1, y1, x2, y2, a.c, a.w);  // two heads collapse into a star
      s.addShape(S.line, {
        x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
        line: { color: a.c || t.brand, width: a.w || 1.25, dashType: a.dash ? "dash" : "solid",
                endArrowType: "triangle", beginArrowType: a.both ? "triangle" : "none" },
        flipH: x2 < x1, flipV: y2 < y1,
      });
    },
    line(s, x1, y1, x2, y2, c, w) {
      s.addShape(S.line, { x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color: c || t.peer, width: w || 1.4 } });
    },
    num(s, n, x, y, colour) {
      s.addShape(S.ellipse, { x, y, w: 0.21, h: 0.21, fill: { color: colour || t.brand },
        line: { color: t.white, width: 0.7 } });
      k.txt(s, String(n), { x, y, w: 0.21, h: 0.21, fs: 7.4, b: true, c: t.white, a: "center" });
    },
    chip(s, x, y, text, kind) {
      const map = { ok: [t.ok, t.okBg], warn: [t.warn, t.warnBg], bad: [t.bad, t.badBg], brand: [t.brand, t.tint] };
      const [fg, bg] = map[kind || "brand"];
      const w = 0.062 * text.length + 0.24;
      s.addShape(S.roundRect, { x, y, w, h: 0.22, rectRadius: 0.11, fill: { color: bg }, line: { color: bg } });
      k.txt(s, text, { x, y, w, h: 0.22, fs: 7, b: true, c: fg, a: "center" });
      return w;
    },

    /* ------------------------------------------------ slide shells */
    cover(o) {
      const s = p.addSlide(); N++;
      s.background = { color: t.ink };
      k.rect(s, 0, 0, W, 0.09, t.spark);
      if (logoDark) s.addImage({ path: logoDark, x: M, y: 0.6, w: 1.5, h: 1.5 / aspect });
      if (o.kicker) k.txt(s, o.kicker, { x: M, y: 1.5, w: 8, h: 0.24, fs: 11, b: true, c: t.spark, cs: 2.2 });
      k.txt(s, o.title, { x: M, y: 1.9, w: 11.6, h: 1.5, f: t.head, fs: o.fs || 40, b: true,
                          c: t.white, ls: (o.fs || 40) + 4 });
      if (o.sub) k.txt(s, o.sub, { x: M, y: 3.5, w: 9.8, h: 0.7, fs: 13, c: t.consoleMuted, ls: 19, v: "top" });
      return s;
    },
    slide(o) {
      const s = p.addSlide(); N++;
      s.background = { color: o.paper === false ? t.white : t.paper };
      k.rect(s, 0, 0, W, 0.055, t.brand);
      if (logo) s.addImage({ path: logo, x: W - M - 1.06, y: 0.26, w: 1.06, h: 1.06 / aspect });
      if (o.kicker) k.txt(s, o.kicker, { x: M, y: 0.3, w: 7, h: 0.2, fs: 8.4, b: true, c: t.spark, cs: 1.6 });
      k.txt(s, o.title, { x: M, y: 0.54, w: 10.9, h: 0.42, f: t.head,
                          fs: o.title.length > 58 ? 21 : 24, b: true, c: t.ink });
      if (o.sub) k.txt(s, o.sub, { x: M, y: 0.99, w: 11.3, h: 0.26, fs: 10.5, c: t.muted });
      k.txt(s, "fol. " + String(N).padStart(2, "0"),
        { x: W - M - 1.0, y: H - 0.42, w: 1.0, h: 0.22, f: t.mono, fs: 8, c: t.muted, a: "right" });
      return s;
    },
    // bordered full-bleed frame — the layout for a one-page architecture
    frame(o) {
      const s = p.addSlide(); N++;
      s.background = { color: t.white };
      k.box(s, { x: 0.1, y: 0.1, w: W - 0.2, h: H - 0.2, line: t.brand, lw: 1.1, r: 0.04 });
      k.txt(s, o.title, { x: 0.32, y: 0.24, w: 7.6, h: 0.36, f: t.head, fs: 19, b: true, c: t.brand });
      if (o.badge) {
        const bw = 0.075 * o.badge.length + 0.5, bx = 0.34 + o.title.length * 0.135;
        s.addShape(S.roundRect, { x: bx, y: 0.29, w: bw, h: 0.26, rectRadius: 0.13,
          fill: { color: t.ink }, line: { color: t.ink } });
        k.txt(s, o.badge, { x: bx, y: 0.29, w: bw, h: 0.26, fs: 7.4, b: true, c: t.white, a: "center", cs: 0.6 });
      }
      if (o.sub) k.txt(s, o.sub, { x: 0.32, y: 0.6, w: 12.5, h: 0.2, fs: 7.8, c: t.muted });
      return s;
    },
    foot(s, text) { if (text) k.txt(s, text, { x: M, y: H - 0.42, w: 10.6, h: 0.24, fs: 7.8, i: true, c: t.muted }); },

    /* ------------------------------------------------ layout blocks */
    grid(s, x, y, widths, header, rows, o = {}) {
      const fs = o.fs || 9.3, rh = o.rh || 0.36;
      const total = widths.reduce((a, b) => a + b, 0);
      if (x + total > W) console.warn(`grid: ${(x + total).toFixed(2)}in exceeds the ${W}in slide`);
      let cx = x;
      header.forEach((hd, i) => {
        k.rect(s, cx, y, widths[i], 0.3, t.ink);
        k.txt(s, hd, { x: cx + 0.08, y, w: widths[i] - 0.16, h: 0.3, fs: 8.3, b: true, c: t.white, cs: 0.5 });
        cx += widths[i];
      });
      rows.forEach((r, ri) => {
        const ry = y + 0.3 + ri * rh; let rx = x;
        s.addShape(S.rect, { x, y: ry, w: total, h: rh,
          fill: { color: ri % 2 ? t.white : t.tint }, line: { color: t.rule, width: 0.5 } });
        r.forEach((cell, ci) => {
          if (cell && cell.tag) k.chip(s, rx + 0.08, ry + (rh - 0.22) / 2, cell.tag, cell.k);
          else k.txt(s, String(cell), { x: rx + 0.08, y: ry, w: widths[ci] - 0.16, h: rh,
            f: (o.mono || []).includes(ci) ? t.mono : t.sans, fs,
            b: !!(ci === 0 && o.boldFirst), c: ci === 0 && o.boldFirst ? t.ink : t.body, ls: fs + 2 });
          rx += widths[ci];
        });
      });
      return y + 0.3 + rows.length * rh;
    },
    card(s, x, y, w, h, title, bodyOrList, o = {}) {
      k.box(s, { x, y, w, h, fill: t.white, line: o.line || t.rule, lw: o.lw });
      k.rect(s, x, y, w, 0.05, o.accent || t.brand);
      if (o.icon) k.icon(s, o.icon, x + 0.16, y + 0.2, 0.34);
      if (o.kicker) k.txt(s, o.kicker, { x: x + 0.2, y: y + 0.16, w: w - 0.4, h: 0.18, fs: 7.4, b: true, c: t.spark, cs: 1.2 });
      k.txt(s, title, { x: x + (o.icon ? 0.58 : 0.2), y: y + (o.kicker ? 0.36 : 0.2),
        w: w - (o.icon ? 0.72 : 0.4), h: 0.3, f: t.head, fs: o.ts || 13, b: true, c: t.ink });
      const by = y + (o.kicker ? 0.72 : 0.56);
      if (Array.isArray(bodyOrList))
        s.addText(bodyOrList.map((b, i) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: i < bodyOrList.length - 1 } })),
          { x: x + 0.22, y: by, w: w - 0.44, h: h - (by - y) - 0.15, fontFace: t.sans,
            fontSize: o.fs || 9.3, color: t.body, valign: "top", margin: 0,
            lineSpacing: (o.fs || 9.3) + 3.5, paraSpaceAfter: 3 });
      else k.txt(s, bodyOrList, { x: x + 0.2, y: by, w: w - 0.4, h: h - (by - y) - 0.15,
            fs: o.fs || 9.6, c: t.body, ls: 13, v: "top" });
      return y + h;
    },
    band(s, y, label, text, tone) {
      const map = { brand: [t.tint, t.brand], ok: [t.okBg, t.ok], warn: [t.warnBg, t.warn], bad: [t.badBg, t.bad] };
      const [bg, fg] = map[tone || "brand"];
      k.box(s, { x: M, y, w: W - 2 * M, h: 0.82, fill: bg, line: t.rule });
      k.txt(s, label, { x: M + 0.2, y: y + 0.08, w: 3.8, h: 0.2, fs: 8, b: true, c: fg, cs: 1.1 });
      k.txt(s, text, { x: M + 0.2, y: y + 0.3, w: W - 2 * M - 0.4, h: 0.46, fs: 9.8, c: t.body, ls: 12.5, v: "top" });
      return y + 0.82;
    },
    steps(s, y, items, h) {
      const n = items.length, w = (W - 2 * M - (n - 1) * 0.18) / n;
      items.forEach(([title, sub], i) => {
        const x = M + i * (w + 0.18);
        k.box(s, { x, y, w, h: h || 1.05, fill: t.tint, line: t.rule });
        k.num(s, i + 1, x - 0.07, y - 0.07);
        k.txt(s, title, { x: x + 0.15, y: y + 0.16, w: w - 0.3, h: 0.24, fs: 9.6, b: true, c: t.ink });
        k.txt(s, sub, { x: x + 0.15, y: y + 0.42, w: w - 0.3, h: (h || 1.05) - 0.5, fs: 8, c: t.body, ls: 10.5, v: "top" });
        if (i < n - 1) k.arrow(s, x + w + 0.02, y + (h || 1.05) / 2, x + w + 0.16, y + (h || 1.05) / 2);
      });
      return y + (h || 1.05);
    },
    versus(s, y, left, right, hh) {
      const h2 = hh || (0.6 + Math.max(left.b.length, right.b.length) * 0.3);
      const put = (x, w, o, colour, bg) => {
        k.box(s, { x, y, w, h: h2, fill: bg, line: colour, lw: 1.1 });
        k.txt(s, o.t, { x: x + 0.2, y: y + 0.12, w: w - 0.4, h: 0.3, f: t.head, fs: 12.5, b: true, c: colour });
        s.addText(o.b.map((b, i) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: i < o.b.length - 1 } })),
          { x: x + 0.24, y: y + 0.5, w: w - 0.5, h: h2 - 0.62, fontFace: t.sans, fontSize: 9.4,
            color: t.body, valign: "top", margin: 0, lineSpacing: 12.5, paraSpaceAfter: 3 });
      };
      put(M, 6.05, left, t.bad, t.badBg);
      put(6.78, 6.0, right, t.ok, t.white);
      return y + h2;
    },

    /* ------------------------------------------------ architecture blocks */
    // labelled row group, label knocked out of its own top border
    group(s, x, y, w, h, label, note) {
      k.box(s, { x, y, w, h, line: t.ink, lw: 0.9 });
      k.rect(s, x + 0.16, y - 0.005, 0.085 * label.length + 0.24, 0.12, t.white);
      k.txt(s, label, { x: x + 0.2, y: y - 0.09, w: 0.085 * label.length + 0.3, h: 0.2, fs: 8.6, b: true, c: t.ink });
      if (note) {
        const nw = Math.min(0.0465 * note.length + 0.3, w - 2.2);
        k.rect(s, x + w - nw - 0.18, y - 0.005, nw, 0.12, t.white);
        k.txt(s, note, { x: x + w - nw - 0.16, y: y - 0.09, w: nw, h: 0.2, fs: 6, i: true, c: t.muted, a: "right" });
      }
    },
    // component tile: a real logo where one exists, a wordmark tile where none does
    tile(s, x, y, w, h, o) {
      k.box(s, { x, y, w, h, fill: o.fill || t.white, line: o.line || t.rule });
      if (o.icon) k.icon(s, o.icon, x + 0.08, y + 0.09, 0.22);
      else {
        k.box(s, { x: x + 0.07, y: y + 0.08, w: 0.24, h: 0.24, fill: t.tint, line: t.rule, r: 0.03 });
        k.txt(s, (o.mark || o.t).slice(0, 2).toUpperCase(),
          { x: x + 0.07, y: y + 0.08, w: 0.24, h: 0.24, f: t.mono, fs: 6.2, b: true, c: t.brand, a: "center" });
      }
      k.txt(s, o.t, { x: x + 0.36, y: y + 0.07, w: w - 0.44, h: 0.2, fs: 6.9, b: true, c: o.tc || t.ink });
      if (o.sub) k.txt(s, o.sub, { x: x + 0.36, y: y + 0.25, w: w - 0.44, h: h - 0.3, fs: 5.7, c: t.muted, ls: 7.2, v: "top" });
      if (o.n !== undefined) k.num(s, o.n, x + w - 0.19, y - 0.08);
    },
    tileRow(s, x, y, w, h, items) {
      const n = items.length, gap = 0.08, tw = (w - 0.24 - (n - 1) * gap) / n;
      items.forEach((it, i) => k.tile(s, x + 0.12 + i * (tw + gap), y + 0.16, tw, h - 0.28, it));
    },
    rail(s, x, y, w, h, label, items) {
      k.box(s, { x, y, w, h, fill: t.paper, line: t.rule });
      k.txt(s, label, { x: x + 0.08, y: y + 0.08, w: w - 0.16, h: 0.22, fs: 7, b: true, c: t.brand, cs: 0.7, a: "center" });
      const step = (h - 0.46) / items.length;
      items.forEach(([icon, title, sub], i) => {
        const iy = y + 0.36 + i * step, ih = step - 0.07;
        k.box(s, { x: x + 0.08, y: iy, w: w - 0.16, h: ih, fill: t.white, line: t.rule });
        if (icon) k.icon(s, icon, x + 0.16, iy + (sub ? 0.06 : (ih - 0.2) / 2), 0.2);
        k.txt(s, title, { x: x + (icon ? 0.42 : 0.16), y: iy + (sub ? 0.04 : 0),
          w: w - (icon ? 0.52 : 0.26), h: sub ? 0.2 : ih, fs: 6.6, b: true, c: t.ink });
        if (sub) k.txt(s, sub, { x: x + (icon ? 0.42 : 0.16), y: iy + 0.22,
          w: w - (icon ? 0.52 : 0.26), h: ih - 0.24, fs: 5.6, c: t.muted, ls: 7 });
      });
    },
    // network container with the CIDR in its label
    vnet(s, x, y, w, h, label) {
      k.box(s, { x, y, w, h, line: t.vnet, lw: 1.2, r: 0.04 });
      k.rect(s, x + 0.14, y - 0.005, Math.min(0.058 * label.length + 0.2, w - 0.4), 0.14, t.white);
      k.txt(s, label, { x: x + 0.16, y: y - 0.09, w: w - 0.4, h: 0.2, fs: 6.4, b: true, c: t.vnet });
    },
    subnet(s, x, y, w, h, o) {
      k.box(s, { x, y, w, h, fill: t.white, line: t.subnet, dash: true, r: 0.03 });
      k.txt(s, o.label, { x: x + 0.08, y: y + 0.06, w: w - 0.16, h: 0.18, fs: 5.9, b: true, c: t.vnet });
      if (o.icon) k.icon(s, o.icon, x + 0.09, y + 0.3, 0.24);
      if (o.t) k.txt(s, o.t, { x: x + 0.38, y: y + 0.29, w: w - 0.46, h: 0.2, fs: 7, b: true, c: t.ink });
      if (o.sub) k.txt(s, o.sub, { x: x + 0.09, y: y + 0.58, w: w - 0.18, h: h - 0.64, fs: 5.8, c: t.muted, ls: 7.4, v: "top" });
    },
    // identity badges for a workload container
    badges(s, x, y, pairs) {
      (pairs || [["Least privilege", null], ["Workload identity", null]]).forEach(([label, icon], i) => {
        const bx = x + i * 1.5;
        if (icon) k.icon(s, icon, bx, y, 0.15);
        k.txt(s, label, { x: bx + (icon ? 0.18 : 0), y: y - 0.01, w: 1.3, h: 0.16, fs: 6.2, c: t.muted });
      });
    },
    providerBand(s, y, text, note) {
      k.rect(s, 0.32, y, W - 0.64, 0.34, t.ink);
      k.txt(s, text, { x: 0.46, y, w: W - 0.92, h: 0.34, fs: 7.6, b: true, c: t.white, cs: 0.3 });
      if (note) k.txt(s, note, { x: 0.46, y: y + 0.36, w: W - 0.92, h: 0.16, fs: 5.8, i: true, c: t.muted });
      return y + (note ? 0.54 : 0.34);
    },
    flowLegend(s, y, steps, label) {
      k.txt(s, (label || "REQUEST PATH") + "   " + steps.map((x, i) => `${i + 1} ${x}`).join("   ·   "),
        { x: 0.32, y, w: W - 0.64, h: 0.2, fs: 6.4, c: t.brand });
      return y + 0.2;
    },
    // line-type legend — draw it whenever connectivity is on the slide
    connLegend(s, y, items, x) {
      items.reduce((cx, [colour, label, both, width]) => {
        k.arrow(s, cx, y, cx + 0.26, y, { c: colour, both: !!both });
        k.txt(s, label, { x: cx + 0.32, y: y - 0.08, w: width - 0.34, h: 0.16, fs: 6.8, c: t.muted });
        return cx + width;
      }, x === undefined ? 0.32 : x);
    },
    scopeLegend(s, x, y, existingLabel, newLabel) {
      k.box(s, { x, y: y + 0.02, w: 0.16, h: 0.14, fill: t.okBg, line: t.ok, lw: 1.2, r: 0.02 });
      k.txt(s, existingLabel || "Existing — already deployed",
        { x: x + 0.23, y: y - 0.02, w: 2.7, h: 0.22, fs: 7.6, b: true, c: t.ok });
      k.box(s, { x, y: y + 0.27, w: 0.16, h: 0.14, fill: t.tint, line: t.brand, lw: 1.2, r: 0.02 });
      k.txt(s, newLabel || "New — this engagement",
        { x: x + 0.23, y: y + 0.23, w: 2.7, h: 0.22, fs: 7.6, b: true, c: t.brand });
    },

    save(file) { return p.writeFile({ fileName: file }).then((f) => console.log("wrote", f, "slides:", N)); },
  };
  return k;
}

module.exports = { bind, DEFAULT_THEME, W, H };
