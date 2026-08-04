import { r as i, j as e, a as Rn, R as ut, c as $n } from "./react-gcHzaSmV.js";
import {
  C as Tt,
  V as ce,
  Q as De,
  S as bt,
  a as It,
  M as Bt,
  b as ye,
  c as ot,
  L as An,
  d as Ln,
  B as js,
  e as xt,
  D as Vt,
  f as ks,
  A as vt,
  g as Ns,
  h as Ms,
  P as Es,
  W as Cs,
  O as Ss,
  H as Rs,
  i as $s,
  R as zn,
  j as Xe,
  G as As,
  F as Ls,
  k as zt,
  l as mt,
  m as zs,
  n as Pt,
  I as Ye,
  o as Ge,
  p as gt,
  q as Ps,
  r as Pn,
  E as Tn,
  s as In,
  t as Gt,
  u as Bn,
  v as qn,
  w as Dn,
} from "./three-DnGjZfD1.js";
(function () {
  const s = document.createElement("link").relList;
  if (s && s.supports && s.supports("modulepreload")) return;
  for (const a of document.querySelectorAll('link[rel="modulepreload"]')) r(a);
  new MutationObserver((a) => {
    for (const o of a)
      if (o.type === "childList")
        for (const d of o.addedNodes) d.tagName === "LINK" && d.rel === "modulepreload" && r(d);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(a) {
    const o = {};
    return (
      a.integrity && (o.integrity = a.integrity),
      a.referrerPolicy && (o.referrerPolicy = a.referrerPolicy),
      a.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : a.crossOrigin === "anonymous"
          ? (o.credentials = "omit")
          : (o.credentials = "same-origin"),
      o
    );
  }
  function r(a) {
    if (a.ep) return;
    a.ep = !0;
    const o = n(a);
    fetch(a.href, o);
  }
})();
const Fn = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  _n = (t) =>
    t.replace(/^([A-Z])|[\s-_]+(\w)/g, (s, n, r) => (r ? r.toUpperCase() : n.toLowerCase())),
  Xt = (t) => {
    const s = _n(t);
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  Ts = (...t) =>
    t
      .filter((s, n, r) => !!s && s.trim() !== "" && r.indexOf(s) === n)
      .join(" ")
      .trim(),
  On = (t) => {
    for (const s in t) if (s.startsWith("aria-") || s === "role" || s === "title") return !0;
  };
var Hn = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const Wn = i.forwardRef(
  (
    {
      color: t = "currentColor",
      size: s = 24,
      strokeWidth: n = 2,
      absoluteStrokeWidth: r,
      className: a = "",
      children: o,
      iconNode: d,
      ...c
    },
    u,
  ) =>
    i.createElement(
      "svg",
      {
        ref: u,
        ...Hn,
        width: s,
        height: s,
        stroke: t,
        strokeWidth: r ? (Number(n) * 24) / Number(s) : n,
        className: Ts("lucide", a),
        ...(!o && !On(c) && { "aria-hidden": "true" }),
        ...c,
      },
      [...d.map(([h, v]) => i.createElement(h, v)), ...(Array.isArray(o) ? o : [o])],
    ),
);
const ie = (t, s) => {
  const n = i.forwardRef(({ className: r, ...a }, o) =>
    i.createElement(Wn, {
      ref: o,
      iconNode: s,
      className: Ts(`lucide-${Fn(Xt(t))}`, `lucide-${t}`, r),
      ...a,
    }),
  );
  return ((n.displayName = Xt(t)), n);
};
const Un = [
    ["path", { d: "m3 16 4 4 4-4", key: "1co6wj" }],
    ["path", { d: "M7 20V4", key: "1yoxec" }],
    ["path", { d: "m21 8-4-4-4 4", key: "1c9v7m" }],
    ["path", { d: "M17 4v16", key: "7dpous" }],
  ],
  Kn = ie("arrow-down-up", Un);
const Vn = [
    ["path", { d: "M12 8V4H8", key: "hb8ula" }],
    ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
    ["path", { d: "M2 14h2", key: "vft8re" }],
    ["path", { d: "M20 14h2", key: "4cs60a" }],
    ["path", { d: "M15 13v2", key: "1xurst" }],
    ["path", { d: "M9 13v2", key: "rq6x2g" }],
  ],
  Gn = ie("bot", Vn);
const Xn = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]],
  Yn = ie("circle", Xn);
const Zn = [
    ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
    ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }],
  ],
  Jn = ie("copy", Zn);
const Qn = [
    ["path", { d: "m15 10 5 5-5 5", key: "qqa56n" }],
    ["path", { d: "M4 4v7a4 4 0 0 0 4 4h12", key: "z08zvw" }],
  ],
  er = ie("corner-down-right", Qn);
const tr = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
    ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
    ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
    ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }],
  ],
  sr = ie("crosshair", tr);
const nr = [
    ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
    ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
    ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }],
  ],
  rr = ie("ellipsis", nr);
const ar = [
    [
      "path",
      {
        d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
        key: "ct8e1f",
      },
    ],
    ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
    [
      "path",
      {
        d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
        key: "13bj9a",
      },
    ],
    ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ],
  ir = ie("eye-off", ar);
const or = [
    [
      "path",
      {
        d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        key: "1nclc0",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  cr = ie("eye", or);
const lr = [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
    ["path", { d: "M10 12.5 8 15l2 2.5", key: "1tg20x" }],
    ["path", { d: "m14 12.5 2 2.5-2 2.5", key: "yinavb" }],
  ],
  dr = ie("file-code", lr);
const ur = [
    [
      "path",
      {
        d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
        key: "1slcih",
      },
    ],
  ],
  hr = ie("flame", ur);
const pr = [
    [
      "path",
      {
        d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
        key: "usdka0",
      },
    ],
  ],
  Yt = ie("folder-open", pr);
const fr = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M12 16v-4", key: "1dtifu" }],
    ["path", { d: "M12 8h.01", key: "e9boi3" }],
  ],
  mr = ie("info", fr);
const gr = [
    ["path", { d: "M11 5h10", key: "1cz7ny" }],
    ["path", { d: "M11 12h10", key: "1438ji" }],
    ["path", { d: "M11 19h10", key: "11t30w" }],
    ["path", { d: "M4 4h1v5", key: "10yrso" }],
    ["path", { d: "M4 9h2", key: "r1h2o0" }],
    ["path", { d: "M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02", key: "xtkcd5" }],
  ],
  xr = ie("list-ordered", gr);
const vr = [
    ["path", { d: "M12 2v4", key: "3427ic" }],
    ["path", { d: "m16.2 7.8 2.9-2.9", key: "r700ao" }],
    ["path", { d: "M18 12h4", key: "wj9ykh" }],
    ["path", { d: "m16.2 16.2 2.9 2.9", key: "1bxg5t" }],
    ["path", { d: "M12 18v4", key: "jadmvz" }],
    ["path", { d: "m4.9 19.1 2.9-2.9", key: "bwix9q" }],
    ["path", { d: "M2 12h4", key: "j09sii" }],
    ["path", { d: "m4.9 4.9 2.9 2.9", key: "giyufr" }],
  ],
  qt = ie("loader", vr);
const yr = [
    ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
    ["path", { d: "m21 3-7 7", key: "1l2asr" }],
    ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
    ["path", { d: "M9 21H3v-6", key: "wtvkvv" }],
  ],
  wr = ie("maximize-2", yr);
const br = [["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]],
  Is = ie("mountain", br);
const jr = [
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
    ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ["path", { d: "m16 15-3-3 3-3", key: "14y99z" }],
  ],
  kr = ie("panel-left-close", jr);
const Nr = [
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
    ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ["path", { d: "m14 9 3 3-3 3", key: "8010ee" }],
  ],
  Mr = ie("panel-left-open", Nr);
const Er = [
    ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
    ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }],
  ],
  Cr = ie("pause", Er);
const Sr = [
    [
      "path",
      {
        d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
        key: "10ikf1",
      },
    ],
  ],
  Rr = ie("play", Sr);
const $r = [
    ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
    ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
    ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
    ["path", { d: "M8 16H3v5", key: "1cv678" }],
  ],
  yt = ie("refresh-cw", $r);
const Ar = [
    ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
    ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
    ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
    ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }],
  ],
  Lr = ie("repeat", Ar);
const zr = [
    ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
    ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ],
  Pr = ie("rotate-ccw", zr);
const Tr = [
    ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ],
  Dt = ie("search", Tr);
const Ir = [
    [
      "path",
      {
        d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
        key: "1s2grr",
      },
    ],
    ["path", { d: "M20 2v4", key: "1rf3ol" }],
    ["path", { d: "M22 4h-4", key: "gwowj6" }],
    ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }],
  ],
  Bs = ie("sparkles", Ir);
const Br = [
    [
      "path",
      {
        d: "M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z",
        key: "19qhus",
      },
    ],
    ["path", { d: "M21 20V4", key: "cb8qj8" }],
  ],
  qr = ie("step-back", Br);
const Dr = [
    [
      "path",
      {
        d: "M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z",
        key: "1ystz2",
      },
    ],
    ["path", { d: "M3 4v16", key: "1ph11n" }],
  ],
  Fr = ie("step-forward", Dr);
const _r = [
    [
      "path",
      {
        d: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",
        key: "cpyugq",
      },
    ],
    ["path", { d: "M12 22v-3", key: "kmzjlo" }],
  ],
  qs = ie("tree-pine", _r);
const Or = [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
        key: "wmoenq",
      },
    ],
    ["path", { d: "M12 9v4", key: "juzpu7" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }],
  ],
  jt = ie("triangle-alert", Or);
const Hr = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ],
  Wr = ie("users", Hr);
const Ur = [
    [
      "path",
      {
        d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
        key: "ftymec",
      },
    ],
    ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }],
  ],
  Kr = ie("video", Ur);
const Vr = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
  ],
  Le = ie("x", Vr);
const Gr = [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
    ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
    ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
  ],
  Xr = ie("zoom-in", Gr);
const Yr = [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
    ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
  ],
  Zr = ie("zoom-out", Yr);
async function Ze(t) {
  const s = await fetch(t);
  if (!s.ok) {
    const n = (await s.text()).trim();
    throw new Error(n || `${s.status} ${s.statusText}`);
  }
  return s.json();
}
function Ie(t, s) {
  if (t instanceof TypeError)
    return `Can't reach the mindwalk server while ${s} — is it still running?`;
  const n = (t instanceof Error ? t.message : String(t)).trim();
  return n ? `Couldn't finish ${s}: ${n}` : `Couldn't finish ${s}`;
}
function Zt(t = !1) {
  return Ze(t ? "/api/sessions?fresh=1" : "/api/sessions");
}
function Jr(t) {
  return Ze(`/api/sessions/${encodeURIComponent(t)}/snapshot`);
}
function Qr(t) {
  return Ze(`/api/sessions/${encodeURIComponent(t)}/agents`);
}
function ea(t, s) {
  return Ze(`/api/sessions/${encodeURIComponent(t)}/agents/${encodeURIComponent(s)}/trace`);
}
function ta(t) {
  return Ze(`/api/sessions/${encodeURIComponent(t)}/report`);
}
async function sa(t, s) {
  const n = await fetch(`/api/sessions/${encodeURIComponent(t)}/analyze`, {
    method: "POST",
    headers: s ? { "Content-Type": "application/json" } : void 0,
    body: s ? JSON.stringify(s) : void 0,
  });
  if (!n.ok) {
    const r = (await n.text()).trim();
    throw new Error(r || `${n.status} ${n.statusText}`);
  }
  return n.json();
}
function na() {
  let t = -1;
  return (s) => {
    const n = s === "" ? NaN : Number(s);
    return Number.isNaN(n) ? !0 : n <= t ? !1 : ((t = n), !0);
  };
}
function ra(t, s, n) {
  const r = new EventSource(`/api/sessions/${encodeURIComponent(t)}/analyze/stream`),
    a = na();
  return (
    r.addEventListener("progress", (o) => {
      if (a(o.lastEventId))
        try {
          s(JSON.parse(o.data));
        } catch {}
    }),
    r.addEventListener("status", (o) => {
      try {
        n(JSON.parse(o.data));
      } catch {}
    }),
    r
  );
}
function aa(t) {
  const s = t ? `/api/repomap?repo=${encodeURIComponent(t)}` : "/api/repomap";
  return Ze(s);
}
const Jt = [
  { id: 0, path: "src/main.ts", dir: "src", lines: 45, bytes: 980, lang: "ts" },
  { id: 1, path: "src/app.ts", dir: "src", lines: 220, bytes: 6200, lang: "ts" },
  { id: 2, path: "src/lib/parser.ts", dir: "src/lib", lines: 180, bytes: 5100, lang: "ts" },
  { id: 3, path: "src/lib/utils.ts", dir: "src/lib", lines: 95, bytes: 2400, lang: "ts" },
  { id: 4, path: "src/lib/config.ts", dir: "src/lib", lines: 60, bytes: 1500, lang: "ts" },
  { id: 5, path: "src/ui/Button.tsx", dir: "src/ui", lines: 40, bytes: 900, lang: "tsx" },
  { id: 6, path: "src/ui/Modal.tsx", dir: "src/ui", lines: 85, bytes: 2100, lang: "tsx" },
  { id: 7, path: "src/ui/Header.tsx", dir: "src/ui", lines: 55, bytes: 1400, lang: "tsx" },
  { id: 8, path: "src/api/client.ts", dir: "src/api", lines: 130, bytes: 3800, lang: "ts" },
  { id: 9, path: "src/api/types.ts", dir: "src/api", lines: 70, bytes: 1800, lang: "ts" },
  { id: 10, path: "tests/parser.test.ts", dir: "tests", lines: 110, bytes: 3200, lang: "ts" },
  { id: 11, path: "tests/utils.test.ts", dir: "tests", lines: 65, bytes: 1700, lang: "ts" },
  { id: 12, path: "package.json", dir: "", lines: 35, bytes: 850, lang: "json" },
  { id: 13, path: "README.md", dir: "", lines: 80, bytes: 2400, lang: "md" },
  { id: 14, path: ".gitignore", dir: "", lines: 12, bytes: 180, lang: "text" },
];
function ia() {
  const o = Jt.map((c, u) => {
      const h = u % 5,
        v = Math.floor(u / 5);
      return {
        ...c,
        rect: { x: h * 5.5 - 13.75, z: v * 5.5 - (Math.ceil(Jt.length / 5) * 5.5) / 2, w: 4, d: 4 },
        ghost: !1,
      };
    }),
    d = [
      { path: "src", depth: 0 },
      { path: "src/lib", depth: 1 },
      { path: "src/ui", depth: 1 },
      { path: "src/api", depth: 1 },
      { path: "tests", depth: 0 },
    ].map((c) => ({
      ...c,
      rect: { x: 0, z: 0, w: 0, d: 0 },
      fileCount: o.filter((u) => u.dir === c.path || u.dir.startsWith(c.path + "/")).length,
      lines: o
        .filter((u) => u.dir === c.path || u.dir.startsWith(c.path + "/"))
        .reduce((u, h) => u + h.lines, 0),
    }));
  return {
    version: 1,
    repo: {
      root: "demo-project",
      commit: "a1b2c3d",
      dirty: !0,
      generatedAt: new Date().toISOString(),
    },
    files: o,
    dirs: d,
    layout: { algorithm: "demo", weight: "lines" },
  };
}
function oa() {
  const t = new Date(),
    s = (a) => new Date(t.getTime() + a * 1e3).toISOString(),
    n = [
      {
        seq: 0,
        ts: s(0),
        tool: "Grep",
        action: "search",
        targets: [{ path: "src/lib/parser.ts", touch: "hit" }],
        resultBytes: 1200,
        isError: !1,
        summary: "searched for 'parseConfig' across src/",
      },
      {
        seq: 1,
        ts: s(3),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/lib/parser.ts", touch: "read" }],
        resultBytes: 5100,
        isError: !1,
        summary: "read src/lib/parser.ts",
      },
      {
        seq: 2,
        ts: s(6),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/lib/config.ts", touch: "read" }],
        resultBytes: 1500,
        isError: !1,
        summary: "read src/lib/config.ts",
      },
      {
        seq: 3,
        ts: s(10),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/app.ts", touch: "read" }],
        resultBytes: 6200,
        isError: !1,
        summary: "read src/app.ts",
      },
      {
        seq: 4,
        ts: s(14),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/ui/Modal.tsx", touch: "read" }],
        resultBytes: 2100,
        isError: !1,
        summary: "read src/ui/Modal.tsx",
      },
      {
        seq: 5,
        ts: s(18),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/lib/parser.ts", touch: "edit", lines: [[20, 35]] }],
        resultBytes: 800,
        isError: !1,
        summary: "refactored parseConfig to accept options",
      },
      {
        seq: 6,
        ts: s(22),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/lib/parser.ts", touch: "edit", lines: [[40, 55]] }],
        resultBytes: 600,
        isError: !1,
        summary: "added error handling to parse loop",
      },
      {
        seq: 7,
        ts: s(26),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/app.ts", touch: "edit", lines: [[100, 120]] }],
        resultBytes: 900,
        isError: !1,
        summary: "wired new parser options into app init",
      },
      {
        seq: 8,
        ts: s(30),
        tool: "Bash",
        action: "exec",
        targets: [],
        resultBytes: 400,
        isError: !1,
        summary: "npm run build",
      },
      {
        seq: 9,
        ts: s(33),
        tool: "Bash",
        action: "verify",
        targets: [],
        resultBytes: 2400,
        isError: !0,
        summary: "npm test — 1 test failed",
      },
      {
        seq: 10,
        ts: s(37),
        tool: "Read",
        action: "read",
        targets: [{ path: "tests/parser.test.ts", touch: "read" }],
        resultBytes: 3200,
        isError: !1,
        summary: "read tests/parser.test.ts to debug failure",
      },
      {
        seq: 11,
        ts: s(41),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/lib/parser.ts", touch: "read" }],
        resultBytes: 5100,
        isError: !1,
        summary: "re-read parser after test failure",
      },
      {
        seq: 12,
        ts: s(45),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/lib/parser.ts", touch: "edit", lines: [[30, 38]] }],
        resultBytes: 500,
        isError: !1,
        summary: "fixed off-by-one in parse loop",
      },
      {
        seq: 13,
        ts: s(49),
        tool: "Bash",
        action: "verify",
        targets: [],
        resultBytes: 2200,
        isError: !1,
        summary: "npm test — all tests passed",
      },
      {
        seq: 14,
        ts: s(53),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/ui/Button.tsx", touch: "read" }],
        resultBytes: 900,
        isError: !1,
        summary: "read Button component for styling reference",
      },
      {
        seq: 15,
        ts: s(57),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/ui/Modal.tsx", touch: "edit", lines: [[15, 30]] }],
        resultBytes: 700,
        isError: !1,
        summary: "updated Modal to match Button styling",
      },
      {
        seq: 16,
        ts: s(61),
        tool: "Grep",
        action: "search",
        targets: [{ path: "src/api/client.ts", touch: "hit" }],
        resultBytes: 300,
        isError: !1,
        summary: "searched for 'fetch' in src/",
      },
      {
        seq: 17,
        ts: s(65),
        tool: "Read",
        action: "read",
        targets: [{ path: "src/api/client.ts", touch: "read" }],
        resultBytes: 3800,
        isError: !1,
        summary: "read API client",
      },
      {
        seq: 18,
        ts: s(69),
        tool: "Edit",
        action: "edit",
        targets: [{ path: "src/api/client.ts", touch: "edit", lines: [[45, 60]] }],
        resultBytes: 800,
        isError: !1,
        summary: "added retry logic to fetch calls",
      },
      {
        seq: 19,
        ts: s(73),
        tool: "Bash",
        action: "verify",
        targets: [],
        resultBytes: 2300,
        isError: !1,
        summary: "npm test — all 12 tests passed",
      },
    ],
    r = [
      { seq: 0, type: "user-message", note: "Fix the parser bug and improve Modal styling" },
      { seq: 8, type: "thinking" },
      { seq: 9, type: "finish-reason" },
      { seq: 13, type: "thinking" },
    ];
  return {
    version: 1,
    session: {
      id: "demo-session",
      harness: "demo",
      model: "demo-model",
      title: "Demo: Fix parser bug + improve UI",
      cwd: "demo-project",
      startedAt: s(0),
      endedAt: s(73),
      eventCount: n.length,
    },
    events: n,
    marks: r,
    stats: {
      filesInRepo: 15,
      fovea: 7,
      parafovea: 9,
      edited: 4,
      eventsBeforeFirstEdit: 5,
      regressionRate: 0.12,
      errorRate: 0.05,
      actions: { search: 2, read: 7, edit: 6, exec: 1, verify: 3, other: 0 },
      errors: { search: 0, read: 0, edit: 0, exec: 0, verify: 1, other: 0 },
      maxEditsPerFile: 3,
      churnFiles: 1,
      userTurns: 1,
      compactions: 0,
      subagents: 0,
      resultBytes: 39400,
      editsAfterLastVerify: 0,
      observability: { reads: "exact", errors: "exact" },
    },
  };
}
function ca() {
  return { trace: oa(), city: ia() };
}
function la({ panels: t, openSheet: s, openPop: n, onToggle: r, onClosePop: a }) {
  const o = i.useRef(null),
    d = i.useRef(null),
    c = t.find((l) => l.id === s && l.presentation === "sheet"),
    u = t.find((l) => l.id === n && l.presentation === "pop"),
    v = ["scene", "session"]
      .map((l) => ({ section: l, items: t.filter((y) => y.section === l) }))
      .filter((l) => l.items.length > 0);
  return (
    i.useEffect(() => {
      if (!u) return;
      const l = (f) => {
          const j = f.target;
          o.current?.contains(j) || d.current?.contains(j) || a();
        },
        y = (f) => {
          f.key === "Escape" && a();
        };
      return (
        document.addEventListener("pointerdown", l),
        document.addEventListener("keydown", y),
        () => {
          (document.removeEventListener("pointerdown", l),
            document.removeEventListener("keydown", y));
        }
      );
    }, [u, a]),
    e.jsxs("div", {
      className: "dock",
      children: [
        u ? e.jsx("div", { className: "dock-pop", ref: o, children: u.render() }) : null,
        c ? e.jsx("aside", { className: "dock-panel", children: c.render() }) : null,
        e.jsx("div", {
          className: "dock-side",
          ref: d,
          children: e.jsx("div", {
            className: "dock-strip",
            role: "group",
            "aria-label": "Stage panels",
            children: v.map((l, y) =>
              e.jsxs(
                "div",
                {
                  className: "dock-strip-group",
                  children: [
                    y > 0
                      ? e.jsx("div", { className: "dock-strip-divider", "aria-hidden": !0 })
                      : null,
                    l.items.map((f) => {
                      const j = f.id === s || f.id === n,
                        R = f.icon;
                      return e.jsxs(
                        "button",
                        {
                          "aria-pressed": j,
                          className: j ? "active" : "",
                          onClick: () => r(f),
                          "data-hint": f.hint,
                          "aria-label": f.hint,
                          children: [
                            e.jsx(R, { size: 15 }),
                            f.badge
                              ? e.jsx("span", { className: `dock-dot dock-dot-${f.badge}` })
                              : null,
                          ],
                        },
                        f.id,
                      );
                    }),
                  ],
                },
                l.section,
              ),
            ),
          }),
        }),
      ],
    })
  );
}
function da({
  graph: t,
  current: s,
  loading: n,
  loadingAgentID: r,
  locked: a = !1,
  error: o,
  retryAgentID: d,
  onSelect: c,
  onRetry: u,
  onClose: h,
}) {
  const v = t?.agents.filter((p) => p.kind !== "main") ?? [],
    l = t?.agents.find((p) => p.kind === "main"),
    y = o && d === null ? o : void 0,
    [f, j] = i.useState(null),
    R = t?.agents.find((p) => p.id === f?.agentID);
  i.useEffect(() => {
    f && t && !R && j(null);
  }, [f, R, t]);
  const I = () => {
    (j(null), h());
  };
  return e.jsxs("div", {
    className: "dock-body agents-panel",
    "aria-label": "Agent lenses",
    children: [
      e.jsxs("div", {
        className: "inspector-head",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("div", { className: "inspector-path", children: "Agents" }),
              e.jsx("div", {
                className: "agents-head-note",
                children: "Choose one trace at a time",
              }),
            ],
          }),
          e.jsx("button", {
            className: "icon-btn",
            onClick: I,
            title: "Close",
            "aria-label": "Close agents",
            children: e.jsx(Le, { size: 15 }),
          }),
        ],
      }),
      y ? e.jsx(Qt, { error: y, locked: a, onRetry: u }) : null,
      e.jsxs("div", {
        className: "agent-list",
        "aria-busy": n || r !== void 0,
        children: [
          e.jsxs("button", {
            className:
              s === null ? "agent-row agent-row-select active" : "agent-row agent-row-select",
            "aria-pressed": s === null,
            disabled: a,
            onClick: () => c(null),
            children: [
              e.jsx("span", {
                className: "agent-row-icon",
                "aria-hidden": !0,
                children: e.jsx(Yn, { size: 12 }),
              }),
              e.jsxs("span", {
                className: "agent-row-copy",
                children: [
                  e.jsxs("span", {
                    className: "agent-row-primary",
                    children: [
                      e.jsxs("span", {
                        className: "agent-row-title",
                        children: [
                          "Main",
                          s === null
                            ? e.jsx("span", { className: "agent-current", children: "current" })
                            : null,
                        ],
                      }),
                      e.jsx("span", {
                        className: "agent-row-count",
                        children: Ds(l?.traceEventCount ?? 0),
                      }),
                    ],
                  }),
                  e.jsx("span", { className: "agent-row-secondary", children: "Root trace" }),
                ],
              }),
            ],
          }),
          v.map((p) => {
            const H = o && d === p.id ? o : void 0;
            return e.jsxs(
              i.Fragment,
              {
                children: [
                  e.jsx(ua, {
                    agent: p,
                    current: s === p.id,
                    loading: r === p.id,
                    locked: a,
                    onSelect: c,
                    detailMode: f?.agentID === p.id ? f.mode : void 0,
                    onPreview: (P) =>
                      j((N) =>
                        N?.mode === "pinned" ? N : { agentID: p.id, mode: "preview", anchor: P },
                      ),
                    onPreviewEnd: (P) =>
                      j((N) => (N?.agentID === P && N.mode === "preview" ? null : N)),
                    onToggleDetails: (P) =>
                      j((N) =>
                        N?.agentID === p.id && N.mode === "pinned"
                          ? null
                          : { agentID: p.id, mode: "pinned", anchor: P },
                      ),
                  }),
                  H ? e.jsx(Qt, { error: H, locked: a, onRetry: u, rowLocal: !0 }) : null,
                ],
              },
              p.id,
            );
          }),
          t && v.length === 0
            ? e.jsx("p", { className: "agents-empty", children: "No child agents found." })
            : null,
          !t && n
            ? e.jsxs("p", {
                className: "agents-state",
                "aria-live": "polite",
                children: [
                  e.jsx(qt, { size: 13, className: "spin", "aria-hidden": !0 }),
                  "Loading agents…",
                ],
              })
            : null,
        ],
      }),
      f && R ? e.jsx(ha, { agent: R, state: f, onClose: () => j(null) }) : null,
    ],
  });
}
function Qt({ error: t, locked: s, onRetry: n, rowLocal: r = !1 }) {
  return e.jsxs("div", {
    className: r ? "agents-error row-local" : "agents-error",
    role: "alert",
    children: [
      e.jsxs("span", { children: [e.jsx(jt, { size: 14, "aria-hidden": !0 }), t] }),
      e.jsxs("button", {
        className: "agents-retry",
        onClick: n,
        disabled: s,
        children: [e.jsx(yt, { size: 13, "aria-hidden": !0 }), "Retry"],
      }),
    ],
  });
}
function ua({
  agent: t,
  current: s,
  loading: n,
  locked: r,
  onSelect: a,
  detailMode: o,
  onPreview: d,
  onPreviewEnd: c,
  onToggleDetails: u,
}) {
  const h = t.traceAvailability === "available",
    v = pa(t, n),
    l = [t.role, t.instructionPreview].filter(Boolean).join(" · "),
    y = !h || r;
  return e.jsxs("div", {
    className: ["agent-row", s ? "active" : "", y ? "disabled" : ""].filter(Boolean).join(" "),
    onMouseEnter: (f) => d(f.currentTarget),
    onMouseLeave: () => c(t.id),
    onFocus: (f) => d(f.currentTarget),
    onBlur: (f) => {
      f.currentTarget.contains(f.relatedTarget) || c(t.id);
    },
    children: [
      e.jsxs("button", {
        className: "agent-row-select",
        style: { paddingLeft: `${12 + Math.min(t.depth, 4) * 14}px` },
        "aria-pressed": s,
        disabled: y,
        onClick: () => a(t.id),
        "aria-label": `${t.label}, ${v}`,
        children: [
          e.jsx("span", {
            className: "agent-row-icon",
            "aria-hidden": !0,
            children: n ? e.jsx(qt, { size: 13, className: "spin" }) : e.jsx(Gn, { size: 13 }),
          }),
          e.jsxs("span", {
            className: "agent-row-copy",
            children: [
              e.jsxs("span", {
                className: "agent-row-primary",
                children: [
                  e.jsxs("span", {
                    className: "agent-row-title",
                    children: [
                      t.label,
                      s ? e.jsx("span", { className: "agent-current", children: "current" }) : null,
                    ],
                  }),
                  e.jsx("span", {
                    className: `agent-row-count agent-status-${t.traceAvailability}`,
                    children: v,
                  }),
                ],
              }),
              e.jsx("span", {
                className: "agent-row-secondary",
                children: l || "No launch details",
              }),
            ],
          }),
        ],
      }),
      e.jsx("button", {
        className: "agent-row-detail-trigger",
        "aria-label": `${o === "pinned" ? "Unpin" : "Pin"} details for ${t.label}`,
        "aria-pressed": o === "pinned",
        onClick: (f) => {
          (f.stopPropagation(), u(f.currentTarget.closest(".agent-row")));
        },
        children: e.jsx(mr, { size: 12, "aria-hidden": !0 }),
      }),
    ],
  });
}
function ha({ agent: t, state: s, onClose: n }) {
  const a = i.useRef(null),
    [o, d] = i.useState({
      left: 12,
      top: 12,
      width: Math.min(520, window.innerWidth - 24),
      maxHeight: window.innerHeight - 24,
    });
  return (
    i.useLayoutEffect(() => {
      const c = () => {
          const v = Math.min(520, window.innerWidth - 24),
            l = s.anchor.getBoundingClientRect(),
            y = l.left - v - 12,
            f = l.right + 12,
            j =
              y >= 12
                ? y
                : f + v <= window.innerWidth - 12
                  ? f
                  : Math.min(Math.max(l.left, 12), window.innerWidth - v - 12),
            R = window.innerHeight - 24,
            I = Math.min(a.current?.offsetHeight ?? R, R),
            p = Math.min(Math.max(l.top, 12), window.innerHeight - I - 12);
          d({ left: j, top: p, width: v, maxHeight: R });
        },
        u = s.anchor.closest(".dock-panel");
      return (
        c(),
        window.addEventListener("resize", c),
        window.addEventListener("scroll", c, !0),
        u?.addEventListener("animationend", c),
        () => {
          (window.removeEventListener("resize", c),
            window.removeEventListener("scroll", c, !0),
            u?.removeEventListener("animationend", c));
        }
      );
    }, [s.anchor]),
    i.useEffect(() => {
      if (s.mode !== "pinned") return;
      const c = (h) => {
          h.key === "Escape" && n();
        },
        u = (h) => {
          const v = h.target;
          a.current?.contains(v) || s.anchor.contains(v) || n();
        };
      return (
        document.addEventListener("keydown", c),
        document.addEventListener("pointerdown", u),
        () => {
          (document.removeEventListener("keydown", c),
            document.removeEventListener("pointerdown", u));
        }
      );
    }, [n, s.anchor, s.mode]),
    Rn.createPortal(
      e.jsxs("div", {
        ref: a,
        className: `agent-detail-popover ${s.mode}`,
        role: s.mode === "preview" ? "tooltip" : "dialog",
        "aria-label": `${t.label} details`,
        style: o,
        children: [
          e.jsxs("div", {
            className: "agent-detail-head",
            children: [
              e.jsxs("span", {
                children: [
                  e.jsx("strong", { children: t.label }),
                  t.role ? e.jsx("span", { children: t.role }) : null,
                ],
              }),
              s.mode === "pinned"
                ? e.jsx("button", {
                    className: "agent-detail-close",
                    onClick: n,
                    "aria-label": "Close details",
                    children: e.jsx(Le, { size: 14, "aria-hidden": !0 }),
                  })
                : null,
            ],
          }),
          t.instructionPreview
            ? e.jsx("div", {
                className: "agent-detail-instruction",
                children: t.instructionPreview,
              })
            : null,
          e.jsx("div", { className: "agent-detail-meta", children: fa(t) }),
        ],
      }),
      document.body,
    )
  );
}
function pa(t, s) {
  return s
    ? "Loading trace…"
    : t.traceAvailability === "missing"
      ? "Trace missing"
      : t.status === "failed"
        ? "Launch failed · no trace"
        : t.traceAvailability === "unavailable"
          ? "Trace unavailable"
          : Ds(t.traceEventCount);
}
function Ds(t) {
  return `${t} event${t === 1 ? "" : "s"}`;
}
function fa(t) {
  return `Launch: ${t.status} · Trace: ${t.traceAvailability} · Correlation: ${t.linkQuality} via ${t.linkMethod}`;
}
const ma = [
  {
    group: "Playback",
    entries: [
      { keys: "Space", description: "Play / pause" },
      { keys: "← →", description: "Step one event back / forward" },
      { keys: "Shift + ← →", description: "Jump 10 events back / forward" },
      { keys: "Home / End", description: "Jump to start / end" },
      { keys: "S", description: "Cycle playback speed (1× / 4× / 16×)" },
      { keys: "E", description: "Next edit event" },
      { keys: "Shift + E", description: "Previous edit event" },
      { keys: "X", description: "Next error" },
      { keys: "Shift + X", description: "Previous error" },
      { keys: "M", description: "Next mark" },
      { keys: "Shift + M", description: "Previous mark" },
    ],
  },
  {
    group: "Navigation",
    entries: [
      { keys: "⌘P / Ctrl+P", description: "Open file command palette" },
      { keys: "V", description: "Toggle tree / terrain scene" },
      { keys: "⌘B / Ctrl+B", description: "Toggle session sidebar" },
      { keys: "J / K", description: "Next / previous session in sidebar" },
    ],
  },
  {
    group: "View",
    entries: [
      { keys: "H", description: "Toggle HUD overlay" },
      { keys: "?", description: "Show this cheat sheet" },
    ],
  },
];
function ga({ onClose: t }) {
  const s = i.useRef(null);
  return (
    i.useEffect(() => {
      const n = (r) => {
        r.key === "Escape" && t();
      };
      return (
        window.addEventListener("keydown", n), () => window.removeEventListener("keydown", n)
      );
    }, [t]),
    e.jsx("div", {
      className: "overlay-backdrop",
      onClick: t,
      children: e.jsxs("div", {
        className: "cheat-sheet",
        ref: s,
        onClick: (n) => n.stopPropagation(),
        role: "dialog",
        "aria-label": "Keyboard shortcuts",
        children: [
          e.jsxs("div", {
            className: "cheat-head",
            children: [
              e.jsx("h2", { children: "Shortcuts" }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: t,
                "aria-label": "Close cheat sheet",
                title: "Close (Escape)",
                children: e.jsx(Le, { size: 15 }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "cheat-body",
            children: ma.map((n) =>
              e.jsxs(
                "div",
                {
                  className: "cheat-group",
                  children: [
                    e.jsx("p", { className: "cheat-group-title", children: n.group }),
                    n.entries.map((r) =>
                      e.jsxs(
                        "div",
                        {
                          className: "cheat-row",
                          children: [
                            e.jsx("kbd", { children: r.keys }),
                            e.jsx("span", { children: r.description }),
                          ],
                        },
                        r.keys,
                      ),
                    ),
                  ],
                },
                n.group,
              ),
            ),
          }),
        ],
      }),
    })
  );
}
const es = 12;
function xa(t, s) {
  const n = t.toLowerCase(),
    r = s.toLowerCase();
  if (r === n) return 1e3;
  if (r.endsWith("/" + n)) return 900;
  let a = 0,
    o = 0,
    d = 0,
    c = 0;
  for (; a < r.length && o < n.length;) {
    if (r[a] === n[o]) {
      (c++, (d += 1 + c), (a === 0 || r[a - 1] === "/" || r[a - 1] === ".") && (d += 3));
      const u = r.lastIndexOf("/");
      (a > u && (d += 2), o++);
    } else c = 0;
    a++;
  }
  return o < n.length ? -1 : d;
}
function va({ files: t, touchByPath: s, onSelect: n, onClose: r }) {
  const [a, o] = i.useState(""),
    [d, c] = i.useState(0),
    u = i.useRef(null),
    h = i.useRef(null);
  i.useEffect(() => {
    u.current?.focus();
  }, []);
  const v = i.useMemo(() => {
    const y = a.trim();
    if (!y) return t.slice(0, es).map((j) => ({ file: j, score: 0 }));
    const f = [];
    for (const j of t) {
      const R = xa(y, j.path);
      R >= 0 && f.push({ file: j, score: R });
    }
    return (
      f.sort((j, R) => R.score - j.score || (j.file.path < R.file.path ? -1 : 1)), f.slice(0, es)
    );
  }, [a, t]);
  i.useEffect(() => c(0), [a]);
  const l = (y) => {
    switch (y.key) {
      case "ArrowDown":
        (y.preventDefault(), c((f) => Math.min(f + 1, v.length - 1)));
        break;
      case "ArrowUp":
        (y.preventDefault(), c((f) => Math.max(f - 1, 0)));
        break;
      case "Enter":
        (y.preventDefault(), v[d] && (n(v[d].file.path), r()));
        break;
      case "Escape":
        (y.preventDefault(), r());
        break;
      case "Tab":
        r();
        break;
    }
  };
  return (
    i.useEffect(() => {
      const y = h.current;
      if (!y) return;
      y.children[d]?.scrollIntoView({ block: "nearest" });
    }, [d]),
    e.jsx("div", {
      className: "overlay-backdrop",
      onClick: r,
      children: e.jsxs("div", {
        className: "command-palette",
        onClick: (y) => y.stopPropagation(),
        role: "dialog",
        "aria-label": "Find a file",
        children: [
          e.jsxs("div", {
            className: "palette-input-row",
            children: [
              e.jsx(Dt, { size: 15, "aria-hidden": !0 }),
              e.jsx("input", {
                ref: u,
                type: "text",
                placeholder: "Search files by path…",
                value: a,
                onChange: (y) => o(y.currentTarget.value),
                onKeyDown: l,
                spellCheck: !1,
                "aria-label": "File search",
                "aria-controls": "palette-results",
              }),
              e.jsx("kbd", { children: "↵" }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: r,
                "aria-label": "Close",
                children: e.jsx(Le, { size: 15 }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "palette-results",
            id: "palette-results",
            ref: h,
            children:
              v.length === 0
                ? e.jsxs("p", {
                    className: "palette-empty",
                    children: ['No files match "', a, '".'],
                  })
                : v.map(({ file: y }, f) => {
                    const j = y.path.lastIndexOf("/"),
                      R = j >= 0 ? y.path.slice(0, j + 1) : "",
                      I = j >= 0 ? y.path.slice(j + 1) : y.path,
                      p = s.get(y.path);
                    return e.jsxs(
                      "button",
                      {
                        className: f === d ? "palette-result active" : "palette-result",
                        onClick: () => {
                          (n(y.path), r());
                        },
                        onMouseEnter: () => c(f),
                        children: [
                          e.jsx("span", { className: `palette-dot ${p ?? "none"}` }),
                          e.jsx(dr, { size: 13, "aria-hidden": !0 }),
                          e.jsx("span", { className: "palette-name", children: I }),
                          e.jsx("span", { className: "palette-dir", children: R }),
                          y.lang
                            ? e.jsx("span", { className: "palette-lang", children: y.lang })
                            : null,
                        ],
                      },
                      y.id,
                    );
                  }),
          }),
          e.jsxs("div", {
            className: "palette-foot",
            children: [
              e.jsxs("span", {
                children: [e.jsx(er, { size: 11, "aria-hidden": !0 }), " Enter to fly"],
              }),
              e.jsx("span", { children: "Esc to close" }),
            ],
          }),
        ],
      }),
    })
  );
}
const ya = [
    { label: "All", value: "all" },
    { label: "Search", value: "search" },
    { label: "Read", value: "read" },
    { label: "Edit", value: "edit" },
    { label: "Verify", value: "verify" },
    { label: "Exec", value: "exec" },
    { label: "Errors", value: "error" },
  ],
  et = 36,
  ts = 8,
  wa = i.memo(function ({ trace: s, currentSeq: n, onChange: r, locked: a = !1 }) {
    const [o, d] = i.useState("all"),
      [c, u] = i.useState(0),
      h = i.useRef(null),
      v = s?.events ?? [],
      l = i.useMemo(
        () =>
          o === "all"
            ? v
            : o === "error"
              ? v.filter((p) => p.isError)
              : v.filter((p) => p.action === o),
        [v, o],
      ),
      y = h.current?.clientHeight ?? 400,
      f = Math.max(0, Math.floor(c / et) - ts),
      j = Math.min(l.length, Math.ceil((c + y) / et) + ts),
      R = l.slice(f, j),
      I = l.length * et;
    return (
      i.useEffect(() => {
        h.current
          ?.querySelector('[data-current="true"]')
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, [n]),
      e.jsxs("div", {
        className: "event-list-container",
        children: [
          e.jsx("div", {
            className: "event-list-filters",
            children: ya.map((p) =>
              e.jsx(
                "button",
                {
                  className: o === p.value ? "event-filter-chip active" : "event-filter-chip",
                  onClick: () => d(p.value),
                  children: p.label,
                },
                p.value,
              ),
            ),
          }),
          e.jsxs("div", {
            className: "event-list",
            ref: h,
            onScroll: (p) => u(p.currentTarget.scrollTop),
            children: [
              e.jsx("div", {
                style: { height: I, position: "relative" },
                children: e.jsx("div", {
                  style: { transform: `translateY(${f * et}px)` },
                  children: R.map((p) => {
                    const H = p.seq === n;
                    return e.jsxs(
                      "button",
                      {
                        className: H ? "event-list-row current" : "event-list-row",
                        "data-current": H || void 0,
                        style: { height: et },
                        onClick: () => r(p.seq),
                        disabled: a,
                        title: p.summary,
                        children: [
                          e.jsx("span", { className: "event-list-seq", children: p.seq + 1 }),
                          e.jsx("span", { className: `action-dot ${p.action}` }),
                          e.jsx("span", { className: "event-list-tool", children: p.tool }),
                          p.isError ? e.jsx(jt, { size: 12, className: "event-list-err" }) : null,
                          e.jsx("span", { className: "event-list-summary", children: p.summary }),
                        ],
                      },
                      p.seq,
                    );
                  }),
                }),
              }),
              l.length === 0
                ? e.jsx("p", {
                    className: "muted",
                    style: { padding: "12px", textAlign: "center" },
                    children: "No events match this filter.",
                  })
                : null,
            ],
          }),
          e.jsx("div", {
            className: "event-list-count",
            children:
              l.length === v.length ? `${v.length} events` : `${l.length} of ${v.length} events`,
          }),
        ],
      })
    );
  }),
  Fs = {
    exploration: {
      title: "Exploration",
      hint: "Did the agent build enough understanding before editing?",
    },
    scope: { title: "Scope", hint: "Does the footprint match what the task needed?" },
    wandering: { title: "Wandering", hint: "Purposeful path, or circles and dead ends?" },
    verification: { title: "Verification", hint: "Were edits verified, and errors followed up?" },
  },
  _s = {
    claude: [
      { value: "", label: "default model" },
      { value: "sonnet", label: "sonnet" },
      { value: "opus", label: "opus" },
      { value: "fable", label: "fable" },
    ],
    codex: [
      { value: "", label: "default model" },
      { value: "gpt-5.6-sol", label: "gpt-5.6 sol" },
      { value: "gpt-5.6-terra", label: "gpt-5.6 terra" },
    ],
  },
  Os = "mindwalk:judge-choice";
function ba() {
  try {
    const t = localStorage.getItem(Os);
    if (t) {
      const s = JSON.parse(t);
      return {
        cli: typeof s.cli == "string" ? s.cli : "",
        model: typeof s.model == "string" ? s.model : "",
      };
    }
  } catch {}
  return { cli: "", model: "" };
}
function ja(t, s) {
  const n = s.includes(t.cli) ? t.cli : (s[0] ?? ""),
    a = (_s[n] ?? []).some((o) => o.value === t.model) ? t.model : "";
  return { cli: n, model: a };
}
function ka({
  status: t,
  analyzing: s,
  progress: n,
  locked: r,
  onAnalyze: a,
  onClose: o,
  onJumpTo: d,
}) {
  const [c, u] = i.useState(ba),
    h = t?.judgeClis ?? (t?.judgeCli ? [t.judgeCli] : []),
    v = ja(c, h),
    l = i.useCallback((f) => {
      u(f);
      try {
        localStorage.setItem(Os, JSON.stringify(f));
      } catch {}
    }, []),
    y = i.useCallback(() => a(v), [a, v]);
  return e.jsxs("div", {
    className: "dock-body",
    "aria-label": "Session evaluation",
    children: [
      e.jsxs("div", {
        className: "inspector-head",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("div", { className: "inspector-path", children: "Evaluation" }),
              t?.report
                ? e.jsxs("div", {
                    className: "report-meta",
                    children: [
                      "judged by ",
                      t.report.judge.cli,
                      t.report.judge.model ? ` · ${t.report.judge.model}` : "",
                      " ·",
                      " ",
                      za(t.report.judge.generatedAt),
                    ],
                  })
                : null,
            ],
          }),
          e.jsx("button", {
            className: "icon-btn",
            onClick: o,
            title: "Close",
            "aria-label": "Close evaluation",
            children: e.jsx(Le, { size: 15 }),
          }),
        ],
      }),
      e.jsx(Ea, {
        status: t,
        analyzing: s,
        progress: n,
        locked: r,
        analyze: y,
        onJumpTo: d,
        picker: h.length > 0 ? e.jsx(Na, { clis: h, choice: v, onChange: l }) : null,
      }),
    ],
  });
}
function Na({ clis: t, choice: s, onChange: n }) {
  const r = _s[s.cli] ?? [{ value: "", label: "default model" }];
  return e.jsxs("div", {
    className: "report-picker",
    children: [
      e.jsx("select", {
        value: s.cli,
        onChange: (a) => n({ cli: a.target.value, model: "" }),
        "aria-label": "Judge agent",
        title: "Which agent CLI judges this session",
        children: t.map((a) => e.jsx("option", { value: a, children: a }, a)),
      }),
      e.jsx("select", {
        value: s.model,
        onChange: (a) => n({ ...s, model: a.target.value }),
        "aria-label": "Judge model",
        title: "Which model the judge runs on",
        children: r.map((a) => e.jsx("option", { value: a.value, children: a.label }, a.value)),
      }),
    ],
  });
}
const ht = {
  start: { icon: "○", label: "Starting" },
  rubric: { icon: "✎", label: "Rubric" },
  scoring: { icon: "≡", label: "Scoring" },
  done: { icon: "✓", label: "Done" },
  error: { icon: "✗", label: "Error" },
};
function Ma({ progress: t }) {
  const s = t.length > 0 ? t[t.length - 1] : null,
    n = s?.phase ?? "start",
    r = ht[n] ?? ht.start;
  return e.jsxs("div", {
    className: "report-note",
    children: [
      e.jsxs("p", {
        className: "report-running",
        children: [
          e.jsx("span", { className: "report-progress-icon", "aria-hidden": !0, children: r.icon }),
          " ",
          s?.message ?? "Judging the trajectory…",
        ],
      }),
      t.length > 1 &&
        e.jsx("ul", {
          className: "report-progress-log",
          children: t.slice(0, -1).map((a, o) => {
            const d = ht[a.phase] ?? ht.start;
            return e.jsxs(
              "li",
              {
                className: "report-progress-step",
                children: [
                  e.jsx("span", {
                    className: "report-progress-icon done",
                    "aria-hidden": !0,
                    children: d.icon,
                  }),
                  " ",
                  a.message,
                ],
              },
              o,
            );
          }),
        }),
      e.jsx("p", {
        className: "report-progress-hint",
        children:
          "The judge first drafts task-specific criteria from your request, then scores the session against them plus four process dimensions. Usually a minute or two; you can keep exploring meanwhile.",
      }),
    ],
  });
}
function Ea({
  status: t,
  analyzing: s,
  progress: n,
  locked: r,
  analyze: a,
  onJumpTo: o,
  picker: d,
}) {
  if (!t)
    return e.jsx("p", { className: "report-note", children: "Checking for an existing report…" });
  if (t.state === "running" || s) return e.jsx(Ma, { progress: n });
  if (t.state === "failed")
    return e.jsxs("div", {
      className: "report-note",
      children: [
        e.jsxs("p", {
          className: "report-error",
          children: [e.jsx(jt, { size: 13 }), " Evaluation failed"],
        }),
        e.jsx("p", { className: "report-error-detail", children: t.error }),
        d,
        e.jsxs("button", {
          className: "report-run",
          onClick: a,
          children: [e.jsx(yt, { size: 13 }), "Retry"],
        }),
      ],
    });
  if (t.state === "none" || !t.report)
    return t.judgeAvailable
      ? e.jsxs("div", {
          className: "report-note",
          children: [
            e.jsx("p", {
              children:
                "Ask an agent to evaluate this session: how it explored, whether the footprint matched the task, where it wandered, and how it verified its work. Every finding links back to the timeline.",
            }),
            d,
            e.jsxs("button", {
              className: "report-run",
              onClick: a,
              children: [e.jsx(Bs, { size: 13 }), "Evaluate session"],
            }),
            e.jsx("p", {
              className: "report-cost",
              children:
                "Runs the selected CLI under your own account and sends it a summary of this session — task wording, file paths, event digests — for the model to read. About a minute.",
            }),
          ],
        })
      : e.jsxs("p", {
          className: "report-note",
          children: [
            "Evaluation needs a local agent CLI as judge. Install ",
            e.jsx("code", { children: "claude" }),
            ",",
            " ",
            e.jsx("code", { children: "codex" }),
            ", or ",
            e.jsx("code", { children: "crush" }),
            " and make it available on PATH.",
          ],
        });
  const c = t.report;
  return e.jsxs("div", {
    className: "report-body",
    children: [
      e.jsxs("div", {
        className: "report-controls",
        children: [
          t.stale
            ? e.jsxs("p", {
                className: "report-stale-note",
                children: [
                  "Based on ",
                  c.session.eventCount,
                  " events — the session has grown since.",
                ],
              })
            : null,
          e.jsxs("div", {
            className: "report-stale-actions",
            children: [
              d,
              e.jsxs("button", {
                className: "report-rerun",
                onClick: a,
                title: t.stale
                  ? "Re-evaluate with the current trace"
                  : "Run a fresh evaluation of this session",
                children: [e.jsx(yt, { size: 12 }), "Re-evaluate"],
              }),
            ],
          }),
        ],
      }),
      e.jsx(La, { dimensions: c.dimensions }),
      e.jsx(Ia, { dimensions: c.dimensions }),
      e.jsx("p", { className: "report-task", children: c.taskSummary }),
      e.jsx("p", { className: "report-narrative", children: c.narrative }),
      e.jsx(Ca, { rubric: c.rubric, locked: r, onJumpTo: o }),
      e.jsx("p", { className: "report-chapter", children: "Process" }),
      c.dimensions.map((u) => e.jsx($a, { dimension: u, locked: r, onJumpTo: o }, u.name)),
      c.notableMoments?.length
        ? e.jsxs("section", {
            className: "report-section",
            children: [
              e.jsx("p", { className: "eyebrow", children: "Moments" }),
              c.notableMoments.map((u) =>
                e.jsxs(
                  "button",
                  {
                    className: "report-moment",
                    onClick: () => o(u.seq),
                    disabled: r,
                    title: `Jump to step ${u.seq + 1}`,
                    children: [
                      e.jsxs("strong", { children: ["#", u.seq + 1] }),
                      e.jsx("span", { children: u.note }),
                    ],
                  },
                  u.seq,
                ),
              ),
            ],
          })
        : null,
    ],
  });
}
function Ca({ rubric: t, locked: s, onJumpTo: n }) {
  if (!t)
    return e.jsx("p", {
      className: "report-rubric-note",
      children: "This report has no task rubric — re-evaluate to add one.",
    });
  if (t.status !== "scored" || !t.tasks?.length) {
    const u =
      t.reason === "generation-failed"
        ? "Task rubric unavailable this run — showing process dimensions only."
        : t.reason === "no-events"
          ? "No tool events to evidence a rubric."
          : "Not enough task text to build a rubric from.";
    return e.jsx("p", { className: "report-rubric-note", children: u });
  }
  const r = t.tasks,
    a = r.flatMap((u) => u.criteria),
    o = a.filter((u) => u.coverage && u.coverage !== "sufficient"),
    d = a.length > 0 && o.length / a.length > 0.4,
    c = r.length > 1;
  return e.jsxs("div", {
    className: "report-rubric",
    children: [
      e.jsx("p", { className: "report-chapter", children: "Tasks" }),
      d
        ? e.jsxs("p", {
            className: "report-rubric-hint",
            children: [
              o.length,
              " of ",
              a.length,
              " criteria had thin evidence — the log may not show enough to judge them.",
            ],
          })
        : null,
      r.map((u, h) =>
        e.jsx(Sa, { task: u, multi: c, locked: s, onJumpTo: n }, u.anchorSeqs?.[0] ?? `task-${h}`),
      ),
      t.note
        ? e.jsxs("div", {
            className: "report-rubric-footnote",
            children: [
              e.jsx("p", { className: "eyebrow", children: "Rubric note" }),
              e.jsx("p", { children: t.note }),
            ],
          })
        : null,
    ],
  });
}
function Sa({ task: t, multi: s, locked: n, onJumpTo: r }) {
  const a = t.anchorSeqs?.[0];
  return e.jsxs("section", {
    className: "report-rubric-task",
    children: [
      s
        ? e.jsx("button", {
            className: "rubric-task-head",
            onClick: () => {
              a !== void 0 && r(a);
            },
            disabled: n || a === void 0,
            title: a !== void 0 ? `Jump to this task's start (step ${a + 1})` : void 0,
            children: e.jsxs("span", {
              className: "rubric-task-title",
              children: [
                t.title,
                t.type ? e.jsx("span", { className: "rubric-task-type", children: t.type }) : null,
              ],
            }),
          })
        : null,
      t.criteria.map((o) => e.jsx(Ra, { criterion: o, locked: n, onJumpTo: r }, o.id)),
    ],
  });
}
function Ra({ criterion: t, locked: s, onJumpTo: n }) {
  const r = [t.why, t.good ? `good: ${t.good}` : "", t.bad ? `bad: ${t.bad}` : ""].filter(Boolean)
    .join(`
`);
  return e.jsxs("section", {
    className: "report-dimension report-criterion",
    children: [
      e.jsxs("div", {
        className: "report-dimension-head",
        children: [
          e.jsx("span", {
            className: "report-criterion-name",
            title: r || void 0,
            children: t.title,
          }),
          e.jsxs("span", {
            className: "report-criterion-badges",
            children: [
              t.coverage === "partial"
                ? e.jsx("span", { className: "coverage-badge", children: "partial evidence" })
                : null,
              e.jsx("span", {
                className: `verdict verdict-${t.verdict}`,
                title:
                  t.coverage === "none"
                    ? "The log cannot evidence this criterion either way"
                    : void 0,
                children: Ws(t.verdict),
              }),
            ],
          }),
        ],
      }),
      t.findings.map((a) =>
        e.jsx(
          Hs,
          { finding: a, locked: s, onJumpTo: n },
          `${a.severity}|${a.evidenceSeqs?.join(",")}|${a.claim}`,
        ),
      ),
    ],
  });
}
function Hs({ finding: t, locked: s, onJumpTo: n }) {
  return e.jsxs("button", {
    className: "report-finding",
    onClick: () => {
      const r = t.evidenceSeqs?.[0];
      r !== void 0 && n(r);
    },
    disabled: s || !t.evidenceSeqs?.length,
    title: t.evidenceSeqs?.length
      ? `Jump to step ${t.evidenceSeqs[0] + 1} — evidence: ${t.evidenceSeqs.map((r) => `#${r + 1}`).join(" ")}`
      : void 0,
    children: [
      e.jsx("span", { className: `severity-dot ${Aa(t.severity)}` }),
      e.jsx("span", { className: "report-claim", children: t.claim }),
    ],
  });
}
function $a({ dimension: t, locked: s, onJumpTo: n }) {
  const r = Fs[t.name] ?? { title: t.name, hint: "" };
  return e.jsxs("section", {
    className: "report-dimension",
    children: [
      e.jsxs("div", {
        className: "report-dimension-head",
        "data-hint": r.hint,
        children: [
          e.jsx("span", { className: "report-dimension-name", children: r.title }),
          e.jsx("span", { className: `verdict verdict-${t.verdict}`, children: Ws(t.verdict) }),
        ],
      }),
      t.findings.map((a) =>
        e.jsx(
          Hs,
          { finding: a, locked: s, onJumpTo: n },
          `${a.severity}|${a.evidenceSeqs?.join(",")}|${a.claim}`,
        ),
      ),
    ],
  });
}
function Ws(t) {
  return t === "insufficient-data" ? "no signal" : t;
}
function Aa(t) {
  return `sev-${t}`;
}
function La({ dimensions: t }) {
  const s = t.reduce((u, h) => ((u[h.verdict] = (u[h.verdict] ?? 0) + 1), u), {}),
    n = s.problem ?? 0,
    r = s.warning ?? 0,
    a = s.good ?? 0,
    o = s["insufficient-data"] ?? 0;
  let d, c;
  return (
    n > 0
      ? ((d = `${n} problem${n > 1 ? "s" : ""}${r > 0 ? `, ${r} warning${r > 1 ? "s" : ""}` : ""}`),
        (c = "verdict-problem"))
      : r > 0
        ? ((d = `${r} warning${r > 1 ? "s" : ""}${a > 0 ? `, ${a} passing` : ""}`),
          (c = "verdict-warning"))
        : a === t.length
          ? ((d = "All dimensions passing"), (c = "verdict-good"))
          : o > 0
            ? ((d = `${o} dimension${o > 1 ? "s" : ""} lack signal`), (c = "verdict-insufficient"))
            : ((d = `${t.length} dimensions evaluated`), (c = "verdict-neutral")),
    e.jsx("div", {
      className: `report-verdict ${c}`,
      children: e.jsx("span", { className: "verdict-label", children: d }),
    })
  );
}
function za(t) {
  const s = new Date(t);
  return Number.isNaN(s.getTime()) ? "" : s.toISOString().slice(0, 10);
}
function Pa(t) {
  switch (t) {
    case "good":
      return 1;
    case "warning":
      return 0.5;
    case "problem":
      return 0;
    case "insufficient-data":
      return 0.25;
  }
}
function Ta(t) {
  const s = t.map((n) => n.verdict);
  return s.includes("problem")
    ? "var(--alarm, #e05555)"
    : s.includes("warning")
      ? "var(--amber, #e0a458)"
      : s.every((n) => n === "good")
        ? "var(--moss)"
        : "var(--muted)";
}
function Ia({ dimensions: t }) {
  if (t.length < 3) return null;
  const s = 130,
    n = s / 2,
    r = s * 0.35,
    a = t.slice(0, 4),
    o = (h) => (Math.PI * 2 * h) / a.length - Math.PI / 2,
    d = (h, v) => {
      const l = o(v);
      return [n + Math.cos(l) * r * h, n + Math.sin(l) * r * h];
    },
    c = a.map((h, v) => d(Pa(h.verdict), v).join(",")).join(" "),
    u = Ta(t);
  return e.jsx("div", {
    className: "radar-chart",
    children: e.jsxs("svg", {
      width: s,
      height: s,
      viewBox: `0 0 ${s} ${s}`,
      role: "img",
      "aria-label": "Dimension radar chart",
      children: [
        [0.25, 0.5, 0.75, 1].map((h) => {
          const v = a.map((l, y) => d(h, y).join(",")).join(" ");
          return e.jsx(
            "polygon",
            {
              points: v,
              fill: "none",
              stroke: "var(--hairline)",
              strokeWidth: "0.5",
              opacity: 0.6,
            },
            h,
          );
        }),
        a.map((h, v) => {
          const [l, y] = d(1, v);
          return e.jsx(
            "line",
            {
              x1: n,
              y1: n,
              x2: l,
              y2: y,
              stroke: "var(--hairline)",
              strokeWidth: "0.5",
              opacity: 0.4,
            },
            v,
          );
        }),
        e.jsx("polygon", { points: c, fill: u, fillOpacity: 0.2, stroke: u, strokeWidth: "1.5" }),
        a.map((h, v) => {
          const [l, y] = d(1.18, v),
            f = Fs[h.name] ?? { title: h.name };
          return e.jsx(
            "text",
            {
              x: l,
              y,
              textAnchor: "middle",
              dominantBaseline: "middle",
              className: "radar-label",
              children: f.title,
            },
            h.name,
          );
        }),
      ],
    }),
  });
}
function Ba({
  view: t,
  onViewChange: s,
  note: n,
  locked: r = !1,
  heatMode: a = !1,
  onHeatModeChange: o,
}) {
  return e.jsxs("div", {
    className: "view-pop",
    role: "group",
    "aria-label": "Scene view",
    children: [
      e.jsxs("button", {
        "aria-pressed": t === "tree",
        className: t === "tree" ? "view-row active" : "view-row",
        onClick: () => s("tree"),
        disabled: r,
        "data-hint": "Tree view: each file is a block, height = line count, touch state = color",
        children: [e.jsx(qs, { size: 14 }), e.jsx("span", { children: "Tree" })],
      }),
      e.jsxs("button", {
        "aria-pressed": t === "terrain",
        className: t === "terrain" ? "view-row active" : "view-row",
        onClick: () => s("terrain"),
        disabled: r,
        "data-hint": "Terrain view: extruded city blocks, height = size, glow = revisits",
        children: [e.jsx(Is, { size: 14 }), e.jsx("span", { children: "Terrain" })],
      }),
      o
        ? e.jsxs("button", {
            "aria-pressed": a,
            className: a ? "view-row active" : "view-row",
            onClick: () => o(!a),
            disabled: r,
            "data-hint": "Edit heatmap: recolor the minimap by edit count — red = most edited",
            children: [e.jsx(hr, { size: 14 }), e.jsx("span", { children: "Heat" })],
          })
        : null,
      e.jsxs("p", {
        className: "view-note",
        children: [n, e.jsx("span", { className: "view-key", children: "V" })],
      }),
    ],
  });
}
const pt = { hit: 1, read: 2, edit: 3 },
  qa = 12;
class Da {
  events;
  idByPath = new Map();
  cursor = -1;
  touchByFile = new Map();
  touchByPath = new Map();
  visitsByFile = new Map();
  historyByPath = new Map();
  recentTargets = [];
  constructor(s, n) {
    this.events = s?.events ?? [];
    for (const r of n?.files ?? []) this.idByPath.set(r.path, r.id);
  }
  snapshotAt(s) {
    const n = Math.min(s, this.events.length - 1);
    n < this.cursor && this.reset();
    for (let r = this.cursor + 1; r <= n; r++) this.apply(this.events[r]);
    return (
      (this.cursor = Math.max(this.cursor, n)),
      {
        touchByFile: this.touchByFile,
        touchByPath: this.touchByPath,
        visitsByFile: this.visitsByFile,
        historyByPath: this.historyByPath,
        recentTargets: this.recentTargets,
      }
    );
  }
  reset() {
    ((this.cursor = -1),
      this.touchByFile.clear(),
      this.touchByPath.clear(),
      this.visitsByFile.clear(),
      this.historyByPath.clear(),
      (this.recentTargets.length = 0));
  }
  apply(s) {
    for (const n of s.targets) {
      const r = this.touchByPath.get(n.path);
      (!r || pt[n.touch] > pt[r]) && this.touchByPath.set(n.path, n.touch);
      const a = n.fileId ?? this.idByPath.get(n.path);
      if (a !== void 0) {
        const d = this.touchByFile.get(a);
        ((!d || pt[n.touch] > pt[d]) && this.touchByFile.set(a, n.touch),
          this.visitsByFile.set(a, (this.visitsByFile.get(a) ?? 0) + 1));
      }
      const o = this.historyByPath.get(n.path);
      o ? o.push(s) : this.historyByPath.set(n.path, [s]);
    }
    if (s.targets.length > 0) {
      const n = s.targets.find((r) => !r.weak) ?? s.targets[0];
      (this.recentTargets.push({ ...n, fileId: n.fileId ?? this.idByPath.get(n.path) }),
        this.recentTargets.length > qa && this.recentTargets.shift());
    }
  }
}
function Fa(t) {
  const n = t.split(";")[0].trim().toLowerCase().split("/")[1] ?? "";
  return n.includes("webm")
    ? "webm"
    : n.includes("mp4")
      ? "mp4"
      : n.includes("x-matroska") || n.includes("matroska")
        ? "mkv"
        : n.includes("ogg")
          ? "ogv"
          : n || "webm";
}
const _a = 30,
  Oa = 3e4,
  Ha = 120;
function Wa() {
  const t = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const s of t) if (typeof MediaRecorder < "u" && MediaRecorder.isTypeSupported(s)) return s;
}
function Us() {
  return (
    typeof MediaRecorder < "u" &&
    typeof HTMLCanvasElement < "u" &&
    typeof HTMLCanvasElement.prototype.captureStream == "function"
  );
}
function Ua(t) {
  const { canvas: s, total: n, setSeq: r, onProgress: a, signal: o } = t,
    d = t.fps ?? _a;
  if (!Us())
    return Promise.reject(
      new Error("This browser can't record the canvas (MediaRecorder unavailable)."),
    );
  if (n <= 0) return Promise.reject(new Error("Nothing to record — load a session first."));
  const c = t.durationMs ?? Math.min(Oa, Math.max(1e3, n * Ha)),
    u = Wa(),
    h = s.captureStream(d),
    v = u ? new MediaRecorder(h, { mimeType: u }) : new MediaRecorder(h),
    l = [];
  return new Promise((y, f) => {
    let j = 0,
      R = 0,
      I = !1;
    const p = () => {
        (j && cancelAnimationFrame(j),
          h.getTracks().forEach((L) => L.stop()),
          o?.removeEventListener("abort", N));
      },
      H = () => {
        if (I) return;
        ((I = !0), p());
        const L = v.mimeType || u || "video/webm";
        y({ blob: new Blob(l, { type: L }), extension: Fa(L) });
      },
      P = (L) => {
        if (!I) {
          ((I = !0), p());
          try {
            v.state !== "inactive" && v.stop();
          } catch {}
          f(L);
        }
      },
      N = () => P(new Error("Recording cancelled."));
    if (
      ((v.ondataavailable = (L) => {
        L.data && L.data.size > 0 && l.push(L.data);
      }),
      (v.onerror = () => P(new Error("Recording failed."))),
      (v.onstop = H),
      o)
    ) {
      if (o.aborted) {
        P(new Error("Recording cancelled."));
        return;
      }
      o.addEventListener("abort", N);
    }
    const T = (L) => {
      if (I) return;
      R || (R = L);
      const $ = Math.min(1, (L - R) / c),
        W = Math.min(n - 1, Math.floor($ * (n - 1)));
      if ((r(W), a?.($), $ >= 1)) {
        j = requestAnimationFrame(() => {
          v.state !== "inactive" && v.stop();
        });
        return;
      }
      j = requestAnimationFrame(T);
    };
    (r(0), v.start(), (j = requestAnimationFrame(T)));
  });
}
function Ka(t, s) {
  const n = URL.createObjectURL(t),
    r = document.createElement("a");
  ((r.href = n),
    (r.download = s),
    document.body.appendChild(r),
    r.click(),
    r.remove(),
    setTimeout(() => URL.revokeObjectURL(n), 1e3));
}
function Fe(t) {
  switch (t) {
    case "hit":
      return "seen";
    case "read":
      return "read";
    case "edit":
      return "edited";
    default:
      return "unvisited";
  }
}
let tt = null;
function Ks() {
  if (tt) return tt;
  const t = 64,
    s = document.createElement("canvas");
  ((s.width = t), (s.height = t));
  const n = s.getContext("2d"),
    r = n.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
  return (
    r.addColorStop(0, "rgba(255,255,255,1)"),
    r.addColorStop(0.25, "rgba(255,210,160,0.55)"),
    r.addColorStop(1, "rgba(255,158,94,0)"),
    (n.fillStyle = r),
    n.fillRect(0, 0, t, t),
    (tt = new Tt(s)),
    (tt.userData.shared = !0),
    tt
  );
}
let st = null;
function Va() {
  if (st) return st;
  const t = 128,
    s = document.createElement("canvas");
  ((s.width = t), (s.height = t));
  const n = s.getContext("2d"),
    r = n.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
  return (
    r.addColorStop(0, "rgba(255,255,255,0.9)"),
    r.addColorStop(0.4, "rgba(255,255,255,0.28)"),
    r.addColorStop(1, "rgba(255,255,255,0)"),
    (n.fillStyle = r),
    n.fillRect(0, 0, t, t),
    (st = new Tt(s)),
    (st.userData.shared = !0),
    st
  );
}
function Ga(t) {
  const s = '500 30px "Schibsted Grotesk Variable", "PingFang SC", sans-serif',
    n = document.createElement("canvas").getContext("2d");
  n.font = s;
  const r = Math.ceil(n.measureText(t).width) + 24,
    a = 44,
    o = document.createElement("canvas");
  ((o.width = r * 2), (o.height = a * 2));
  const d = o.getContext("2d");
  (d.scale(2, 2),
    (d.font = s),
    (d.textBaseline = "middle"),
    (d.textAlign = "center"),
    (d.fillStyle = "rgba(197, 205, 222, 0.95)"),
    d.fillText(t, r / 2, a / 2 + 1));
  const c = new Tt(o);
  return ((c.anisotropy = 4), { texture: c, aspect: r / a });
}
const Xa = 60,
  Ya = 120;
class Vs {
  labels = [];
  y;
  dirty = !0;
  lastCamPos = new ce(1 / 0, 1 / 0, 1 / 0);
  lastCamQuat = new De(0, 0, 0, 0);
  lastViewW = 0;
  lastViewH = 0;
  point = new ce();
  constructor(s, n, r, a = !1) {
    this.y = r;
    const o = [...s].sort((d, c) => c.fileCount - d.fileCount).slice(0, Ya);
    for (const d of o) {
      const { texture: c, aspect: u } = Ga(d.name),
        h = new bt(
          new It({
            map: c,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            depthTest: !a,
            toneMapped: !1,
            fog: !1,
          }),
        );
      (a && (h.renderOrder = 20),
        (h.visible = !1),
        h.position.set(d.x, r, d.z),
        (h.raycast = () => {}),
        n.add(h),
        this.labels.push({ sprite: h, entry: d, aspect: u, target: 0 }));
    }
  }
  markDirty() {
    this.dirty = !0;
  }
  updateTargets(s, n, r) {
    if (
      this.labels.length === 0 ||
      n === 0 ||
      r === 0 ||
      !(
        this.dirty ||
        !s.position.equals(this.lastCamPos) ||
        !s.quaternion.equals(this.lastCamQuat) ||
        n !== this.lastViewW ||
        r !== this.lastViewH
      )
    )
      return;
    ((this.dirty = !1),
      this.lastCamPos.copy(s.position),
      this.lastCamQuat.copy(s.quaternion),
      (this.lastViewW = n),
      (this.lastViewH = r));
    const o = Math.tan(Bt.degToRad(s.fov) / 2),
      d = Math.max(n, r),
      c = [];
    for (const h of this.labels) {
      this.point.set(h.entry.x, this.y, h.entry.z);
      const v = this.point.distanceTo(s.position),
        l = r / (2 * v * o),
        y = h.entry.radius * l;
      this.point.project(s);
      const f = ((this.point.x + 1) / 2) * n,
        j = ((1 - this.point.y) / 2) * r;
      if (
        !(this.point.z < 1 && f > -60 && f < n + 60 && j > -40 && j < r + 40) ||
        y < Xa ||
        y > d * 1.6
      ) {
        h.target = 0;
        continue;
      }
      const I = h.entry.depth <= 1 ? 15 : 13,
        p = I / l;
      (h.sprite.scale.set(p * h.aspect, p, 1),
        c.push({ label: h, sx: f, sy: j, pw: I * h.aspect, ph: I }));
    }
    c.sort((h, v) => v.label.entry.fileCount - h.label.entry.fileCount);
    const u = [];
    for (const h of c) {
      const v = u.some(
        (l) =>
          Math.abs(l.sx - h.sx) < (l.pw + h.pw) / 2 + 14 &&
          Math.abs(l.sy - h.sy) < (l.ph + h.ph) / 2 + 10,
      );
      ((h.label.target = v ? 0 : 1), v || u.push(h));
    }
  }
  ease(s) {
    for (const n of this.labels) {
      const r = n.sprite.material,
        a = n.target - r.opacity;
      (Math.abs(a) > 0.02
        ? (r.opacity = s ? n.target : r.opacity + a * 0.16)
        : r.opacity !== n.target && (r.opacity = n.target),
        (n.sprite.visible = r.opacity > 0.02));
    }
  }
}
const wt = new ye("#12151c"),
  Gs = new ye("#ff9e5e"),
  Xs = {
    hit: new ye("#8fb45f"),
    read: new ye("#a5c8f1"),
    edit: new ye("#f0ad5a"),
    selected: new ye("#f6ead2"),
  };
function Ys(t, s, n) {
  if (!Number.isFinite(t.aspect) || t.aspect <= 0) return null;
  const r = s.clone().negate(),
    a = new ce().crossVectors(r, new ce(0, 1, 0)).normalize(),
    o = new ce().crossVectors(a, r),
    d = Math.tan(Bt.degToRad(t.fov) / 2),
    c = d * t.aspect;
  let u = 0;
  for (const h of n) {
    const v = h.dot(r);
    u = Math.max(u, Math.abs(h.dot(a)) / c - v, Math.abs(h.dot(o)) / d - v);
  }
  return u;
}
function Zs(t, s, n, r, a, o) {
  if (r === 0 || a === 0) return;
  const d = t.getWorldDirection(new ce()),
    c = n.clone().sub(t.position).dot(d);
  if (c <= 0) return;
  const u = n.clone().project(t),
    h = ((u.x + 1) / 2) * r,
    v = ((1 - u.y) / 2) * a,
    l = 48,
    y = Math.max(l + 60, r - o - 48),
    f = 120,
    j = a - 100,
    R = Math.min(Math.max(h, l), y),
    I = Math.min(Math.max(v, f), j);
  if (R === h && I === v) return;
  const p = Math.tan(Bt.degToRad(t.fov) / 2),
    H = p * t.aspect,
    P = new ce().crossVectors(d, new ce(0, 1, 0)).normalize(),
    N = new ce().crossVectors(P, d),
    T = P.multiplyScalar(((h - R) * 2 * c * H) / r).addScaledVector(N, ((I - v) * 2 * c * p) / a);
  (t.position.add(T), s.target.add(T), s.update());
}
class Js {
  constructor(s) {
    ((this.host = s),
      (this.el = document.createElement("div")),
      (this.el.className = "scene-tip"),
      (this.pathEl = document.createElement("span")),
      (this.metaEl = document.createElement("span")),
      (this.metaEl.className = "dim"),
      this.el.append(this.pathEl, this.metaEl),
      s.appendChild(this.el));
  }
  host;
  el;
  pathEl;
  metaEl;
  show(s, n, r, a) {
    ((this.pathEl.textContent = s),
      (this.metaEl.textContent = ` · ${n}`),
      (this.el.style.display = "block"));
    const o = this.host.getBoundingClientRect(),
      d = r - o.left,
      c = a - o.top,
      u = Math.min(d + 14, Math.max(0, o.width - this.el.offsetWidth - 8)),
      h = Math.min(c + 16, Math.max(0, o.height - this.el.offsetHeight - 8));
    ((this.el.style.left = `${u}px`), (this.el.style.top = `${h}px`));
  }
  hide() {
    this.el.style.display = "none";
  }
  dispose() {
    this.el.remove();
  }
}
const Qs = () =>
  typeof window < "u" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function en(t) {
  t.traverse((s) => {
    if (s instanceof ot || s instanceof An || s instanceof bt) {
      s.geometry?.dispose();
      const n = s.material;
      Array.isArray(n) ? n.forEach(ss) : n && ss(n);
    }
  });
}
function ss(t) {
  const s = t.map;
  (s && !s.userData.shared && s.dispose(), t.dispose());
}
const nt = 14,
  ns = 11;
class tn {
  object;
  positions;
  colors;
  lift;
  arcPoints = Array.from({ length: nt + 1 }, () => new ce());
  mid = new ce();
  curve = new Ln();
  color = new ye();
  constructor(s) {
    this.lift = s;
    const n = ns * nt * 2,
      r = new js();
    ((this.positions = new xt(new Float32Array(n * 3), 3)),
      this.positions.setUsage(Vt),
      (this.colors = new xt(new Float32Array(n * 3), 3)),
      this.colors.setUsage(Vt),
      r.setAttribute("position", this.positions),
      r.setAttribute("color", this.colors),
      r.setDrawRange(0, 0));
    const a = new ks({ vertexColors: !0, transparent: !0, blending: vt, depthWrite: !1, fog: !1 });
    ((this.object = new Ns(r, a)), (this.object.frustumCulled = !1));
  }
  update(s) {
    const n = Math.min(Math.max(s.length - 1, 0), ns);
    if (n === 0) {
      this.object.geometry.setDrawRange(0, 0);
      return;
    }
    const r = s.length - 1 - n;
    let a = 0;
    for (let o = 1; o <= n; o++) {
      const d = s[r + o - 1],
        c = s[r + o];
      (this.mid.copy(d).lerp(c, 0.5),
        (this.mid.y = Math.max(d.y, c.y) + d.distanceTo(c) * 0.22 + this.lift),
        this.curve.v0.copy(d),
        this.curve.v1.copy(this.mid),
        this.curve.v2.copy(c));
      for (let h = 0; h <= nt; h++) this.curve.getPoint(h / nt, this.arcPoints[h]);
      const u = o / n;
      this.color.copy(Gs).multiplyScalar(0.05 + 0.95 * u * u);
      for (let h = 0; h < nt; h++) {
        const v = this.arcPoints[h],
          l = this.arcPoints[h + 1];
        (this.positions.setXYZ(a, v.x, v.y, v.z),
          this.colors.setXYZ(a, this.color.r, this.color.g, this.color.b),
          a++,
          this.positions.setXYZ(a, l.x, l.y, l.z),
          this.colors.setXYZ(a, this.color.r, this.color.g, this.color.b),
          a++);
      }
    }
    (this.object.geometry.setDrawRange(0, a),
      (this.positions.needsUpdate = !0),
      (this.colors.needsUpdate = !0));
  }
}
const $e = { unvisited: new ye("#5b6372"), ghost: new ye("#404551"), ...Xs },
  rt = 0.14,
  Za = 2.4,
  Ja = 348;
function rs(t, s) {
  return (t === "edit" ? 7.2 : t === "read" ? 4.2 : 1.6) * (1 + 0.35 * Math.log2(Math.max(s, 1)));
}
const as = 0.3,
  Qa = 16,
  ei = 2.2;
function ti(t, s) {
  return s <= 0 ? 0 : Math.min(1, Math.log2(Math.max(t, 1)) / s);
}
function si(t) {
  return as + Math.pow(t, ei) * (Qa - as);
}
const Ve = [
  { at: 0, color: new ye("#5b6372") },
  { at: 0.35, color: new ye("#e0894f") },
  { at: 0.7, color: new ye("#9a6bd8") },
  { at: 1, color: new ye("#e0524f") },
];
function ni(t) {
  for (let s = 1; s < Ve.length; s++)
    if (t <= Ve[s].at) {
      const n = Ve[s - 1],
        r = Ve[s],
        a = r.at - n.at,
        o = a > 0 ? (t - n.at) / a : 0;
      return n.color.clone().lerp(r.color, o);
    }
  return Ve[Ve.length - 1].color.clone();
}
function ri({
  city: t,
  playback: s,
  selectedPath: n,
  onSelect: r,
  onCanvasReady: a,
  locHeights: o,
}) {
  const d = i.useRef(null),
    c = i.useRef(null),
    u = i.useRef(null),
    h = i.useRef([]),
    v = i.useRef([]),
    l = i.useRef(new Map()),
    y = i.useRef(null),
    f = i.useRef(null),
    j = i.useRef(null),
    R = i.useRef(null),
    I = i.useRef(null),
    p = i.useRef(null),
    H = i.useRef(null),
    P = i.useRef(null),
    N = i.useRef(null),
    T = i.useRef(!1),
    L = i.useRef({ cx: 0, cz: 0, size: 120 }),
    $ = i.useRef(s);
  $.current = s;
  const W = i.useRef(null),
    ee = i.useRef(null);
  i.useEffect(() => {
    const C = () => ee.current?.();
    return (
      window.addEventListener("mindwalk:zoom-to-fit", C),
      () => window.removeEventListener("mindwalk:zoom-to-fit", C)
    );
  }, []);
  const K = i.useMemo(() => {
    if (!t || t.files.length === 0) return { cx: 0, cz: 0, size: 120, halfW: 60, halfD: 60 };
    let C = 1 / 0,
      F = -1 / 0,
      B = 1 / 0,
      k = -1 / 0;
    for (const w of t.files)
      ((C = Math.min(C, w.rect.x)),
        (F = Math.max(F, w.rect.x + w.rect.w)),
        (B = Math.min(B, w.rect.z)),
        (k = Math.max(k, w.rect.z + w.rect.d)));
    return {
      cx: (C + F) / 2,
      cz: (B + k) / 2,
      size: Math.max(F - C, k - B, 60),
      halfW: (F - C) / 2,
      halfD: (k - B) / 2,
    };
  }, [t]);
  return (
    i.useEffect(() => {
      const C = d.current;
      if (!C) return;
      const F = Qs();
      T.current = F;
      const B = new Ms();
      ((B.background = wt), (R.current = B));
      const k = new Es(38, C.clientWidth / C.clientHeight || 1, 0.1, 2400);
      (k.position.set(70, 130, 100), (f.current = k));
      const w = new Cs({ antialias: !0 });
      (w.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
        w.setSize(C.clientWidth, C.clientHeight),
        (y.current = w),
        C.appendChild(w.domElement),
        a?.(w.domElement));
      const E = new Ss(k, w.domElement);
      ((E.enableDamping = !F),
        (E.dampingFactor = 0.08),
        (E.maxPolarAngle = Math.PI * 0.44),
        (E.autoRotate = !F),
        (E.autoRotateSpeed = -0.5));
      const S = new Js(C);
      (E.addEventListener("start", () => {
        ((E.autoRotate = !1), S.hide());
      }),
        (j.current = E));
      const _ = new Rs("#66779b", "#161922", 1.7);
      B.add(_);
      const x = new $s("#b6c5de", 1.1);
      (x.position.set(-60, 120, -40), B.add(x));
      const D = new zn(),
        b = new Pn(),
        Z = (J) => {
          if (!f.current || !y.current) return;
          const te = y.current.domElement.getBoundingClientRect();
          ((b.x = ((J.clientX - te.left) / te.width) * 2 - 1),
            (b.y = -((J.clientY - te.top) / te.height) * 2 + 1),
            D.setFromCamera(b, f.current));
          const me = [u.current, c.current].filter(Boolean),
            ge = D.intersectObjects(me, !1)[0];
          if (!(!ge || ge.instanceId === void 0)) {
            if (ge.object === u.current) {
              const Q = v.current[ge.instanceId];
              return Q ? h.current[Q.fileId] : void 0;
            }
            return h.current[ge.instanceId];
          }
        };
      let ae = null;
      const le = (J) => {
          ae = { x: J.clientX, y: J.clientY };
        },
        V = (J) => {
          if (!ae) return;
          const te = Math.hypot(J.clientX - ae.x, J.clientY - ae.y);
          ((ae = null), !(te > 5) && r(Z(J)?.path));
        };
      let U = 0;
      const G = (J) => {
          if (ae) {
            S.hide();
            return;
          }
          U ||
            (U = requestAnimationFrame(() => {
              U = 0;
              const te = Z(J);
              if (((w.domElement.style.cursor = te ? "pointer" : ""), !te)) {
                S.hide();
                return;
              }
              const me = $.current,
                ge = me.touchByPath.get(te.path),
                Q = me.visitsByFile.get(te.id) ?? 0,
                z = ge ? `${Fe(ge)} · ${Q} visit${Q === 1 ? "" : "s"}` : Fe(void 0);
              S.show(te.path, te.ghost ? `${z} · ghost` : z, J.clientX, J.clientY);
            }));
        },
        oe = () => {
          (S.hide(), (w.domElement.style.cursor = ""));
        };
      (w.domElement.addEventListener("pointerdown", le),
        w.domElement.addEventListener("pointerup", V),
        w.domElement.addEventListener("pointermove", G),
        w.domElement.addEventListener("pointerleave", oe));
      const ue = () => {
          if (!d.current) return;
          const J = d.current.clientWidth,
            te = d.current.clientHeight;
          J === 0 ||
            te === 0 ||
            (w.setSize(J, te),
            (k.aspect = J / te),
            k.updateProjectionMatrix(),
            W.current?.() && (W.current = null));
        },
        m = new ResizeObserver(ue);
      m.observe(C);
      const A = new Ps(),
        O = new Xe(),
        Y = new De(),
        de = () => {
          (E.update(),
            P.current?.updateTargets(k, w.domElement.clientWidth, w.domElement.clientHeight),
            P.current?.ease(T.current));
          const J = u.current,
            te = v.current,
            me = l.current;
          if (J && te.length > 0) {
            let Q = !1;
            for (let z = 0; z < te.length; z++) {
              const X = te[z],
                se = h.current[X.fileId];
              if (!se) continue;
              let he = me.get(X.fileId) ?? 0;
              const fe = X.target - he;
              Math.abs(fe) > 0.015
                ? ((he = T.current ? X.target : he + fe * 0.13), me.set(X.fileId, he), (Q = !0))
                : he !== X.target && (me.set(X.fileId, X.target), (he = X.target), (Q = !0));
              const je = Math.max(se.rect.w, 0.45) + 0.04,
                pe = Math.max(se.rect.d, 0.45) + 0.04;
              (O.compose(
                new ce(
                  se.rect.x + se.rect.w / 2 - L.current.cx,
                  Math.max(he, 0.02) / 2 + rt,
                  se.rect.z + se.rect.d / 2 - L.current.cz,
                ),
                Y,
                new ce(je, Math.max(he, 0.02), pe),
              ),
                J.setMatrixAt(z, O));
            }
            Q && (J.instanceMatrix.needsUpdate = !0);
          }
          const ge = H.current;
          if (ge?.visible) {
            const Q = A.getElapsedTime(),
              z = ge.userData.baseScale,
              X = T.current ? 1 : 1 + 0.1 * Math.sin(Q * 2.4);
            ge.scale.setScalar(z * X);
          }
          (w.render(B, k),
            window.dispatchEvent(
              new CustomEvent("mindwalk:camera-state", {
                detail: { tx: E.target.x, tz: E.target.z, dist: k.position.distanceTo(E.target) },
              }),
            ),
            (N.current = requestAnimationFrame(de)));
        };
      return (
        de(),
        () => {
          (N.current && cancelAnimationFrame(N.current),
            U && cancelAnimationFrame(U),
            w.domElement.removeEventListener("pointerdown", le),
            w.domElement.removeEventListener("pointerup", V),
            w.domElement.removeEventListener("pointermove", G),
            w.domElement.removeEventListener("pointerleave", oe),
            S.dispose(),
            m.disconnect(),
            E.dispose(),
            w.dispose(),
            C.removeChild(w.domElement),
            B.clear(),
            a?.(null));
        }
      );
    }, [r, a]),
    i.useEffect(() => {
      const C = R.current;
      if (
        !C ||
        ((h.current = t?.files ?? []),
        (v.current = []),
        (l.current = new Map()),
        (L.current = K),
        !t || t.files.length === 0)
      )
        return;
      const F = new As(),
        B = K.size;
      C.fog = new Ls(wt, B * 2.1, B * 4.2);
      const k = new ot(new zt(B * 6, B * 6), new mt({ color: "#14171e", roughness: 1 }));
      ((k.rotation.x = -Math.PI / 2), (k.position.y = -0.32), F.add(k));
      const w = new zs(B * 2.8, 46, "#20242e", "#1a1e27");
      ((w.material.transparent = !0), (w.material.opacity = 0.5), (w.position.y = -0.3), F.add(w));
      const E = t.dirs.filter((V) => V.depth <= 3 && V.rect.w > 0 && V.rect.d > 0);
      if (E.length > 0) {
        const V = new Pt(1, 1, 1),
          U = new mt({ roughness: 0.95, metalness: 0 }),
          G = new Ye(V, U, E.length),
          oe = new Xe(),
          ue = new ye();
        (E.forEach((m, A) => {
          const O = -0.2 + Math.min(m.depth, 3) * 0.06,
            Y = O + 0.3;
          (oe.compose(
            new ce(m.rect.x + m.rect.w / 2 - K.cx, O - Y / 2, m.rect.z + m.rect.d / 2 - K.cz),
            new De(),
            new ce(m.rect.w, Y, m.rect.d),
          ),
            G.setMatrixAt(A, oe),
            ue.set("#1a1f29").lerp(new ye("#252b37"), Math.min(m.depth, 3) / 3),
            G.setColorAt(A, ue));
        }),
          (G.instanceMatrix.needsUpdate = !0),
          G.instanceColor && (G.instanceColor.needsUpdate = !0),
          F.add(G));
      }
      const S = new Pt(1, 1, 1),
        _ = new mt({ roughness: 0.85, metalness: 0 }),
        x = new Ye(S, _, t.files.length),
        D = new Xe();
      for (const V of t.files) {
        const U = Math.max(V.rect.w, 0.45),
          G = Math.max(V.rect.d, 0.45),
          oe = V.rect.x + V.rect.w / 2 - K.cx,
          ue = V.rect.z + V.rect.d / 2 - K.cz;
        (D.compose(new ce(oe, rt / 2, ue), new De(), new ce(U, rt, G)),
          x.setMatrixAt(V.id, D),
          x.setColorAt(V.id, is(V)));
      }
      ((x.instanceMatrix.needsUpdate = !0),
        x.instanceColor && (x.instanceColor.needsUpdate = !0),
        (c.current = x),
        F.add(x));
      const b = new Ye(ai(), new Ge({ toneMapped: !1, vertexColors: !0 }), t.files.length);
      ((b.instanceColor = new gt(new Float32Array(t.files.length * 3), 3)),
        (b.count = 0),
        (b.frustumCulled = !1),
        (u.current = b),
        F.add(b),
        (P.current = new Vs(
          t.dirs
            .filter((V) => V.depth >= 1 && V.fileCount > 0 && V.rect.w > 0 && V.rect.d > 0)
            .map((V) => ({
              name: ii(V.path),
              x: V.rect.x + V.rect.w / 2 - K.cx,
              z: V.rect.z + V.rect.d / 2 - K.cz,
              radius: Math.hypot(V.rect.w, V.rect.d) / 2,
              fileCount: V.fileCount,
              depth: V.depth,
            })),
          F,
          Za,
          !0,
        )));
      const Z = new bt(
        new It({ map: Ks(), color: Gs, blending: vt, depthWrite: !1, transparent: !0 }),
      );
      ((Z.userData.baseScale = Math.max(B * 0.028, 2.2)),
        (Z.visible = !1),
        (H.current = Z),
        F.add(Z));
      const ae = new tn(1.4);
      ((p.current = ae), F.add(ae.object), (I.current = F), C.add(F));
      const le = () => {
        const V = f.current,
          U = j.current;
        if (!V || !U) return !0;
        const G = new ce(0.46, 1.08, 0.72).normalize(),
          oe = [];
        for (const A of [-1, 1])
          for (const O of [-1, 1]) oe.push(new ce(A * K.halfW, 0, O * K.halfD));
        const ue = Ys(V, G, oe);
        if (ue === null) return !1;
        const m = Math.max(ue * 1.12, B * 0.6);
        return (
          V.position.copy(G).multiplyScalar(m),
          U.target.set(0, 0, 0),
          (U.minDistance = B * 0.18),
          (U.maxDistance = Math.max(B * 2.6, m * 1.2)),
          U.update(),
          !0
        );
      };
      return (
        (W.current = le() ? null : le),
        (ee.current = () => {
          le();
        }),
        () => {
          ((W.current = null),
            (ee.current = null),
            en(F),
            C.remove(F),
            (I.current = null),
            (c.current = null),
            (u.current = null),
            (p.current = null),
            (H.current = null),
            (P.current = null));
        }
      );
    }, [t, K]),
    i.useEffect(() => {
      const C = u.current,
        F = c.current;
      if (!C || !F || !t) return;
      const B = l.current,
        k = [],
        w = new Set(),
        E = o
          ? Math.log2(
              Math.max(
                1,
                t.files.reduce((S, _) => Math.max(S, _.lines), 1),
              ),
            )
          : 0;
      for (const S of t.files) {
        const _ = s.touchByFile.get(S.id),
          x = S.path === n;
        if ((F.setColorAt(S.id, x ? $e.selected : is(S)), _)) {
          const D = s.visitsByFile.get(S.id) ?? 1;
          let b = $e[_];
          (S.ghost && (b = b.clone().lerp($e.ghost, 0.45)),
            x && (b = $e.selected),
            k.push({ fileId: S.id, target: rs(_, D), color: b }),
            w.add(S.id));
        } else if (o) {
          const D = ti(S.lines, E);
          let b = ni(D);
          (S.ghost && (b = b.lerp($e.ghost, 0.45)),
            x && (b = $e.selected),
            k.push({ fileId: S.id, target: si(D), color: b }),
            w.add(S.id));
        }
      }
      for (const [S, _] of B)
        _ > 0.04 && !w.has(S)
          ? k.push({ fileId: S, target: 0, color: $e.unvisited })
          : _ <= 0.04 && !w.has(S) && B.delete(S);
      (k.forEach((S, _) => C.setColorAt(_, S.color)),
        (C.count = k.length),
        C.instanceColor && (C.instanceColor.needsUpdate = !0),
        F.instanceColor && (F.instanceColor.needsUpdate = !0),
        (v.current = k));
    }, [t, s, n, o]),
    i.useEffect(() => {
      if (!t || !n) return;
      const C = t.files.find((S) => S.path === n),
        F = f.current,
        B = j.current,
        k = y.current?.domElement;
      if (!C || !F || !B || !k) return;
      B.autoRotate = !1;
      const w = l.current.get(C.id) ?? rt,
        E = At(C, K);
      ((E.y = w), Zs(F, B, E, k.clientWidth, k.clientHeight, Ja));
    }, [t, K, n]),
    i.useEffect(() => {
      const C = p.current;
      if (!C || !t) return;
      const F = s.recentTargets
          .map((w) => (w.fileId !== void 0 ? t.files[w.fileId] : void 0))
          .filter((w) => !!w),
        B = (w) => {
          const E = s.touchByFile.get(w.id),
            S = s.visitsByFile.get(w.id) ?? 1;
          return E ? rs(E, S) : rt;
        },
        k = H.current;
      if (k) {
        const w = F[F.length - 1];
        if (w) {
          const E = At(w, K);
          (k.position.set(E.x, B(w) + 1.6, E.z), (k.visible = !0));
        } else k.visible = !1;
      }
      C.update(
        F.map((w) => {
          const E = At(w, K);
          return ((E.y = B(w) + 0.4), E);
        }),
      );
    }, [t, s, K]),
    e.jsx("div", { className: "city-scene", ref: d, "aria-label": "Attention terrain" })
  );
}
function ai() {
  const t = new Pt(1, 1, 1),
    s = t.getAttribute("position"),
    n = t.getAttribute("normal"),
    r = new Float32Array(s.count * 3);
  for (let a = 0; a < s.count; a++) {
    const o = s.getY(a) + 0.5,
      d = n.getY(a) === 1 ? 0.82 : 0.34 + 0.66 * o * o;
    r.fill(d, a * 3, a * 3 + 3);
  }
  return (t.setAttribute("color", new xt(r, 3)), t);
}
function is(t) {
  if (t.ghost) return $e.ghost;
  let s = 2166136261;
  for (let r = 0; r < t.path.length; r++) s = Math.imul(s ^ t.path.charCodeAt(r), 16777619);
  const n = ((s >>> 0) % 1e3) / 1e3 - 0.5;
  return $e.unvisited.clone().offsetHSL(0, 0, n * 0.05);
}
function At(t, s) {
  return new ce(t.rect.x + t.rect.w / 2 - s.cx, 0, t.rect.z + t.rect.d / 2 - s.cz);
}
function ii(t) {
  return t.slice(t.lastIndexOf("/") + 1) || t;
}
function oi(t) {
  const s = {
      name: "",
      path: "",
      depth: 0,
      children: new Map(),
      files: [],
      leafCount: 0,
      angle: 0,
    },
    n = [...t].sort((p, H) => (p.path < H.path ? -1 : 1));
  for (const p of n) {
    const H = p.path.split("/").filter(Boolean);
    let P = s;
    for (const N of H.slice(0, -1)) {
      let T = P.children.get(N);
      (T ||
        ((T = {
          name: N,
          path: P.path ? `${P.path}/${N}` : N,
          depth: P.depth + 1,
          children: new Map(),
          files: [],
          leafCount: 0,
          angle: 0,
        }),
        P.children.set(N, T)),
        (P = T));
    }
    P.files.push(p);
  }
  let r = 1;
  const a = (p) => {
    ((p.leafCount = p.files.length), p.files.length > 0 && (r = Math.max(r, p.depth + 1)));
    for (const H of p.children.values()) p.leafCount += a(H);
    return p.leafCount;
  };
  a(s);
  const o = Math.max(s.leafCount, 1),
    d = Math.max(55, Math.sqrt(o) * 4),
    c = d / Math.max(r, 1),
    u = (Math.PI * 2) / o,
    h = { radius: d, leaf: new Map(), dirs: [], edges: [] },
    v = (p, H) => ({ x: p * Math.cos(H), z: p * Math.sin(H) }),
    l = (p, H, P, N) => {
      const T = p < 1e-6 ? N : H;
      let L = N - T;
      for (; L > Math.PI;) L -= Math.PI * 2;
      for (; L < -Math.PI;) L += Math.PI * 2;
      const $ = [],
        W = 8;
      for (let ee = 0; ee <= W; ee++) {
        const K = ee / W,
          C = K * K * (3 - 2 * K);
        $.push(v(p + (P - p) * K, T + L * C));
      }
      return $;
    };
  let y = 0;
  const f = (p) => {
    p.angle = (y + p.leafCount / 2) * u;
    const H = [...p.children.values()].sort((N, T) => (N.name < T.name ? -1 : 1)),
      P = [...p.files].sort((N, T) => (N.path < T.path ? -1 : 1));
    for (const N of H) f(N);
    for (const N of P) {
      const T = (y + 0.5) * u;
      y += 1;
      const L = v((p.depth + 1) * c, T);
      (h.leaf.set(N.id, L),
        h.edges.push({ childFileId: N.id, points: l(p.depth * c, p.angle, (p.depth + 1) * c, T) }));
    }
    if (p.path !== "") {
      const N = v(p.depth * c, p.angle);
      h.dirs.push({
        path: p.path,
        name: p.name,
        x: N.x,
        z: N.z,
        depth: p.depth,
        fileCount: p.leafCount,
        radius: 0,
      });
    }
  };
  f(s);
  const j = new Map(),
    R = (p) => {
      j.set(p.path, p);
      for (const H of p.children.values()) R(H);
    };
  R(s);
  for (const p of h.dirs) {
    const H = j.get(p.path),
      P = p.path.includes("/") ? p.path.slice(0, p.path.lastIndexOf("/")) : "",
      N = j.get(P);
    h.edges.push({ childPath: p.path, points: l(N.depth * c, N.angle, H.depth * c, H.angle) });
  }
  const I = new Map(h.dirs.map((p) => [p.path, p]));
  for (const p of t) {
    const H = h.leaf.get(p.id);
    if (!H) continue;
    const P = p.path.split("/").filter(Boolean);
    let N = "";
    for (let T = 0; T < P.length - 1; T++) {
      N = N ? `${N}/${P[T]}` : P[T];
      const L = I.get(N);
      L && (L.radius = Math.max(L.radius, Math.hypot(H.x - L.x, H.z - L.z)));
    }
  }
  return h;
}
const Re = { unvisited: new ye("#5a6375"), ghost: new ye("#4d5464"), ...Xs },
  ci = new ye("#3c424f"),
  li = new ye("#7d8496"),
  di = new ye("#ffeeda"),
  Be = 0.7;
function ui(t) {
  return Math.min(1.8 * (1 + 0.45 * Math.log2(Math.max(t, 1))), 4.8);
}
const hi = 1.8,
  pi = 348;
function fi({ city: t, playback: s, selectedPath: n, onSelect: r, onCanvasReady: a }) {
  const o = i.useRef(null),
    d = i.useRef(null),
    c = i.useRef(null),
    u = i.useRef(new Map()),
    h = i.useRef(null),
    v = i.useRef(null),
    l = i.useRef(null),
    y = i.useRef([]),
    f = i.useRef([]),
    j = i.useRef(null),
    R = i.useRef([]),
    I = i.useRef(new Map()),
    p = i.useRef(null),
    H = i.useRef(null),
    P = i.useRef(null),
    N = i.useRef(null),
    T = i.useRef(null),
    L = i.useRef(null),
    $ = i.useRef(null),
    W = i.useRef(null),
    ee = i.useRef(null),
    K = i.useRef(!1),
    C = i.useRef(s);
  C.current = s;
  const F = i.useRef(null),
    B = i.useRef(null);
  i.useEffect(() => {
    const w = () => B.current?.();
    return (
      window.addEventListener("mindwalk:zoom-to-fit", w),
      () => window.removeEventListener("mindwalk:zoom-to-fit", w)
    );
  }, []);
  const k = i.useMemo(() => (t && t.files.length > 0 ? oi(t.files) : null), [t]);
  return (
    i.useEffect(() => {
      const w = o.current;
      if (!w) return;
      const E = Qs();
      K.current = E;
      const S = new Ms();
      ((S.background = wt), (N.current = S));
      const _ = new Es(38, w.clientWidth / w.clientHeight || 1, 0.1, 2400);
      (_.position.set(60, 110, 90), (H.current = _));
      const x = new Cs({ antialias: !0 });
      (x.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
        x.setSize(w.clientWidth, w.clientHeight),
        (p.current = x),
        w.appendChild(x.domElement),
        a?.(x.domElement));
      const D = new Ss(_, x.domElement);
      ((D.enableDamping = !E),
        (D.dampingFactor = 0.08),
        (D.maxPolarAngle = Math.PI * 0.44),
        (D.autoRotate = !E),
        (D.autoRotateSpeed = -0.5));
      const b = new Js(w);
      (D.addEventListener("start", () => {
        ((D.autoRotate = !1), b.hide());
      }),
        (P.current = D));
      const Z = new Rs("#66779b", "#161922", 1.7);
      S.add(Z);
      const ae = new $s("#b6c5de", 1.1);
      (ae.position.set(-60, 120, -40), S.add(ae));
      const le = 18,
        V = new ce(),
        U = (Q) => {
          const z = j.current;
          if (!z || !H.current || !p.current) return;
          const X = p.current.domElement.getBoundingClientRect(),
            se = Q.clientX - X.left,
            he = Q.clientY - X.top;
          let fe,
            je = le * le;
          for (const pe of f.current) {
            const Ne = z.leaf.get(pe.id);
            if (!Ne || (V.set(Ne.x, Be, Ne.z).project(H.current), V.z > 1)) continue;
            const we = ((V.x + 1) / 2) * X.width,
              be = ((1 - V.y) / 2) * X.height,
              Me = (we - se) * (we - se) + (be - he) * (be - he);
            Me < je && ((je = Me), (fe = pe));
          }
          return fe;
        };
      let G = null;
      const oe = (Q) => {
          G = { x: Q.clientX, y: Q.clientY };
        },
        ue = (Q) => {
          if (!G) return;
          const z = Math.hypot(Q.clientX - G.x, Q.clientY - G.y);
          ((G = null), !(z > 5) && r(U(Q)?.path));
        };
      let m = 0;
      const A = (Q) => {
          if (G) {
            b.hide();
            return;
          }
          m ||
            (m = requestAnimationFrame(() => {
              m = 0;
              const z = U(Q);
              if (((x.domElement.style.cursor = z ? "pointer" : ""), !z)) {
                b.hide();
                return;
              }
              const X = C.current,
                se = X.touchByPath.get(z.path),
                he = X.visitsByFile.get(z.id) ?? 0,
                fe = se ? `${Fe(se)} · ${he} visit${he === 1 ? "" : "s"}` : Fe(void 0);
              b.show(z.path, z.ghost ? `${fe} · ghost` : fe, Q.clientX, Q.clientY);
            }));
        },
        O = () => {
          (b.hide(), (x.domElement.style.cursor = ""));
        };
      (x.domElement.addEventListener("pointerdown", oe),
        x.domElement.addEventListener("pointerup", ue),
        x.domElement.addEventListener("pointermove", A),
        x.domElement.addEventListener("pointerleave", O));
      const Y = () => {
          if (!o.current) return;
          const Q = o.current.clientWidth,
            z = o.current.clientHeight;
          Q === 0 ||
            z === 0 ||
            (x.setSize(Q, z),
            (_.aspect = Q / z),
            _.updateProjectionMatrix(),
            F.current?.() && (F.current = null));
        },
        de = new ResizeObserver(Y);
      de.observe(w);
      const J = new Ps(),
        te = new Xe(),
        me = new De().setFromEuler(new Tn(-Math.PI / 2, 0, 0)),
        ge = () => {
          (D.update(),
            W.current?.updateTargets(_, x.domElement.clientWidth, x.domElement.clientHeight),
            W.current?.ease(K.current));
          const Q = v.current,
            z = R.current,
            X = I.current,
            se = j.current;
          if (Q && se && z.length > 0) {
            let fe = !1;
            for (let je = 0; je < z.length; je++) {
              const pe = z[je],
                Ne = se.leaf.get(pe.fileId);
              if (!Ne) continue;
              let we = X.get(pe.fileId) ?? 0;
              const be = pe.target - we;
              (Math.abs(be) > 0.015
                ? ((we = K.current ? pe.target : we + be * 0.12), X.set(pe.fileId, we), (fe = !0))
                : we !== pe.target && (X.set(pe.fileId, pe.target), (we = pe.target), (fe = !0)),
                te.compose(
                  new ce(Ne.x, 0.06, Ne.z),
                  me,
                  new ce(Math.max(we, 0.01) * 2, Math.max(we, 0.01) * 2, 1),
                ),
                Q.setMatrixAt(je, te));
            }
            fe && (Q.instanceMatrix.needsUpdate = !0);
          }
          const he = $.current;
          if (he?.visible) {
            const fe = J.getElapsedTime(),
              je = he.userData.baseScale,
              pe = K.current ? 1 : 1 + 0.1 * Math.sin(fe * 2.4);
            he.scale.setScalar(je * pe);
          }
          (x.render(S, _),
            window.dispatchEvent(
              new CustomEvent("mindwalk:camera-state", {
                detail: { tx: D.target.x, tz: D.target.z, dist: _.position.distanceTo(D.target) },
              }),
            ),
            (ee.current = requestAnimationFrame(ge)));
        };
      return (
        ge(),
        () => {
          (ee.current && cancelAnimationFrame(ee.current),
            m && cancelAnimationFrame(m),
            x.domElement.removeEventListener("pointerdown", oe),
            x.domElement.removeEventListener("pointerup", ue),
            x.domElement.removeEventListener("pointermove", A),
            x.domElement.removeEventListener("pointerleave", O),
            b.dispose(),
            de.disconnect(),
            D.dispose(),
            x.dispose(),
            w.removeChild(x.domElement),
            S.clear(),
            a?.(null));
        }
      );
    }, [r, a]),
    i.useEffect(() => {
      const w = N.current;
      if (
        !w ||
        ((f.current = t?.files ?? []),
        (j.current = k),
        (R.current = []),
        (I.current = new Map()),
        !t || !k)
      )
        return;
      const E = new As(),
        S = k.radius * 2.3;
      w.fog = new Ls(wt, S * 2.1, S * 4.2);
      const _ = new ot(new zt(S * 6, S * 6), new mt({ color: "#14171e", roughness: 1 }));
      ((_.rotation.x = -Math.PI / 2), (_.position.y = -0.25), E.add(_));
      const x = new zs(S * 2.4, 40, "#1d222c", "#181c25");
      ((x.material.transparent = !0), (x.material.opacity = 0.4), (x.position.y = -0.24), E.add(x));
      const D = [],
        b = [];
      for (const z of k.edges) {
        let X = 0;
        for (let se = 0; se < z.points.length - 1; se++)
          (D.push(z.points[se].x, 0.12, z.points[se].z),
            D.push(z.points[se + 1].x, 0.12, z.points[se + 1].z),
            (X += 2));
        b.push({ childPath: z.childPath, childFileId: z.childFileId, vertexCount: X });
      }
      const Z = new js();
      Z.setAttribute("position", new In(D, 3));
      const ae = new Float32Array(D.length);
      Z.setAttribute("color", new xt(ae, 3));
      const le = new Ns(Z, new ks({ vertexColors: !0, transparent: !0, opacity: 0.9 }));
      ((l.current = le), (y.current = b), E.add(le));
      const V = new Gt(0.5, 10, 8),
        U = new Ge({ toneMapped: !1, fog: !1 }),
        G = new Ye(V, U, t.files.length);
      G.instanceColor = new gt(new Float32Array(t.files.length * 3), 3);
      const oe = t.files.filter((z) => z.ghost),
        ue = new Map();
      (oe.forEach((z, X) => ue.set(z.id, X)), (u.current = ue));
      const m = new Xe(),
        A = new Xe().makeScale(0, 0, 0);
      for (const z of t.files) {
        const X = k.leaf.get(z.id);
        if (!X) continue;
        if (z.ghost) {
          G.setMatrixAt(z.id, A);
          continue;
        }
        const se = Math.min(0.24 + Math.sqrt(Math.max(z.lines, 1)) * 0.045, 1.05);
        (m.compose(new ce(X.x, Be, X.z), new De(), new ce(se, se, se)),
          G.setMatrixAt(z.id, m),
          G.setColorAt(z.id, Re.unvisited));
      }
      ((G.instanceMatrix.needsUpdate = !0),
        G.instanceColor && (G.instanceColor.needsUpdate = !0),
        (d.current = G),
        E.add(G));
      let O = null;
      if (oe.length > 0) {
        ((O = new Ye(
          new Gt(0.55, 8, 5),
          new Ge({ wireframe: !0, transparent: !0, opacity: 0.85, toneMapped: !1, fog: !1 }),
          oe.length,
        )),
          (O.instanceColor = new gt(new Float32Array(oe.length * 3), 3)));
        for (const z of oe) {
          const X = k.leaf.get(z.id),
            se = ue.get(z.id);
          if (!X) {
            O.setMatrixAt(se, A);
            continue;
          }
          const he = Math.min(0.24 + Math.sqrt(Math.max(z.lines, 1)) * 0.045, 1.05) * 0.8;
          (m.compose(new ce(X.x, Be, X.z), new De(), new ce(he, he, he)),
            O.setMatrixAt(se, m),
            O.setColorAt(se, Re.ghost));
        }
        ((O.instanceMatrix.needsUpdate = !0),
          O.instanceColor && (O.instanceColor.needsUpdate = !0),
          (O.raycast = () => {}),
          E.add(O));
      }
      c.current = O;
      const Y = new Ye(
        new zt(1, 1),
        new Ge({
          map: Va(),
          transparent: !0,
          opacity: 0.55,
          depthWrite: !1,
          toneMapped: !1,
          fog: !1,
        }),
        t.files.length,
      );
      ((Y.instanceColor = new gt(new Float32Array(t.files.length * 3), 3)),
        (Y.count = 0),
        (Y.frustumCulled = !1),
        (Y.raycast = () => {}),
        (v.current = Y),
        E.add(Y),
        (W.current = new Vs(k.dirs, E, hi)));
      const de = new bt(
        new It({ map: Ks(), color: di, blending: vt, depthWrite: !1, transparent: !0, fog: !1 }),
      );
      ((de.userData.baseScale = Math.max(S * 0.026, 2.2)),
        (de.visible = !1),
        ($.current = de),
        E.add(de));
      const J = new Ge({
          color: Re.selected,
          transparent: !0,
          opacity: 0.9,
          side: Bn,
          depthWrite: !1,
          toneMapped: !1,
          fog: !1,
        }),
        te = new ot(new qn(1.2, 1.5, 48), J);
      ((te.rotation.x = -Math.PI / 2), (te.visible = !1), (te.raycast = () => {}), E.add(te));
      const me = new ot(
        new Dn(0.05, 0.05, 6, 6, 1, !0),
        new Ge({
          color: Re.selected,
          transparent: !0,
          opacity: 0.32,
          blending: vt,
          depthWrite: !1,
          toneMapped: !1,
          fog: !1,
        }),
      );
      ((me.visible = !1), (me.raycast = () => {}), E.add(me), (h.current = { ring: te, beam: me }));
      const ge = new tn(1.6);
      ((L.current = ge), E.add(ge.object), (T.current = E), w.add(E));
      const Q = () => {
        const z = H.current,
          X = P.current;
        if (!z || !X) return !0;
        const se = new ce(0.3, 0.66, 0.47).normalize(),
          he = [...k.leaf.values()].map((pe) => new ce(pe.x, Be, pe.z)),
          fe = Ys(z, se, he);
        if (fe === null) return !1;
        const je = fe * 1.12;
        return (
          z.position.copy(se).multiplyScalar(je),
          X.target.set(0, 0, 0),
          (X.minDistance = S * 0.15),
          (X.maxDistance = Math.max(S * 2.4, je * 1.2)),
          X.update(),
          !0
        );
      };
      return (
        (F.current = Q() ? null : Q),
        (B.current = () => {
          Q();
        }),
        () => {
          ((F.current = null),
            (B.current = null),
            en(E),
            w.remove(E),
            (T.current = null),
            (d.current = null),
            (c.current = null),
            (u.current = new Map()),
            (h.current = null),
            (v.current = null),
            (l.current = null),
            (L.current = null),
            ($.current = null),
            (W.current = null));
        }
      );
    }, [t, k]),
    i.useEffect(() => {
      const w = d.current,
        E = c.current,
        S = u.current,
        _ = v.current,
        x = l.current;
      if (!w || !_ || !x || !t || !k) return;
      const D = I.current,
        b = [],
        Z = new Set(),
        ae = new Set();
      for (const U of t.files) {
        const G = s.touchByFile.get(U.id);
        let oe = U.ghost ? Re.ghost : Re.unvisited;
        if (G) {
          oe = Re[G];
          const ue = s.visitsByFile.get(U.id) ?? 1;
          (b.push({ fileId: U.id, target: ui(ue), color: Re[G] }), Z.add(U.id));
          const m = U.path.split("/");
          let A = "";
          for (let O = 0; O < m.length - 1; O++) ((A = A ? `${A}/${m[O]}` : m[O]), ae.add(A));
        }
        if (U.ghost) {
          const ue = S.get(U.id);
          E && ue !== void 0 && E.setColorAt(ue, oe);
        } else w.setColorAt(U.id, oe);
      }
      for (const [U, G] of D)
        G > 0.04 && !Z.has(U)
          ? b.push({ fileId: U, target: 0, color: Re.unvisited })
          : G <= 0.04 && !Z.has(U) && D.delete(U);
      (b.forEach((U, G) => _.setColorAt(G, U.color)),
        (_.count = b.length),
        _.instanceColor && (_.instanceColor.needsUpdate = !0),
        w.instanceColor && (w.instanceColor.needsUpdate = !0),
        E?.instanceColor && (E.instanceColor.needsUpdate = !0),
        (R.current = b));
      const le = x.geometry.getAttribute("color");
      let V = 0;
      for (const U of y.current) {
        let G = !1;
        U.childFileId !== void 0
          ? (G = s.touchByFile.has(U.childFileId))
          : U.childPath && (G = ae.has(U.childPath));
        const oe = G ? li : ci;
        for (let ue = 0; ue < U.vertexCount; ue++) le.setXYZ(V++, oe.r, oe.g, oe.b);
      }
      le.needsUpdate = !0;
    }, [t, k, s]),
    i.useEffect(() => {
      const w = h.current;
      if (!w || !t || !k) return;
      const E = n ? t.files.find((_) => _.path === n) : void 0,
        S = E ? k.leaf.get(E.id) : void 0;
      if (S) {
        (w.ring.position.set(S.x, 0.1, S.z),
          w.beam.position.set(S.x, 3, S.z),
          (w.ring.visible = !0),
          (w.beam.visible = !0));
        const _ = H.current,
          x = P.current,
          D = p.current?.domElement;
        _ &&
          x &&
          D &&
          ((x.autoRotate = !1), Zs(_, x, new ce(S.x, Be, S.z), D.clientWidth, D.clientHeight, pi));
      } else ((w.ring.visible = !1), (w.beam.visible = !1));
    }, [t, k, n]),
    i.useEffect(() => {
      const w = L.current;
      if (!w || !t || !k) return;
      const E = s.recentTargets
          .map((_) => (_.fileId !== void 0 ? t.files[_.fileId] : void 0))
          .filter((_) => !!(_ && k.leaf.get(_.id))),
        S = $.current;
      if (S) {
        const _ = E[E.length - 1];
        if (_) {
          const x = k.leaf.get(_.id);
          (S.position.set(x.x, Be + 1.7, x.z), (S.visible = !0));
        } else S.visible = !1;
      }
      w.update(
        E.map((_) => {
          const x = k.leaf.get(_.id);
          return new ce(x.x, Be + 0.3, x.z);
        }),
      );
    }, [t, k, s]),
    e.jsx("div", { className: "city-scene", ref: o, "aria-label": "Firefly tree" })
  );
}
function os() {
  try {
    const t = document.createElement("canvas");
    return !!t.getContext("webgl") || !!t.getContext("experimental-webgl");
  } catch {
    return !1;
  }
}
const mi = {
  edit: "var(--act-edit)",
  read: "var(--act-read)",
  hit: "var(--act-search)",
  unvisited: "var(--hairline)",
  selected: "var(--ember)",
};
function gi({ city: t, playback: s, selectedPath: n, onSelect: r }) {
  const a = i.useRef(null),
    o = i.useMemo(() => {
      if (!t || t.files.length === 0) return null;
      let f = 1 / 0,
        j = -1 / 0,
        R = 1 / 0,
        I = -1 / 0;
      for (const p of t.files)
        ((f = Math.min(f, p.rect.x)),
          (j = Math.max(j, p.rect.x + p.rect.w)),
          (R = Math.min(R, p.rect.z)),
          (I = Math.max(I, p.rect.z + p.rect.d)));
      return { minX: f, maxX: j, minZ: R, maxZ: I, w: j - f, d: I - R };
    }, [t]);
  if (!t || !o)
    return e.jsx("div", {
      className: "treemap2d-empty",
      children: e.jsx("p", { children: "No map data. Load a session to see the codebase." }),
    });
  const d = 8,
    c = 1e3,
    u = (o.d / o.w) * c || 600,
    h = (f) => d + ((f - o.minX) / o.w) * (c - 2 * d),
    v = (f) => d + ((f - o.minZ) / o.d) * (u - 2 * d),
    l = (f) => (f / o.w) * (c - 2 * d),
    y = (f) => (f / o.d) * (u - 2 * d);
  return e.jsxs("div", {
    className: "treemap2d-container",
    children: [
      e.jsxs("svg", {
        ref: a,
        viewBox: `0 0 ${c} ${u}`,
        preserveAspectRatio: "xMidYMid meet",
        className: "treemap2d-svg",
        role: "img",
        "aria-label": "Repository map (2D fallback)",
        children: [
          t.dirs.map((f) =>
            e.jsx(
              "rect",
              {
                x: h(f.rect.x),
                y: v(f.rect.z),
                width: l(f.rect.w),
                height: y(f.rect.d),
                fill: "none",
                stroke: "var(--hairline)",
                strokeWidth: 0.5,
                rx: 2,
              },
              f.path,
            ),
          ),
          t.files.map((f) => {
            const j = s.touchByPath.get(f.path),
              R = f.path === n,
              I = R ? "selected" : (j ?? "unvisited");
            return e.jsx(
              "rect",
              {
                x: h(f.rect.x),
                y: v(f.rect.z),
                width: l(f.rect.w),
                height: y(f.rect.d),
                fill: mi[I],
                fillOpacity: j || R ? 0.75 : 0.25,
                stroke: R ? "var(--ember)" : "var(--hairline)",
                strokeWidth: R ? 1.5 : 0.3,
                rx: 1,
                className: "treemap2d-file",
                onClick: () => r(R ? void 0 : f.path),
                children: e.jsxs("title", {
                  children: [f.path, " — ", Fe(j), ", ", f.lines, " lines"],
                }),
              },
              f.id,
            );
          }),
        ],
      }),
      e.jsx("div", { className: "treemap2d-notice", children: "2D mode — WebGL unavailable" }),
    ],
  });
}
const sn = "mindwalk.sessionFilters";
function nn(t, s, n) {
  return !(
    (s.harness && t.harness !== s.harness) ||
    (s.hideEmpty && t.eventCount === 0 && t.key !== n)
  );
}
function xi() {
  try {
    const t = localStorage.getItem(sn);
    if (t) {
      const s = JSON.parse(t);
      return {
        hideEmpty: s.hideEmpty !== !1,
        harness: typeof s.harness == "string" ? s.harness : void 0,
      };
    }
  } catch {}
  return { hideEmpty: !0 };
}
function cs(t) {
  try {
    localStorage.setItem(sn, JSON.stringify(t));
  } catch {}
}
const ls = (t) => {
    let s;
    const n = new Set(),
      r = (h, v) => {
        const l = typeof h == "function" ? h(s) : h;
        if (!Object.is(l, s)) {
          const y = s;
          ((s = (v ?? (typeof l != "object" || l === null)) ? l : Object.assign({}, s, l)),
            n.forEach((f) => f(s, y)));
        }
      },
      a = () => s,
      c = {
        setState: r,
        getState: a,
        getInitialState: () => u,
        subscribe: (h) => (n.add(h), () => n.delete(h)),
      },
      u = (s = t(r, a, c));
    return c;
  },
  vi = (t) => (t ? ls(t) : ls),
  yi = (t) => t;
function wi(t, s = yi) {
  const n = ut.useSyncExternalStore(
    t.subscribe,
    ut.useCallback(() => s(t.getState()), [t, s]),
    ut.useCallback(() => s(t.getInitialState()), [t, s]),
  );
  return (ut.useDebugValue(n), n);
}
const ds = (t) => {
    const s = vi(t),
      n = (r) => wi(s, r);
    return (Object.assign(n, s), n);
  },
  bi = (t) => (t ? ds(t) : ds),
  us = xi(),
  rn = "mindwalk.railCollapsed",
  an = "mindwalk.hudHidden";
function ji() {
  try {
    return localStorage.getItem(rn) === "1";
  } catch {
    return !1;
  }
}
function ki() {
  try {
    return localStorage.getItem(an) === "1";
  } catch {
    return !1;
  }
}
const Ae = bi((t, s) => ({
    sessions: [],
    currentSeq: 0,
    view: "tree",
    loading: !1,
    hideEmpty: us.hideEmpty,
    harnessFilter: us.harness,
    railCollapsed: ji(),
    mapOnly: !1,
    hudHidden: ki(),
    setView: (n) => t({ view: n }),
    setSessions: (n) => t({ sessions: n }),
    setActiveSession: (n) =>
      t({ activeSessionKey: n, trace: void 0, city: void 0, currentSeq: 0, selectedPath: void 0 }),
    setData: (n, r) => t({ trace: n, city: r, currentSeq: Math.max(0, n.events.length - 1) }),
    setCityOnly: (n) =>
      t({ city: n, trace: void 0, currentSeq: 0, selectedPath: void 0, mapOnly: !0 }),
    setCurrentSeq: (n) => t({ currentSeq: n }),
    setSelectedPath: (n) => t({ selectedPath: n }),
    setLoading: (n) => t({ loading: n }),
    setError: (n) => t({ error: n }),
    setHideEmpty: (n) => {
      (t({ hideEmpty: n }), cs({ hideEmpty: n, harness: s().harnessFilter }));
    },
    setHarnessFilter: (n) => {
      (t({ harnessFilter: n }), cs({ hideEmpty: s().hideEmpty, harness: n }));
    },
    setRailCollapsed: (n) => {
      t({ railCollapsed: n });
      try {
        localStorage.setItem(rn, n ? "1" : "0");
      } catch {}
    },
    setHudHidden: (n) => {
      t({ hudHidden: n });
      try {
        localStorage.setItem(an, n ? "1" : "0");
      } catch {}
    },
  })),
  Lt = 8;
function Ni(t, s = 40) {
  if (t.length <= s) return t;
  const n = Math.min(28, s - 3);
  return t.slice(0, s - n - 1) + "…" + t.slice(-n);
}
const Mi = i.memo(function ({
  trace: s,
  city: n,
  agentLabel: r,
  editedNow: a,
  readNow: o,
  seenNow: d,
  churn: c,
  onSelectFile: u,
  onOpenAgents: h,
  locked: v = !1,
}) {
  const l = s?.stats,
    y = l ? l.fovea - l.edited : 0,
    f = l ? Math.max(0, l.filesInRepo - a - o - d) : 0,
    j = l ? Math.max(0, l.filesInRepo - l.fovea - l.parafovea) : 0,
    R = n ? n.files.reduce((C, F) => C + (F.ghost ? 1 : 0), 0) : 0,
    I = l ? fs(l.errors) : 0,
    p = l ? I > 0 || l.churnFiles > 0 || l.actions.edit > 0 : !1,
    H = !!s && s.events.length > 0,
    P = !!s && s.events.some((C) => C.targets.length > 0),
    N =
      !!s &&
      s.events.some((C) => (C.action === "read" || C.action === "edit") && !C.providerExecuted),
    T = H && !P,
    L = T && N,
    [$, W] = i.useState(!1),
    ee = i.useRef(null),
    K = i.useRef(null);
  return (
    i.useEffect(() => W(!1), [s]),
    i.useEffect(() => {
      if (!$) return;
      const C = (B) => {
          const k = B.target;
          ee.current?.contains(k) || K.current?.contains(k) || W(!1);
        },
        F = (B) => {
          B.key === "Escape" && W(!1);
        };
      return (
        document.addEventListener("pointerdown", C),
        document.addEventListener("keydown", F),
        () => {
          (document.removeEventListener("pointerdown", C),
            document.removeEventListener("keydown", F));
        }
      );
    }, [$]),
    e.jsx("div", {
      className: "hud",
      "aria-hidden": !n,
      children: e.jsxs("div", {
        className: "hud-left",
        children: [
          e.jsxs("div", {
            className: "hud-title-line",
            children: [
              e.jsx("div", { className: "hud-repo", children: n ? Ai(n.repo.root) : "" }),
              s && r
                ? e.jsxs("button", {
                    className: "hud-lens",
                    onClick: h,
                    disabled: !h || v,
                    "aria-label": `Open Agent lenses, current ${r}`,
                    children: [e.jsx("span", { children: "Lens" }), r],
                  })
                : null,
            ],
          }),
          n
            ? e.jsxs("div", {
                className: "hud-commit",
                children: [
                  e.jsx("span", { children: n.repo.commit || "worktree" }),
                  n.repo.dirty ? e.jsx("span", { className: "dirty", children: "● dirty" }) : null,
                  s?.session.model
                    ? e.jsxs("span", {
                        children: [
                          s.session.model,
                          s.session.provider ? ` (${s.session.provider})` : "",
                        ],
                      })
                    : null,
                  s?.session.cwd
                    ? e.jsx("span", {
                        "data-hint": "Working directory the adapter resolved for this session",
                        children: Ni(s.session.cwd),
                      })
                    : null,
                  l
                    ? e.jsxs("span", {
                        "data-hint":
                          "Files in the repository map — the denominator of the coverage spectrum below",
                        children: [l.filesInRepo, " files"],
                      })
                    : null,
                  n.repo.truncated
                    ? e.jsx("span", {
                        "data-hint":
                          "The tree holds more files than the map shows — scanning stopped at the budget",
                        children: "partial map",
                      })
                    : null,
                ],
              })
            : null,
          T
            ? e.jsx("div", {
                className: "hud-warning",
                "data-hint": L
                  ? "The adapter found file read/edit calls but could not map any to repository files — check that the session's working directory matches the loaded repository"
                  : "This session had no file read/edit operations — only commands or reasoning steps",
                children: L
                  ? "no file targets resolved — cwd may not match repository"
                  : "no file operations in this session",
              })
            : null,
          l
            ? e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("div", {
                    className: "spectrum",
                    "data-hint":
                      "Coverage spectrum: each color is a touch state. Counts update live at the playhead. Hover any entry for details.",
                    children: [
                      e.jsx(at, {
                        kind: "edit",
                        label: "edited",
                        now: a,
                        final: l.edited,
                        hint: "Files the agent changed",
                      }),
                      e.jsx(at, {
                        kind: "read",
                        label: "read",
                        now: o,
                        final: y,
                        hint: "Files the agent opened and read, but never changed",
                      }),
                      e.jsx(at, {
                        kind: "hit",
                        label: "seen",
                        now: d,
                        final: l.parafovea,
                        hint: "Files that only appeared in search results, never opened",
                      }),
                      e.jsx(at, {
                        kind: "unvisited",
                        label: "unvisited",
                        now: f,
                        final: j,
                        hint: "Files in the map the agent never touched",
                      }),
                      R > 0
                        ? e.jsx(at, {
                            kind: "ghost",
                            label: "ghost",
                            now: R,
                            final: R,
                            hint: "Files the session touched that are gone from the repository — drawn hollow in the scene",
                          })
                        : null,
                    ],
                  }),
                  e.jsxs("div", {
                    className: "hud-quiet",
                    children: [
                      e.jsx(Ei, { edited: a, read: o, seen: d, total: l.filesInRepo }),
                      e.jsxs("span", {
                        "data-hint": `Tool calls — ${ms(l.actions)}`,
                        children: [fs(l.actions), " calls"],
                      }),
                      e.jsxs("span", {
                        "data-hint": "User messages — each one starts a turn of agent work",
                        children: [l.userTurns, " turns"],
                      }),
                      l.subagents > 0
                        ? e.jsxs("button", {
                            className: "hud-agent-link",
                            "data-hint": "Subagent launches (Task/Agent) — open Agent lenses",
                            onClick: h,
                            disabled: !h || v,
                            "aria-label": `Open ${l.subagents} subagent${l.subagents === 1 ? "" : "s"} in Agent lenses`,
                            children: [l.subagents, " subagent", l.subagents === 1 ? "" : "s"],
                          })
                        : null,
                      l.compactions > 0
                        ? e.jsxs("span", {
                            "data-hint":
                              "Context compactions — the conversation was summarized to free memory",
                            children: [
                              l.compactions,
                              " compaction",
                              l.compactions === 1 ? "" : "s",
                            ],
                          })
                        : null,
                      e.jsxs("span", {
                        "data-hint": "Tool output the agent consumed over the session",
                        children: [$i(l.resultBytes), " output"],
                      }),
                      e.jsx("span", {
                        "data-hint": Si(l.observability.reads),
                        children:
                          l.observability.reads === "unavailable"
                            ? "re-reads n/a"
                            : `re-reads ${hs(l.observability.reads)}${Ci(l.regressionRate)}`,
                      }),
                    ],
                  }),
                  p
                    ? e.jsxs("div", {
                        className: "hud-review",
                        children: [
                          e.jsx("span", { className: "review-label", children: "review" }),
                          I > 0
                            ? e.jsxs("span", {
                                className: "warn",
                                "data-hint": `${ms(l.errors)} — press X to jump to the next one${Ri(l.observability.errors)}`,
                                children: [
                                  hs(l.observability.errors),
                                  I,
                                  " error",
                                  I === 1 ? "" : "s",
                                ],
                              })
                            : null,
                          l.churnFiles > 0
                            ? e.jsxs("button", {
                                ref: K,
                                className: $ ? "warn churn-toggle open" : "warn churn-toggle",
                                "aria-expanded": $,
                                onClick: () => W((C) => !C),
                                "data-hint": `Files edited in three or more separate events — the most-edited file changed ${l.maxEditsPerFile} times. Click to list them.`,
                                children: [
                                  l.churnFiles,
                                  " file",
                                  l.churnFiles === 1 ? "" : "s",
                                  " edited 3+ times",
                                ],
                              })
                            : null,
                          l.actions.edit > 0
                            ? l.actions.verify === 0
                              ? e.jsx("span", {
                                  className: "warn",
                                  "data-hint":
                                    "The session edited files but no build or test commands were recognized (go test, make test, npm run build, …)",
                                  children: "never verified",
                                })
                              : l.editsAfterLastVerify > 0
                                ? e.jsxs("span", {
                                    className: "warn",
                                    "data-hint": `Edit events after the session's last build or test run — ${ps(l.actions.verify)} total; pass/fail is not tracked`,
                                    children: [
                                      l.editsAfterLastVerify,
                                      " edit",
                                      l.editsAfterLastVerify === 1 ? "" : "s",
                                      " after last verify",
                                    ],
                                  })
                                : e.jsx("span", {
                                    className: "ok",
                                    "data-hint": `The last edit was followed by a build or test run — ${ps(l.actions.verify)} total; pass/fail is not tracked`,
                                    children: "verified after final edit",
                                  })
                            : null,
                        ],
                      })
                    : null,
                  $
                    ? e.jsxs("div", {
                        className: "churn-panel",
                        ref: ee,
                        children: [
                          c.slice(0, Lt).map((C) =>
                            e.jsxs(
                              "button",
                              {
                                className: "churn-row",
                                onClick: () => {
                                  (u(C.path), W(!1));
                                },
                                children: [
                                  e.jsx("span", { className: "churn-path", children: C.path }),
                                  e.jsxs("span", {
                                    className: "churn-count",
                                    children: [C.edits, " edit", C.edits === 1 ? "" : "s"],
                                  }),
                                ],
                              },
                              C.path,
                            ),
                          ),
                          c.length > Lt
                            ? e.jsxs("p", {
                                className: "churn-more",
                                children: ["…and ", c.length - Lt, " more"],
                              })
                            : null,
                        ],
                      })
                    : null,
                ],
              })
            : null,
        ],
      }),
    })
  );
});
function Ei({ edited: t, read: s, seen: n, total: r }) {
  const a = t + s + n,
    o = r > 0 ? Math.min(100, (a / r) * 100) : 0,
    d = 8,
    c = 2 * Math.PI * d,
    u = (o / 100) * c;
  return e.jsxs("span", {
    className: "coverage-gauge",
    "data-hint": `Coverage: ${a} of ${r} files touched (${o.toFixed(0)}%)`,
    children: [
      e.jsxs("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        "aria-hidden": !0,
        children: [
          e.jsx("circle", {
            cx: "10",
            cy: "10",
            r: d,
            fill: "none",
            stroke: "var(--hairline)",
            strokeWidth: "2.5",
          }),
          e.jsx("circle", {
            cx: "10",
            cy: "10",
            r: d,
            fill: "none",
            stroke: "var(--moss)",
            strokeWidth: "2.5",
            strokeDasharray: `${u} ${c}`,
            strokeLinecap: "round",
            transform: "rotate(-90 10 10)",
            style: { transition: "stroke-dasharray 0.3s ease" },
          }),
        ],
      }),
      e.jsxs("span", { className: "coverage-gauge-pct", children: [o.toFixed(0), "%"] }),
    ],
  });
}
function at({ kind: t, label: s, now: n, final: r, hint: a }) {
  return e.jsxs("div", {
    className: "spectrum-stat",
    "data-hint": a,
    children: [
      e.jsx("span", { className: `legend-dot ${t}` }),
      e.jsx("span", { className: "spectrum-label", children: s }),
      e.jsx("strong", { children: n === r ? r : `${n} → ${r}` }),
    ],
  });
}
function Ci(t) {
  return `${Math.round(t * 100)}%`;
}
function hs(t) {
  return t === "estimated" ? "~" : "";
}
function ps(t) {
  return `${t} verify run${t === 1 ? "" : "s"}`;
}
function Si(t) {
  switch (t) {
    case "unavailable":
      return "No file reads observed — this session reads files through commands mindwalk could not recognize";
    case "estimated":
      return "Reads that re-read a file unchanged since its last read — inferred from shell commands, so the rate is approximate";
    default:
      return "Reads that re-read a file unchanged since its last read";
  }
}
function Ri(t) {
  return t === "estimated"
    ? " — inferred from command output; failures inside scripted calls may be missed"
    : "";
}
const on = ["search", "read", "edit", "exec", "verify", "other"];
function fs(t) {
  return on.reduce((s, n) => s + t[n], 0);
}
function ms(t) {
  const s = on.filter((n) => t[n] > 0).map((n) => `${t[n]} ${n}`);
  return s.length ? s.join(" · ") : "none";
}
function $i(t) {
  const s = t / 1024;
  return s < 1 ? `${t} B` : s < 1e3 ? `${Math.round(s)} KB` : `${(s / 1024).toFixed(1)} MB`;
}
function Ai(t) {
  const s = t.replace(/\/+$/, "");
  return s.slice(s.lastIndexOf("/") + 1);
}
function Li({
  file: t,
  touch: s,
  history: n,
  onClose: r,
  onJumpTo: a,
  locked: o = !1,
  currentSeq: d,
  total: c,
}) {
  if (!t)
    return e.jsxs("div", {
      className: "dock-body",
      "aria-label": "File inspector",
      children: [
        e.jsxs("div", {
          className: "inspector-head",
          children: [
            e.jsx("div", { className: "inspector-path", children: "Inspect" }),
            e.jsx("button", {
              className: "icon-btn",
              onClick: r,
              title: "Close",
              "aria-label": "Close inspector",
              children: e.jsx(Le, { size: 15 }),
            }),
          ],
        }),
        e.jsx("p", {
          className: "dock-note",
          children:
            "Click a building in the scene to inspect a file — its touch state, size, and every visit the agent paid it.",
        }),
      ],
    });
  const u = t.path.lastIndexOf("/"),
    h = u >= 0 ? t.path.slice(0, u + 1) : "",
    v = u >= 0 ? t.path.slice(u + 1) : t.path;
  return e.jsxs("div", {
    className: "dock-body",
    "aria-label": `File ${t.path}`,
    children: [
      e.jsxs("div", {
        className: "inspector-head",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "inspector-path",
                children: [
                  e.jsx("span", { className: "dir", children: h }),
                  v,
                  e.jsx("button", {
                    className: "icon-btn copy-path-btn",
                    onClick: () => Ii(t.path),
                    title: "Copy file path",
                    "aria-label": "Copy file path",
                    children: e.jsx(Jn, { size: 13 }),
                  }),
                ],
              }),
              t.ghost
                ? e.jsx("span", { className: "ghost-badge", children: "ghost — not in this tree" })
                : null,
            ],
          }),
          e.jsx("button", {
            className: "icon-btn",
            onClick: r,
            title: "Close",
            "aria-label": "Close inspector",
            children: e.jsx(Le, { size: 15 }),
          }),
        ],
      }),
      e.jsxs("dl", {
        className: "inspector-facts",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("dt", { children: "Touch" }),
              e.jsx("dd", { className: s ? `touch-${s}` : void 0, children: Fe(s) }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("dt", { children: "Lang" }),
              e.jsx("dd", { children: t.lang || "text" }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("dt", { children: "Lines" }),
              e.jsx("dd", { children: t.lines.toLocaleString() }),
            ],
          }),
          e.jsxs("div", {
            children: [e.jsx("dt", { children: "Bytes" }), e.jsx("dd", { children: Ti(t.bytes) })],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "inspector-history",
        children: [
          e.jsxs("p", { className: "eyebrow", children: ["Visits · ", n.length] }),
          n.length > 0 && c > 0
            ? e.jsx(zi, { history: n, total: c, currentSeq: d, onJumpTo: a, locked: o })
            : null,
          e.jsxs("div", {
            className: "history-list",
            children: [
              n
                .slice(-14)
                .reverse()
                .map((l) =>
                  e.jsxs(
                    "button",
                    {
                      className: "history-row",
                      onClick: () => a(l.seq),
                      disabled: o,
                      title: `Jump to step ${l.seq + 1} — ${l.summary}`,
                      children: [
                        e.jsx("span", { className: `action-dot ${l.action}` }),
                        e.jsxs("strong", { children: ["#", l.seq + 1] }),
                        e.jsx("span", { children: l.tool }),
                        e.jsx("span", {
                          className: "history-time",
                          children: l.ts ? Pi(l.ts) : "",
                        }),
                        l.isError
                          ? e.jsx(jt, { className: "history-err", size: 13 })
                          : e.jsx("span", {}),
                      ],
                    },
                    l.seq,
                  ),
                ),
              n.length === 0
                ? e.jsx("p", {
                    className: "muted",
                    children:
                      "Not visited yet at this point of the walk. Scrub the timeline forward.",
                  })
                : null,
            ],
          }),
        ],
      }),
    ],
  });
}
function zi({ history: t, total: s, currentSeq: n, onJumpTo: r, locked: a }) {
  const c = s > 1 ? (n / (s - 1)) * 100 : 0;
  return e.jsxs("svg", {
    className: "visit-sparkline",
    viewBox: "0 0 100 16",
    preserveAspectRatio: "none",
    role: "img",
    "aria-label": `Visit timeline: ${t.length} visits across ${s} events`,
    children: [
      e.jsx("line", {
        x1: 0,
        y1: 16 / 2,
        x2: 100,
        y2: 16 / 2,
        stroke: "var(--hairline)",
        strokeWidth: "0.5",
      }),
      t.map((u) => {
        const h = s > 1 ? (u.seq / (s - 1)) * 100 : 50;
        return e.jsx(
          "circle",
          {
            cx: h,
            cy: 16 / 2,
            r: 1.8,
            className: `spark-dot spark-${u.action}`,
            children: e.jsxs("title", {
              children: ["#", u.seq + 1, ": ", u.action, " — ", u.summary],
            }),
          },
          u.seq,
        );
      }),
      e.jsx("line", {
        x1: c,
        y1: 0,
        x2: c,
        y2: 16,
        className: "spark-playhead",
        stroke: "var(--ink)",
        strokeWidth: "0.8",
      }),
      t.map((u) => {
        const h = s > 1 ? (u.seq / (s - 1)) * 100 : 50;
        return e.jsx(
          "circle",
          {
            cx: h,
            cy: 16 / 2,
            r: 5,
            fill: "transparent",
            style: { cursor: a ? "default" : "pointer" },
            onClick: () => !a && r(u.seq),
          },
          `hit-${u.seq}`,
        );
      }),
    ],
  });
}
function Pi(t) {
  const s = new Date(t);
  return Number.isNaN(s.getTime())
    ? ""
    : [s.getHours(), s.getMinutes(), s.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
}
function Ti(t) {
  if (t < 1024) return `${t} B`;
  const s = t / 1024;
  return s < 1024 ? `${s.toFixed(1)} KB` : `${(s / 1024).toFixed(1)} MB`;
}
function Ii(t) {
  navigator.clipboard?.writeText(t);
}
function Bi(t, s) {
  const n = t.trim().toLowerCase();
  return n ? s.toLowerCase().includes(n) : !0;
}
const qi = {
    edit: "var(--act-edit)",
    read: "var(--act-read)",
    hit: "var(--act-search)",
    unvisited: "var(--hairline)",
  },
  Di = i.memo(function ({
    city: s,
    playback: n,
    selectedPath: r,
    onSelect: a,
    heatMode: o = !1,
    editCounts: d,
  }) {
    const [c, u] = i.useState(null),
      [h, v] = i.useState("");
    i.useEffect(() => {
      let $ = 0;
      const W = (ee) => {
        const K = ee.detail;
        ($++, $ % 6 === 0 && u(K));
      };
      return (
        window.addEventListener("mindwalk:camera-state", W),
        () => window.removeEventListener("mindwalk:camera-state", W)
      );
    }, []);
    const l = i.useMemo(() => {
        if (!s || s.files.length === 0) return null;
        let $ = 1 / 0,
          W = -1 / 0,
          ee = 1 / 0,
          K = -1 / 0;
        for (const C of s.files)
          (($ = Math.min($, C.rect.x)),
            (W = Math.max(W, C.rect.x + C.rect.w)),
            (ee = Math.min(ee, C.rect.z)),
            (K = Math.max(K, C.rect.z + C.rect.d)));
        return { minX: $, minZ: ee, w: W - $ || 1, d: K - ee || 1 };
      }, [s]),
      y = i.useMemo(() => (d ? Math.max(1, ...d.values()) : 1), [d]),
      f = h.trim().length > 0;
    if (!s || !l) return null;
    const j = 140,
      R = 4,
      I = ($) => R + (($ - l.minX) / l.w) * (j - 2 * R),
      p = ($) => R + (($ - l.minZ) / l.d) * (j - 2 * R),
      H = ($) => ($ / l.w) * (j - 2 * R),
      P = ($) => ($ / l.d) * (j - 2 * R),
      N = c ? I(c.tx) : null,
      T = c ? p(c.tz) : null,
      L = c ? Math.max(6, Math.min(40, (c.dist / l.w) * j * 0.3)) : 0;
    return e.jsxs("div", {
      className: "minimap-container",
      "aria-label": "Scene minimap",
      children: [
        e.jsxs("div", {
          className: "minimap-search",
          children: [
            e.jsx(Dt, { size: 11, "aria-hidden": !0 }),
            e.jsx("input", {
              type: "search",
              placeholder: "filter files…",
              value: h,
              onChange: ($) => v($.currentTarget.value),
              "aria-label": "Filter files in minimap",
            }),
            f
              ? e.jsx("button", {
                  className: "minimap-search-clear",
                  onClick: () => v(""),
                  "aria-label": "Clear filter",
                  children: e.jsx(Le, { size: 11 }),
                })
              : null,
          ],
        }),
        e.jsxs("svg", {
          width: j,
          height: j,
          viewBox: `0 0 ${j} ${j}`,
          preserveAspectRatio: "xMidYMid meet",
          className: "minimap-svg",
          role: "img",
          "aria-label": "Repository overview",
          children: [
            s.dirs
              .slice(0, 30)
              .map(($) =>
                e.jsx(
                  "rect",
                  {
                    x: I($.rect.x),
                    y: p($.rect.z),
                    width: H($.rect.w),
                    height: P($.rect.d),
                    fill: "none",
                    stroke: "var(--hairline)",
                    strokeWidth: 0.3,
                    opacity: 0.4,
                  },
                  $.path,
                ),
              ),
            s.files.map(($) => {
              const W = n.touchByPath.get($.path),
                ee = $.path === r,
                K = d?.get($.path) ?? 0,
                C = !f || Bi(h, $.path);
              let F, B;
              if (o && K > 0) {
                const k = K / y;
                ((F =
                  k > 0.66
                    ? "var(--alarm, #e05555)"
                    : k > 0.33
                      ? "var(--amber, #e0a458)"
                      : "var(--moss)"),
                  (B = (0.3 + k * 0.7) * (C ? 1 : 0.15)));
              } else ((F = qi[W ?? "unvisited"]), (B = (W ? 0.8 : 0.2) * (C ? 1 : 0.15)));
              return e.jsx(
                "rect",
                {
                  x: I($.rect.x),
                  y: p($.rect.z),
                  width: Math.max(1, H($.rect.w)),
                  height: Math.max(1, P($.rect.d)),
                  fill: F,
                  fillOpacity: B,
                  stroke: ee ? "var(--ember)" : "none",
                  strokeWidth: ee ? 1 : 0,
                  children: e.jsxs("title", {
                    children: [$.path, " — ", o && K > 0 ? `${K} edits` : Fe(W)],
                  }),
                },
                $.id,
              );
            }),
            N !== null && T !== null
              ? e.jsx("circle", {
                  cx: N,
                  cy: T,
                  r: L,
                  fill: "none",
                  stroke: "var(--ink)",
                  strokeWidth: 0.8,
                  strokeDasharray: "2 2",
                  opacity: 0.6,
                })
              : null,
          ],
        }),
      ],
    });
  });
function Fi({ size: t = 22 }) {
  return e.jsxs("svg", {
    viewBox: "0 0 64 64",
    width: t,
    height: t,
    "aria-hidden": !0,
    focusable: "false",
    children: [
      e.jsx("defs", {
        children: e.jsxs("radialGradient", {
          id: "logo-halo",
          children: [
            e.jsx("stop", { offset: "0%", stopColor: "#f1aa57", stopOpacity: "0.55" }),
            e.jsx("stop", { offset: "100%", stopColor: "#f1aa57", stopOpacity: "0" }),
          ],
        }),
      }),
      e.jsx("rect", { width: "64", height: "64", rx: "14", fill: "#0f141b" }),
      e.jsx("circle", { cx: "20", cy: "15", r: "1.6", fill: "#3b4047" }),
      e.jsx("circle", { cx: "11", cy: "27", r: "1.4", fill: "#3b4047" }),
      e.jsx("circle", { cx: "51", cy: "40", r: "1.6", fill: "#3b4047" }),
      e.jsx("circle", { cx: "34", cy: "53", r: "1.4", fill: "#3b4047" }),
      e.jsxs("g", {
        fill: "#f1aa57",
        children: [
          e.jsx("circle", { cx: "18.6", cy: "47.9", r: "1.15", opacity: "0.35" }),
          e.jsx("circle", { cx: "22.7", cy: "45.2", r: "1.25", opacity: "0.42" }),
          e.jsx("circle", { cx: "25.9", cy: "42", r: "1.35", opacity: "0.49" }),
          e.jsx("circle", { cx: "28.2", cy: "38.1", r: "1.45", opacity: "0.56" }),
          e.jsx("circle", { cx: "30.9", cy: "29.3", r: "1.55", opacity: "0.64" }),
          e.jsx("circle", { cx: "33", cy: "25.4", r: "1.65", opacity: "0.72" }),
          e.jsx("circle", { cx: "36", cy: "22.1", r: "1.75", opacity: "0.8" }),
          e.jsx("circle", { cx: "38", cy: "20.4", r: "1.85", opacity: "0.88" }),
        ],
      }),
      e.jsx("circle", { cx: "13", cy: "50", r: "4.5", fill: "#9fc67b", opacity: "0.16" }),
      e.jsx("circle", { cx: "13", cy: "50", r: "2.4", fill: "#9fc67b" }),
      e.jsx("circle", { cx: "29.5", cy: "34", r: "5", fill: "#b6daf1", opacity: "0.16" }),
      e.jsx("circle", { cx: "29.5", cy: "34", r: "2.7", fill: "#b6daf1" }),
      e.jsx("circle", { cx: "44", cy: "17.5", r: "9.5", fill: "url(#logo-halo)" }),
      e.jsx("circle", { cx: "44", cy: "17.5", r: "3.4", fill: "#f1aa57" }),
      e.jsx("circle", { cx: "44", cy: "17.5", r: "1.7", fill: "#ffe0b0" }),
    ],
  });
}
const _i = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform),
  cn = _i ? "⌘B" : "Ctrl+B",
  Oi = i.memo(function ({
    sessions: s,
    activeKey: n,
    loading: r,
    hideEmpty: a,
    harnessFilter: o,
    collapsed: d,
    onSelect: c,
    onRefresh: u,
    onHideEmptyChange: h,
    onHarnessFilterChange: v,
    onCollapse: l,
    onOpenMap: y,
    activeRepo: f,
    locked: j = !1,
    activeReportState: R,
  }) {
    const [I, p] = i.useState(""),
      [H, P] = i.useState(""),
      [N, T] = i.useState(!1),
      [L, $] = i.useState(new Set()),
      [W, ee] = i.useState(() => {
        try {
          return localStorage.getItem("mindwalk.sortBy") || "newest";
        } catch {
          return "newest";
        }
      }),
      K = i.useCallback((x) => {
        ee(x);
        try {
          localStorage.setItem("mindwalk.sortBy", x);
        } catch {}
      }, []),
      C = i.useRef(null);
    i.useEffect(() => {
      if (!N) return;
      const x = (b) => {
          C.current?.contains(b.target) || T(!1);
        },
        D = (b) => {
          b.key === "Escape" && T(!1);
        };
      return (
        document.addEventListener("pointerdown", x),
        document.addEventListener("keydown", D),
        () => {
          (document.removeEventListener("pointerdown", x),
            document.removeEventListener("keydown", D));
        }
      );
    }, [N]);
    const F = i.useMemo(() => [...new Set(s.map((x) => x.harness))].sort(), [s]),
      B = i.useMemo(() => s.filter((x) => x.eventCount === 0).length, [s]),
      k = o && F.includes(o) ? o : void 0,
      w = i.useMemo(() => {
        const x = I.trim().toLowerCase();
        return s.filter((D) =>
          nn(D, { hideEmpty: a, harness: k }, n)
            ? x
              ? `${D.title ?? ""} ${D.id} ${D.gitBranch ?? ""} ${D.harness}`
                  .toLowerCase()
                  .includes(x)
              : !0
            : !1,
        );
      }, [s, I, a, k, n]),
      E = i.useMemo(() => Ui(w, W), [w, W]),
      S = i.useMemo(() => Ki(E), [E]),
      _ = i.useCallback((x) => {
        $((D) => {
          const b = new Set(D);
          return (b.has(x) ? b.delete(x) : b.add(x), b);
        });
      }, []);
    return (
      i.useEffect(() => {
        if (d || j) return;
        const x = (b) => {
            const Z = b;
            return (
              !!Z && (Z.tagName === "INPUT" || Z.tagName === "TEXTAREA" || Z.isContentEditable)
            );
          },
          D = (b) => {
            if (b.metaKey || b.ctrlKey || b.altKey || x(b.target)) return;
            const Z = b.key.toLowerCase();
            if (Z !== "j" && Z !== "k") return;
            b.preventDefault();
            const ae = S.flatMap((U) => U.sessions.map((G) => G.key));
            if (ae.length === 0) return;
            const le = n ? ae.indexOf(n) : -1,
              V = Z === "j" ? (le < ae.length - 1 ? le + 1 : 0) : le > 0 ? le - 1 : ae.length - 1;
            c(ae[V]);
          };
        return (
          window.addEventListener("keydown", D), () => window.removeEventListener("keydown", D)
        );
      }, [d, j, S, n, c]),
      e.jsxs("aside", {
        className: d ? "session-rail collapsed" : "session-rail",
        children: [
          e.jsxs("div", {
            className: "rail-head",
            children: [
              e.jsxs("h1", {
                className: "wordmark",
                children: [
                  e.jsx(Fi, {}),
                  e.jsxs("span", {
                    children: ["mindwalk", e.jsx("span", { className: "spark", children: "." })],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "rail-head-actions",
                children: [
                  e.jsxs("div", {
                    className: "rail-map",
                    ref: C,
                    children: [
                      e.jsx("button", {
                        className: "icon-btn",
                        onClick: () => T((x) => !x),
                        "aria-expanded": N,
                        title: "Open a repository map",
                        "aria-label": "Open a repository map",
                        children: e.jsx(Yt, { size: 15 }),
                      }),
                      N
                        ? e.jsxs("div", {
                            className: "rail-map-pop",
                            children: [
                              f
                                ? e.jsxs("button", {
                                    className: "rail-map-primary",
                                    onClick: () => {
                                      (y(f), T(!1));
                                    },
                                    title: `Open the map of ${f}`,
                                    children: [
                                      e.jsx(Yt, { size: 14, "aria-hidden": !0 }),
                                      e.jsxs("span", {
                                        className: "rail-map-primary-text",
                                        children: [
                                          e.jsx("span", {
                                            className: "rail-map-primary-name",
                                            children: gs(f),
                                          }),
                                          e.jsx("span", {
                                            className: "rail-map-primary-path",
                                            children: "‎" + f,
                                          }),
                                        ],
                                      }),
                                    ],
                                  })
                                : null,
                              f
                                ? e.jsx("div", {
                                    className: "rail-map-divider",
                                    "aria-hidden": !0,
                                    children: e.jsx("span", { children: "or open any repository" }),
                                  })
                                : e.jsx("p", {
                                    className: "rail-map-label",
                                    children: "Open a repository map",
                                  }),
                              e.jsxs("form", {
                                className: "rail-map-form",
                                onSubmit: (x) => {
                                  x.preventDefault();
                                  const D = H.trim();
                                  D && (y(D), T(!1));
                                },
                                children: [
                                  e.jsx("input", {
                                    type: "text",
                                    className: "rail-map-input",
                                    placeholder: "/path/to/repo",
                                    value: H,
                                    onChange: (x) => P(x.currentTarget.value),
                                    spellCheck: !1,
                                  }),
                                  e.jsx("button", {
                                    type: "submit",
                                    className: "rail-map-go",
                                    disabled: H.trim() === "",
                                    children: "Open",
                                  }),
                                ],
                              }),
                            ],
                          })
                        : null,
                    ],
                  }),
                  e.jsx("button", {
                    className: "icon-btn",
                    onClick: u,
                    disabled: j,
                    title: "Rescan sessions",
                    "aria-label": "Rescan sessions",
                    children: e.jsx(yt, { size: 15 }),
                  }),
                  e.jsx("button", {
                    className: "icon-btn",
                    onClick: l,
                    title: `Hide sidebar (${cn})`,
                    "aria-label": "Hide session sidebar",
                    children: e.jsx(kr, { size: 15 }),
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "rail-controls",
            children: [
              e.jsxs("label", {
                className: "rail-filter",
                children: [
                  e.jsx(Dt, { size: 14, "aria-hidden": !0 }),
                  e.jsx("input", {
                    type: "search",
                    placeholder: "Filter sessions",
                    value: I,
                    onChange: (x) => p(x.currentTarget.value),
                    "aria-label": "Filter sessions",
                  }),
                ],
              }),
              e.jsxs("label", {
                className: "rail-sort",
                title: "Sort sessions",
                children: [
                  e.jsx(Kn, { size: 13, "aria-hidden": !0 }),
                  e.jsxs("select", {
                    value: W,
                    onChange: (x) => K(x.currentTarget.value),
                    "aria-label": "Sort sessions",
                    children: [
                      e.jsx("option", { value: "newest", children: "Newest" }),
                      e.jsx("option", { value: "oldest", children: "Oldest" }),
                      e.jsx("option", { value: "events", children: "Most events" }),
                      e.jsx("option", { value: "cost", children: "Highest cost" }),
                    ],
                  }),
                ],
              }),
              F.length > 1 || B > 0
                ? e.jsxs("div", {
                    className: "rail-chips",
                    role: "group",
                    "aria-label": "Session filters",
                    children: [
                      F.length > 1
                        ? e.jsxs(e.Fragment, {
                            children: [
                              e.jsx("button", {
                                className: k === void 0 ? "chip active" : "chip",
                                onClick: () => v(void 0),
                                children: "all",
                              }),
                              F.map((x) =>
                                e.jsx(
                                  "button",
                                  {
                                    className: k === x ? "chip active" : "chip",
                                    onClick: () => v(x),
                                    children: vs(x),
                                  },
                                  x,
                                ),
                              ),
                            ],
                          })
                        : null,
                      B > 0
                        ? e.jsx("button", {
                            className: a ? "eye-toggle" : "eye-toggle showing",
                            onClick: () => h(!a),
                            "aria-pressed": !a,
                            title: a ? `Show ${B} empty sessions` : `Hide ${B} empty sessions`,
                            "aria-label": a
                              ? `Show ${B} empty sessions`
                              : `Hide ${B} empty sessions`,
                            children: a
                              ? e.jsx(ir, { size: 13, "aria-hidden": !0 })
                              : e.jsx(cr, { size: 13, "aria-hidden": !0 }),
                          })
                        : null,
                    ],
                  })
                : null,
            ],
          }),
          e.jsxs("div", {
            className: "session-list",
            "aria-busy": r,
            children: [
              S.length === 0
                ? e.jsx("p", {
                    className: "muted",
                    style: { padding: "10px 8px" },
                    children: r && s.length === 0 ? "Scanning sessions…" : "No matching sessions.",
                  })
                : null,
              S.map((x) => {
                const D = L.has(x.label);
                return e.jsxs(
                  "div",
                  {
                    className: "session-group",
                    children: [
                      e.jsxs("button", {
                        className: "session-group-head",
                        onClick: () => _(x.label),
                        "aria-expanded": !D,
                        children: [
                          e.jsx("span", { className: "session-group-label", children: x.label }),
                          e.jsx("span", {
                            className: "session-group-count",
                            children: x.sessions.length,
                          }),
                        ],
                      }),
                      D
                        ? null
                        : x.sessions.map((b) => {
                            const Z = b.key === n,
                              ae = Z && R !== void 0 ? R : b.reportState;
                            return e.jsxs(
                              "button",
                              {
                                className: Z ? "session-row active" : "session-row",
                                onClick: () => c(b.key),
                                disabled: j,
                                children: [
                                  e.jsxs("span", {
                                    className: "session-title",
                                    children: [
                                      e.jsx("span", {
                                        className: `harness-dot harness-${b.harness}${b.endedAt ? "" : " running"}`,
                                        "aria-hidden": !0,
                                      }),
                                      b.title || b.id,
                                    ],
                                  }),
                                  e.jsxs("span", {
                                    className: "session-meta",
                                    children: [
                                      e.jsxs("span", {
                                        className: "session-meta-text",
                                        children: [
                                          vs(b.harness),
                                          " · ",
                                          b.eventCount,
                                          " ",
                                          b.eventCount === 1 ? "call" : "calls",
                                          b.cwd ? ` · ${gs(b.cwd)}` : "",
                                          b.provider ? ` · ${b.provider}` : "",
                                          b.promptTokens || b.completionTokens
                                            ? ` · ${ys(b.promptTokens || 0)}/${ys(b.completionTokens || 0)} tok`
                                            : "",
                                          b.cost && b.cost > 0 ? ` · $${b.cost.toFixed(2)}` : "",
                                          b.gitBranch ? ` · ${b.gitBranch}` : "",
                                        ],
                                      }),
                                      e.jsxs("span", {
                                        className: "session-meta-right",
                                        children: [
                                          ae
                                            ? e.jsx("span", {
                                                className: `rail-eval rail-eval-${ae}`,
                                                title: xs(ae),
                                                "aria-label": xs(ae),
                                                children: ae === "running" ? "evaluating" : "",
                                              })
                                            : null,
                                          b.endedAt
                                            ? e.jsx("span", {
                                                className: "session-meta-time",
                                                title: b.endedAt,
                                                children: Wi(b.endedAt),
                                              })
                                            : e.jsx("span", {
                                                className: "session-meta-live",
                                                children: "active",
                                              }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              b.key,
                            );
                          }),
                    ],
                  },
                  x.label,
                );
              }),
            ],
          }),
          e.jsx("div", {
            className: "rail-foot",
            children:
              w.length === s.length
                ? `${s.length} session${s.length === 1 ? "" : "s"}`
                : `${w.length} of ${s.length} sessions`,
          }),
        ],
      })
    );
  });
function gs(t) {
  const s = t.replace(/\/+$/, "");
  return s.slice(s.lastIndexOf("/") + 1) || s;
}
function xs(t) {
  switch (t) {
    case "running":
      return "Evaluation in progress";
    case "done":
      return "Evaluation ready";
    case "stale":
      return "Evaluation ready, but the session has grown since";
    case "failed":
      return "Last evaluation failed";
  }
}
function vs(t) {
  switch (t) {
    case "claude-code":
      return "Claude";
    case "crush":
      return "Crush";
    case "codex":
      return "Codex";
    case "pi":
      return "Pi";
    default:
      return t.charAt(0).toUpperCase() + t.slice(1);
  }
}
function Hi(t) {
  const s = new Date(t);
  if (Number.isNaN(s.getTime())) return "";
  const n = new Date(),
    r = s.getFullYear() === n.getFullYear(),
    a = `${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`,
    o = `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
  return r ? `${a} ${o}` : `${s.getFullYear()}-${a}`;
}
function ys(t) {
  return t >= 1e3 ? `${(t / 1e3).toFixed(0)}k` : String(t);
}
function Wi(t) {
  const s = new Date(t);
  if (Number.isNaN(s.getTime())) return "";
  const r = Date.now() - s.getTime();
  if (r < 0) return "just now";
  const a = Math.floor(r / 1e3);
  if (a < 60) return "just now";
  const o = Math.floor(a / 60);
  if (o < 60) return `${o}m ago`;
  const d = Math.floor(o / 60);
  if (d < 24) return `${d}h ago`;
  const c = Math.floor(d / 24);
  if (c === 1) return "yesterday";
  if (c < 7) return `${c}d ago`;
  const u = Math.floor(c / 7);
  return u < 5 ? `${u}w ago` : Hi(t);
}
function Ui(t, s) {
  const n = [...t];
  switch (s) {
    case "newest":
      return n.sort((r, a) => ft(a.endedAt ?? a.startedAt) - ft(r.endedAt ?? r.startedAt));
    case "oldest":
      return n.sort((r, a) => ft(r.endedAt ?? r.startedAt) - ft(a.endedAt ?? a.startedAt));
    case "events":
      return n.sort((r, a) => a.eventCount - r.eventCount);
    case "cost":
      return n.sort((r, a) => (a.cost ?? 0) - (r.cost ?? 0));
    default:
      return n;
  }
}
function ft(t) {
  if (!t) return 0;
  const s = new Date(t).getTime();
  return Number.isNaN(s) ? 0 : s;
}
function Ki(t) {
  const s = new Date(),
    n = new Date(s.getFullYear(), s.getMonth(), s.getDate()),
    r = new Date(n.getTime() - 864e5),
    a = new Date(n.getTime() - 6 * 864e5),
    o = new Date(n.getTime() - 29 * 864e5),
    d = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  for (const c of t) {
    const u = c.endedAt ? new Date(c.endedAt) : null;
    !u || Number.isNaN(u.getTime())
      ? d.Older.push(c)
      : u >= n
        ? d.Today.push(c)
        : u >= r
          ? d.Yesterday.push(c)
          : u >= a
            ? d["This Week"].push(c)
            : (u >= o, d.Older.push(c));
  }
  return Object.entries(d)
    .filter(([, c]) => c.length > 0)
    .map(([c, u]) => ({ label: c, sessions: u }));
}
const Vi = i.memo(function ({ event: s, total: n }) {
    if (!s || n === 0)
      return e.jsx("div", {
        className: "event-summary empty",
        children: e.jsx("span", {
          className: "readout-summary muted",
          children: "No recorded activity at this position.",
        }),
      });
    const r = s.targets
      .filter((a) => a.path)
      .map((a) => a.path)
      .slice(0, 4);
    return e.jsxs("div", {
      className: `event-summary action-${s.action}${s.isError ? " errored" : ""}`,
      children: [
        e.jsx("span", { className: `action-dot ${s.action}` }),
        e.jsxs("div", {
          className: "event-summary-body",
          children: [
            e.jsxs("div", {
              className: "event-summary-head",
              children: [
                e.jsx("span", { className: "readout-tool", children: s.tool }),
                s.isError ? e.jsx("span", { className: "err-badge", children: "error" }) : null,
                r.length > 0
                  ? e.jsxs("span", {
                      className: "event-targets",
                      title: r.join(", "),
                      children: [
                        r.map((a, o) =>
                          e.jsx("span", { className: "event-target", children: a }, o),
                        ),
                        s.targets.length > 4
                          ? e.jsxs("span", {
                              className: "event-target-more",
                              children: ["+", s.targets.length - 4],
                            })
                          : null,
                      ],
                    })
                  : null,
              ],
            }),
            e.jsx("span", { className: "readout-summary", title: s.summary, children: s.summary }),
          ],
        }),
      ],
    });
  }),
  Gi = 160,
  ws = 340,
  it = [1, 4, 16],
  Xi = 220,
  bs = {
    compaction: "context compaction",
    "user-message": "user message",
    subagent: "subagent",
    thinking: "agent thinking",
    "finish-reason": "turn ended",
    "model-switch": "model switched",
  },
  Yi = ["search", "read", "edit", "verify", "exec"];
function Zi({
  trace: t,
  currentSeq: s,
  onChange: n,
  onSubagentMark: r,
  onExport: a,
  exporting: o = !1,
}) {
  const [d, c] = i.useState(!1),
    [u, h] = i.useState(1),
    [v, l] = i.useState(!1),
    [y, f] = i.useState(!1),
    [j, R] = i.useState(0),
    [I, p] = i.useState(1),
    H = i.useRef(null),
    P = i.useRef(null),
    N = t?.events.length ?? 0,
    T = Math.max(0, N - 1),
    L = Math.min(s, T),
    $ = t?.events[L],
    W = Math.round(j * T),
    ee = Math.round(I * T),
    K = Math.max(0, ee - W),
    C = Math.max(0, Math.min(K, L - W)),
    F = j > 0.001 || I < 0.999;
  (i.useEffect(() => {
    (c(!1), R(0), p(1), l(!1));
  }, [t]),
    i.useEffect(() => {
      o && c(!1);
    }, [o]));
  const B = i.useRef(L),
    k = i.useRef(T),
    w = i.useRef(d);
  ((B.current = L),
    (k.current = T),
    (w.current = d),
    i.useEffect(() => {
      if (!d || N === 0 || o) return;
      const m = Math.max(85, ws / u),
        A = Math.max(1, Math.round((u * m) / ws)),
        O = window.setInterval(() => {
          if (B.current >= k.current) {
            if (v) {
              const J = j > 0.001 ? Math.round(j * k.current) : 0;
              n(J);
              return;
            }
            c(!1);
            return;
          }
          const Y = I < 0.999 ? Math.min(k.current, Math.round(I * k.current)) : k.current,
            de = B.current + A;
          if (de > Y && v) {
            const J = j > 0.001 ? Math.round(j * k.current) : 0;
            n(J);
            return;
          }
          n(Math.min(de, k.current));
        }, m);
      return () => window.clearInterval(O);
    }, [d, u, N, n, o, v, j, I, T]));
  const E = i.useCallback(() => {
      (!w.current && B.current >= k.current && n(0), c((m) => !m));
    }, [n]),
    S = i.useCallback(() => {
      h((m) => it[(it.indexOf(m) + 1) % it.length]);
    }, []),
    _ = i.useCallback(
      (m) => {
        n(Math.min(k.current, Math.max(0, B.current + m)));
      },
      [n],
    ),
    x = i.useCallback(
      (m, A) => {
        if (t) {
          for (let O = B.current + m; O >= 0 && O < t.events.length; O += m)
            if (A(t.events[O])) {
              n(O);
              return;
            }
        }
      },
      [t, n],
    ),
    D = i.useMemo(() => {
      const m = (t?.marks ?? []).map((A) =>
        Math.min(A.seq, Math.max(0, (t?.events.length ?? 1) - 1)),
      );
      return [...new Set(m)].sort((A, O) => A - O);
    }, [t]),
    b = i.useCallback(
      (m) => {
        const A = B.current,
          O = m === 1 ? D.find((Y) => Y > A) : [...D].reverse().find((Y) => Y < A);
        O !== void 0 && n(O);
      },
      [D, n],
    );
  i.useEffect(() => {
    if (!t || o) return;
    const m = (A) => {
      if (
        !(
          A.metaKey ||
          A.ctrlKey ||
          A.altKey ||
          A.target?.closest("input, textarea, select, button, [contenteditable]")
        )
      ) {
        switch (A.key) {
          case " ":
            (A.preventDefault(), E());
            return;
          case "ArrowLeft":
            (A.preventDefault(), _(A.shiftKey ? -10 : -1));
            return;
          case "ArrowRight":
            (A.preventDefault(), _(A.shiftKey ? 10 : 1));
            return;
          case "Home":
            (A.preventDefault(), n(0));
            return;
          case "End":
            (A.preventDefault(), n(k.current));
            return;
        }
        switch (A.key.toLowerCase()) {
          case "s":
            S();
            return;
          case "e":
            x(A.shiftKey ? -1 : 1, (Y) => Y.action === "edit");
            return;
          case "x":
            x(A.shiftKey ? -1 : 1, (Y) => Y.isError);
            return;
          case "m":
            b(A.shiftKey ? -1 : 1);
            return;
        }
      }
    };
    return (window.addEventListener("keydown", m), () => window.removeEventListener("keydown", m));
  }, [t, o, E, _, n, S, x, b]);
  const Z = N === 0 || o,
    ae = i.useCallback(
      (m) => {
        if (T <= 0) return;
        const A = L / T,
          O = (I - j) * m,
          Y = Math.max(0.05, Math.min(1, O));
        let de = A - Y / 2,
          J = A + Y / 2;
        (de < 0 && ((J -= de), (de = 0)),
          J > 1 && ((de -= J - 1), (J = 1)),
          R(Math.max(0, de)),
          p(Math.min(1, J)));
      },
      [T, L, j, I],
    ),
    le = i.useCallback(() => {
      (R(0), p(1));
    }, []),
    V = i.useCallback(
      (m) => {
        Z || T <= 0 || (m.preventDefault(), ae(m.deltaY < 0 ? 0.7 : 1.4));
      },
      [Z, T, ae],
    );
  (i.useEffect(() => {
    Z && f(!1);
  }, [Z]),
    i.useEffect(() => {
      if (!y) return;
      const m = (O) => {
          H.current?.contains(O.target) || f(!1);
        },
        A = (O) => {
          O.key === "Escape" && f(!1);
        };
      return (
        window.addEventListener("pointerdown", m),
        window.addEventListener("keydown", A),
        () => {
          (window.removeEventListener("pointerdown", m), window.removeEventListener("keydown", A));
        }
      );
    }, [y]));
  const U = i.useMemo(() => {
      if (!t || N === 0) return [];
      const m = Math.max(1, ee - W + 1),
        A = Math.min(Gi, m),
        O = [];
      for (let Y = 0; Y < A; Y++) {
        const de = W + Math.floor((Y * m) / A),
          J = W + Math.floor(((Y + 1) * m) / A),
          te = new Map();
        for (let z = de; z < J; z++) {
          const X = t.events[z].action;
          te.set(X, (te.get(X) ?? 0) + 1);
        }
        let me = "other",
          ge = -1;
        const Q = ["edit", "verify", "read", "search", "exec", "other"];
        for (const z of Q) {
          const X = te.get(z) ?? 0;
          X > ge && ((ge = X), (me = z));
        }
        O.push({ count: J - de, dominant: me });
      }
      return O;
    }, [t, N, W, ee]),
    G = i.useMemo(() => U.reduce((m, A) => Math.max(m, A.count), 1), [U]),
    oe = i.useMemo(() => {
      if (!t) return [];
      const m = new Map();
      for (const A of t.marks) {
        const O = Math.min(A.seq, T);
        if (O < W || O > ee) continue;
        const Y = K > 0 ? (O - W) / K : 0,
          de = `${A.type}:${Math.round(Y * Xi)}`,
          J = m.get(de);
        J
          ? (J.count++, (J.seq = Math.min(J.seq, O)))
          : m.set(de, {
              type: A.type,
              seq: O,
              pos: Y,
              count: 1,
              note: A.note,
              duration: A.duration,
            });
      }
      return [...m.values()];
    }, [t, T, W, ee, K]),
    ue = i.useMemo(
      () =>
        !t || N === 0
          ? []
          : t.events
              .filter((m) => m.isError && m.seq >= W && m.seq <= ee)
              .map((m) => ({
                seq: m.seq,
                pos: K > 0 ? (Math.min(m.seq, T) - W) / K : 0,
                summary: m.summary,
              })),
      [t, N, T, W, ee, K],
    );
  return e.jsxs("footer", {
    className: "deck",
    children: [
      e.jsxs("div", {
        className: "deck-main",
        children: [
          F
            ? e.jsxs("div", {
                className: "strip-minimap",
                "aria-hidden": !0,
                children: [
                  e.jsx("div", {
                    className: "strip-minimap-window",
                    style: { left: `${j * 100}%`, width: `${(I - j) * 100}%` },
                    onClick: le,
                    title: "Click to reset zoom",
                  }),
                  e.jsx("div", {
                    className: "strip-minimap-playhead",
                    style: { left: `${(L / Math.max(T, 1)) * 100}%` },
                  }),
                ],
              })
            : null,
          e.jsxs("div", {
            className: "strip",
            ref: P,
            onWheel: V,
            children: [
              e.jsx("div", {
                className: "strip-marks",
                children: oe.map((m, A) =>
                  e.jsx(
                    "button",
                    {
                      type: "button",
                      className: `strip-mark ${m.type}`,
                      style: { left: `${m.pos * 100}%` },
                      disabled: Z,
                      title: `${m.note || bs[m.type]}${m.count > 1 ? ` ×${m.count}` : ""}${m.duration ? ` (${m.duration}s)` : ""}`,
                      "aria-label": `Jump to ${m.note || bs[m.type]} at event ${m.seq + 1}${m.count > 1 ? `, ${m.count} marks` : ""}`,
                      onClick: () => (m.type === "subagent" && r ? r(m.seq) : n(m.seq)),
                    },
                    `${m.type}-${m.seq}-${A}`,
                  ),
                ),
              }),
              ue.length > 0
                ? e.jsx("div", {
                    className: "strip-errors",
                    "aria-hidden": !0,
                    children: ue.map((m, A) =>
                      e.jsx(
                        "span",
                        {
                          className: "strip-error",
                          style: { left: `${m.pos * 100}%` },
                          title: `Error at step ${m.seq + 1} — ${m.summary}`,
                        },
                        `err-${m.seq}-${A}`,
                      ),
                    ),
                  })
                : null,
              e.jsx("div", {
                className: "strip-bars",
                "aria-hidden": !0,
                children: U.map((m, A) =>
                  e.jsx(
                    "span",
                    {
                      className: `strip-bar ${m.dominant}`,
                      style: { height: `${18 + (m.count / G) * 82}%` },
                    },
                    A,
                  ),
                ),
              }),
              N > 0
                ? e.jsx("div", {
                    className: "strip-playhead",
                    style: { left: `${(C / Math.max(K, 1)) * 100}%` },
                    "aria-hidden": !0,
                  })
                : null,
              e.jsx("input", {
                className: "strip-input",
                type: "range",
                min: W,
                max: Math.max(W, ee),
                value: Math.max(W, Math.min(ee, L)),
                disabled: Z,
                onChange: (m) => n(Number(m.currentTarget.value)),
                "aria-label": "Playback position",
                "aria-valuetext": $ ? `event ${$.seq}: ${$.tool}` : "empty",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "deck-pos",
            "data-hint": "Event position and wall-clock timestamp at the playhead",
            children: [
              e.jsx("span", {
                className: "deck-pos-count",
                style: { minWidth: `${String(Math.max(N, 1)).length * 2 + 3}ch` },
                children: N > 0 ? `${L + 1} / ${N}` : "0 / 0",
              }),
              e.jsx("span", { className: "deck-pos-clock", children: $?.ts ? Ji($.ts) : "—" }),
            ],
          }),
          e.jsxs("div", {
            className: "transport",
            children: [
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => _(-1),
                disabled: Z,
                title: "Step back (←)",
                "aria-label": "Step back one event",
                children: e.jsx(qr, { size: 15 }),
              }),
              e.jsx("button", {
                className: "play-btn",
                onClick: E,
                disabled: Z,
                title: d ? "Pause (Space)" : "Play (Space)",
                "aria-label": d ? "Pause playback" : "Play playback",
                children: d
                  ? e.jsx(Cr, { size: 16 })
                  : e.jsx(Rr, { size: 16, className: "play-glyph" }),
              }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => _(1),
                disabled: Z,
                title: "Step forward (→)",
                "aria-label": "Step forward one event",
                children: e.jsx(Fr, { size: 15 }),
              }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => ae(0.7),
                disabled: Z || N < 2,
                title: "Zoom in (scroll on strip)",
                "aria-label": "Zoom into timeline",
                children: e.jsx(Xr, { size: 15 }),
              }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => (F ? le() : ae(1.4)),
                disabled: Z || N < 2,
                title: F ? "Reset zoom" : "Zoom out (scroll on strip)",
                "aria-label": F ? "Reset zoom" : "Zoom out of timeline",
                children: e.jsx(Zr, { size: 15 }),
              }),
              e.jsx("div", {
                className: "transport-speed-chips",
                role: "group",
                "aria-label": "Playback speed",
                children: it.map((m) =>
                  e.jsxs(
                    "button",
                    {
                      className: m === u ? "speed-chip active" : "speed-chip",
                      onClick: () => h(m),
                      "aria-pressed": m === u,
                      "aria-label": `${m}x speed`,
                      children: [m, "×"],
                    },
                    m,
                  ),
                ),
              }),
              e.jsx("button", {
                className: v ? "icon-btn active" : "icon-btn",
                onClick: () => l((m) => !m),
                disabled: Z,
                title: v ? "Loop on (wraps within zoom range)" : "Loop off",
                "aria-label": v ? "Disable loop playback" : "Enable loop playback",
                "aria-pressed": v,
                children: e.jsx(Lr, { size: 15 }),
              }),
              e.jsxs("div", {
                className: "transport-more",
                ref: H,
                children: [
                  e.jsx("button", {
                    className: `icon-btn${o ? " recording" : ""}${y ? " open" : ""}`,
                    onClick: () => f((m) => !m),
                    disabled: Z,
                    "aria-haspopup": "true",
                    "aria-expanded": y,
                    title: "More controls",
                    "aria-label": "More playback controls",
                    children: o
                      ? e.jsx(qt, { size: 15, className: "spin" })
                      : u !== 1
                        ? e.jsxs("span", { className: "more-speed", children: [u, "×"] })
                        : e.jsx(rr, { size: 15 }),
                  }),
                  y
                    ? e.jsxs("div", {
                        className: "transport-pop",
                        children: [
                          e.jsxs("div", {
                            className: "pop-speed",
                            children: [
                              e.jsx("span", { className: "pop-speed-label", children: "Speed" }),
                              e.jsx("div", {
                                className: "pop-speed-chips",
                                title: "Cycle with S",
                                children: it.map((m) =>
                                  e.jsxs(
                                    "button",
                                    {
                                      className: m === u ? "pop-chip engaged" : "pop-chip",
                                      onClick: () => h(m),
                                      "aria-pressed": m === u,
                                      children: [m, "×"],
                                    },
                                    m,
                                  ),
                                ),
                              }),
                            ],
                          }),
                          e.jsxs("button", {
                            className: "pop-item",
                            onClick: () => {
                              (n(0), f(!1));
                            },
                            children: [
                              e.jsx(Pr, { size: 14 }),
                              e.jsx("span", { children: "Restart" }),
                              e.jsx("kbd", { children: "Home" }),
                            ],
                          }),
                          a
                            ? e.jsxs("button", {
                                className: "pop-item",
                                onClick: () => {
                                  (f(!1), a());
                                },
                                children: [
                                  e.jsx(Kr, { size: 14 }),
                                  e.jsx("span", { children: "Export video" }),
                                ],
                              })
                            : null,
                        ],
                      })
                    : null,
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "deck-foot",
        children: [
          $
            ? e.jsx(Vi, { event: $, total: N })
            : e.jsx("div", {
                className: "readout-now",
                children: e.jsx("span", {
                  className: "readout-summary",
                  children: t
                    ? "No recorded activity for this agent."
                    : "Select a session to start the walk.",
                }),
              }),
          e.jsxs("div", {
            className: "deck-legend",
            "aria-hidden": !0,
            children: [
              e.jsx("span", {
                className: "legend-group",
                children: Yi.map((m) =>
                  e.jsxs(
                    "span",
                    {
                      className: "legend-item",
                      children: [e.jsx("span", { className: `action-dot ${m}` }), m],
                    },
                    m,
                  ),
                ),
              }),
              e.jsxs("span", {
                className: "legend-group",
                children: [
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [
                      e.jsx("span", { className: "legend-glyph compaction" }),
                      "compaction",
                    ],
                  }),
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [e.jsx("span", { className: "legend-glyph subagent" }), "subagent"],
                  }),
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [
                      e.jsx("span", { className: "legend-glyph user-message" }),
                      "user turn",
                    ],
                  }),
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [e.jsx("span", { className: "legend-glyph thinking" }), "thinking"],
                  }),
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [
                      e.jsx("span", { className: "legend-glyph finish-reason" }),
                      "turn ended",
                    ],
                  }),
                  e.jsxs("span", {
                    className: "legend-item",
                    children: [
                      e.jsx("span", { className: "legend-glyph model-switch" }),
                      "model switched",
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "sr-live",
        "aria-live": "polite",
        role: "status",
        children: $
          ? `Event ${L + 1} of ${N}: ${$.action} — ${$.tool}${$.summary ? `, ${$.summary}` : ""}`
          : "",
      }),
    ],
  });
}
function Ji(t) {
  const s = new Date(t);
  return Number.isNaN(s.getTime())
    ? ""
    : [s.getHours(), s.getMinutes(), s.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
}
function Qi(t) {
  switch (t) {
    case "running":
      return "The judge is reading the trace — about a minute";
    case "done":
      return "Evaluation ready";
    case "stale":
      return "Evaluation ready, but the session has grown since";
    case "failed":
      return "The last evaluation failed — open to retry";
    default:
      return "Evaluate this session with your local agent CLI";
  }
}
const qe = "__main__";
function eo() {
  const {
      sessions: t,
      activeSessionKey: s,
      trace: n,
      city: r,
      currentSeq: a,
      selectedPath: o,
      view: d,
      loading: c,
      error: u,
      hideEmpty: h,
      harnessFilter: v,
      railCollapsed: l,
      mapOnly: y,
      hudHidden: f,
      setView: j,
      setSessions: R,
      setActiveSession: I,
      setData: p,
      setCityOnly: H,
      setCurrentSeq: P,
      setSelectedPath: N,
      setLoading: T,
      setError: L,
      setHideEmpty: $,
      setHarnessFilter: W,
      setRailCollapsed: ee,
      setHudHidden: K,
    } = Ae(),
    C = i.useRef(!1),
    F = i.useRef(0),
    B = i.useRef(0),
    k = i.useRef(0),
    w = i.useRef(0),
    E = i.useRef(0),
    S = i.useRef(!1),
    _ = i.useRef(0),
    x = i.useRef(s);
  x.current = s;
  const D = i.useRef(null),
    [b, Z] = i.useState(!1),
    [ae, le] = i.useState(null),
    [V, U] = i.useState(null),
    [G, oe] = i.useState(!1),
    [ue, m] = i.useState(!1),
    [A, O] = i.useState(!1),
    [Y, de] = i.useState(),
    [J, te] = i.useState([]),
    [me, ge] = i.useState(),
    [Q, z] = i.useState(null),
    [X, se] = i.useState(!1),
    [he, fe] = i.useState(),
    [je, pe] = i.useState(),
    [Ne, we] = i.useState(),
    be = i.useRef(null),
    Me = i.useRef(void 0),
    Je = i.useRef(void 0),
    _e = i.useRef(void 0),
    Oe = i.useRef(new Map()),
    ze = i.useRef(new Map()),
    Ce = i.useRef(!1);
  Ce.current = b;
  const Ft = i.useCallback((g) => {
      D.current = g;
    }, []),
    He = i.useCallback(() => {
      (_.current++, T(!0));
    }, [T]),
    We = i.useCallback(() => {
      ((_.current = Math.max(0, _.current - 1)), _.current === 0 && T(!1));
    }, [T]),
    ct = i.useCallback(() => {
      const g = ++k.current;
      return (
        w.current++,
        E.current++,
        (be.current = null),
        (Me.current = void 0),
        (Je.current = void 0),
        (_e.current = void 0),
        Oe.current.clear(),
        ze.current.clear(),
        ge(void 0),
        z(null),
        se(!1),
        fe(void 0),
        pe(void 0),
        we(void 0),
        g
      );
    }, []),
    Pe = i.useCallback(async (g, M = k.current) => {
      const q = ++w.current;
      (se(!0), pe(void 0), we(void 0));
      try {
        const re = await Qr(g);
        if (M !== k.current || q !== w.current || x.current !== g) return;
        ge(re);
      } catch (re) {
        M === k.current &&
          q === w.current &&
          x.current === g &&
          (pe(Ie(re, "loading agents")), we(null));
      } finally {
        M === k.current && q === w.current && x.current === g && se(!1);
      }
    }, []),
    lt = i.useCallback(
      async (g) => {
        const M = ++B.current,
          q = k.current;
        (He(), L(void 0));
        try {
          const { trace: re, city: ne } = await Jr(g);
          if (M !== B.current || q !== k.current || x.current !== g) return;
          ((Je.current = re), (_e.current = ne), Oe.current.set(qe, re));
          const xe = be.current;
          if (xe === null) {
            p(re, ne);
            const ke = ze.current.get(qe);
            (ke !== void 0 && P(Math.min(ke, Math.max(0, re.events.length - 1))), N(void 0));
          } else {
            const ke = Oe.current.get(xe);
            if (ke) {
              const ve = Ae.getState().currentSeq;
              (p(ke, ne), P(Math.min(ve, Math.max(0, ke.events.length - 1))));
            }
          }
        } catch (re) {
          M === B.current && x.current === g && L(Ie(re, "loading the session"));
        } finally {
          We();
        }
      },
      [He, We, P, p, L, N],
    ),
    _t = i.useCallback(() => {
      const g = be.current;
      (ze.current.set(g ?? qe, Ae.getState().currentSeq),
        E.current++,
        (Me.current = void 0),
        Oe.current.clear(),
        (be.current = null),
        z(null),
        fe(void 0),
        pe(void 0),
        we(void 0));
      const M = Je.current,
        q = _e.current;
      if (M && q) {
        p(M, q);
        const re = ze.current.get(qe);
        (re !== void 0 && P(Math.min(re, Math.max(0, M.events.length - 1))), N(void 0));
      }
    }, [P, p, N]),
    kt = i.useCallback(
      async (g) => {
        const M = ++F.current;
        (He(), L(void 0));
        try {
          const q = await Zt(g);
          if (M !== F.current) return;
          R(q);
          let re;
          if (!C.current) {
            C.current = !0;
            const Ee = new URL(window.location.href).searchParams.get("session") ?? void 0,
              Ut = Ee ? q.find(($t) => $t.key === Ee) : void 0,
              Rt = Ee && !Ut ? q.filter(($t) => $t.id === Ee) : [],
              Kt = Ut?.key ?? (Rt.length === 1 ? Rt[0].key : void 0);
            Kt
              ? (re = Kt)
              : Rt.length > 1
                ? console.warn(
                    `session id "${Ee}" is ambiguous; falling back to the latest session`,
                  )
                : Ee &&
                  console.warn(`session "${Ee}" not found; falling back to the latest session`);
          }
          const ne = x.current,
            xe = ne !== void 0 && q.some((Ee) => Ee.key === ne),
            ke = (q.find((Ee) => nn(Ee, { hideEmpty: h, harness: v })) ?? q[0])?.key,
            ve = re ?? (xe ? ne : ke);
          if (ve !== ne) {
            const Ee = ct();
            ((x.current = ve), ve || B.current++, I(ve), ve && Pe(ve, Ee));
          } else g && ve && (_t(), Pe(ve));
          ve && (await lt(ve));
        } catch (q) {
          M === F.current && L(Ie(q, "scanning sessions"));
        } finally {
          We();
        }
      },
      [He, We, v, h, _t, Pe, lt, ct, I, L, R],
    ),
    ln = i.useCallback(
      async (g) => {
        (He(), L(void 0));
        try {
          const M = await aa(g);
          H(M);
        } catch (M) {
          L(Ie(M, "loading the repository map"));
        } finally {
          We();
        }
      },
      [He, We, H, L],
    ),
    dn = i.useCallback((g) => {
      const M = g ? `/?map=1&repo=${encodeURIComponent(g)}` : "/?map=1";
      window.open(M, "_blank", "noopener");
    }, []),
    un = i.useCallback(
      (g) => {
        if (x.current === g) return;
        const M = ct();
        ((x.current = g), I(g), Pe(g, M), lt(g));
      },
      [Pe, lt, ct, I],
    ),
    dt = i.useCallback(() => {
      const g = be.current ?? qe;
      ze.current.set(g, Ae.getState().currentSeq);
    }, []),
    Nt = i.useCallback(
      (g, M, q) => {
        (dt(), (be.current = g), z(g), p(M, q));
        const re = ze.current.get(g ?? qe);
        (re !== void 0 && P(Math.min(re, Math.max(0, M.events.length - 1))), N(void 0));
      },
      [dt, P, p, N],
    ),
    Mt = i.useCallback(
      async (g) => {
        if (Ce.current) return;
        const M = x.current,
          q = _e.current;
        if (!M || !q) return;
        const re = ++E.current;
        if (((Me.current = void 0), fe(void 0), pe(void 0), we(void 0), be.current === g)) return;
        const ne = g === null ? Je.current : Oe.current.get(g);
        if (ne) {
          Nt(g, ne, q);
          return;
        }
        if (g === null) return;
        const xe = me?.agents.find((ve) => ve.id === g);
        if (!xe || xe.traceAvailability !== "available") return;
        const ke = k.current;
        ((Me.current = g), fe(g));
        try {
          const ve = await ea(M, g);
          if (
            ke !== k.current ||
            re !== E.current ||
            Me.current !== g ||
            x.current !== M ||
            Ce.current
          )
            return;
          (Oe.current.set(g, ve), Nt(g, ve, _e.current ?? q));
        } catch (ve) {
          ke === k.current &&
            re === E.current &&
            Me.current === g &&
            x.current === M &&
            (pe(Ie(ve, `loading the ${xe.label} trace`)), we(g));
        } finally {
          ke === k.current &&
            re === E.current &&
            Me.current === g &&
            x.current === M &&
            ((Me.current = void 0), fe(void 0));
        }
      },
      [me, Nt],
    ),
    hn = i.useCallback(() => {
      const g = x.current;
      Ce.current || !g || Ne === void 0 || (Ne === null ? Pe(g) : Mt(Ne));
    }, [Ne, Pe, Mt]),
    pn = i.useCallback(async () => {
      const g = D.current,
        M = n?.events.length ?? 0;
      if (!g || M === 0 || Ce.current) return;
      const q = x.current,
        re = be.current,
        ne = Ae.getState().currentSeq;
      (E.current++, (Me.current = void 0), fe(void 0), (Ce.current = !0), Z(!0), L(void 0));
      try {
        const { blob: xe, extension: ke } = await Ua({ canvas: g, total: M, setSeq: P }),
          ve = n?.session.id || q || "session";
        Ka(xe, `mindwalk-${ve}.${ke}`);
      } catch (xe) {
        L(Ie(xe, "exporting the video"));
      } finally {
        (x.current === q && be.current === re && P(ne), (Ce.current = !1), Z(!1));
      }
    }, [n, b, P, L]),
    fn = i.useCallback(() => ee(!0), [ee]),
    mn = i.useCallback(() => ee(!1), [ee]),
    Ue = i.useCallback(async (g) => {
      try {
        const M = await ta(g);
        x.current === g && de(M);
      } catch {}
    }, []);
  i.useEffect(() => {
    (le(null), U(null), de(void 0), te([]), s && !y && Ue(s));
  }, [s, y, Ue]);
  const Te = i.useCallback(async () => {
      try {
        R(await Zt());
      } catch {}
    }, [R]),
    gn = i.useCallback(() => {
      if (Ce.current || S.current) return;
      S.current = !0;
      const g = x.current;
      (g && !y && Ue(g),
        kt(!0).finally(() => {
          S.current = !1;
        }));
    }, [kt, Ue, y]);
  (i.useEffect(() => {
    if (Y?.state !== "running" || !s) return;
    te([]);
    const g = ra(
        s,
        (q) => te((re) => [...re, q]),
        (q) => {
          (x.current === s && de(q), g.close());
        },
      ),
      M = setInterval(() => {
        Te();
      }, 5e3);
    return () => {
      (g.close(), clearInterval(M), Te());
    };
  }, [Y?.state, s, Te]),
    i.useEffect(() => {
      if (Y !== void 0 || !s || y) return;
      const g = setInterval(() => {
        Ue(s);
      }, 5e3);
      return () => clearInterval(g);
    }, [Y === void 0, s, y, Ue]));
  const Ot = i.useMemo(() => t.some((g) => g.reportState === "running"), [t]);
  i.useEffect(() => {
    if (!Ot || Y?.state === "running") return;
    const g = setInterval(() => {
      Te();
    }, 5e3);
    return () => clearInterval(g);
  }, [Ot, Y?.state, Te]);
  const xn = i.useCallback(
      async (g) => {
        const M = x.current;
        if (M)
          try {
            const q = await sa(M, g);
            (x.current === M && de(q), Te());
          } catch (q) {
            L(Ie(q, "starting the evaluation"));
          }
      },
      [L, Te],
    ),
    Ke = i.useCallback(
      (g) => {
        (N(g), g && le("inspect"));
      },
      [N],
    ),
    Et = i.useCallback(() => le(null), []),
    vn = i.useCallback(() => U(null), []),
    yn = i.useCallback(() => {
      window.dispatchEvent(new CustomEvent("mindwalk:zoom-to-fit"));
    }, []),
    wn = i.useCallback(() => {
      const { trace: g, city: M } = ca();
      (p(g, M), I(void 0));
    }, [p, I]),
    bn = i.useCallback(() => {
      Ce.current || le("agents");
    }, []),
    jn = i.useCallback((g) => {
      g.presentation === "sheet"
        ? le((M) => (M === g.id ? null : g.id))
        : U((M) => (M === g.id ? null : g.id));
    }, []),
    kn = i.useCallback(
      (g) => {
        if (Ce.current) return;
        const M = Je.current,
          q = _e.current;
        if (!M || !q) return;
        (E.current++,
          (Me.current = void 0),
          fe(void 0),
          be.current !== null && (dt(), (be.current = null), z(null), p(M, q)),
          P(g),
          ze.current.set(qe, g));
        const ne = M.events[g]?.targets.find((xe) => xe.path)?.path;
        N(ne);
      },
      [dt, P, p, N],
    ),
    Nn = i.useCallback(
      (g) => {
        (P(g), le("agents"));
      },
      [P],
    ),
    Mn = i.useCallback(
      (g) => {
        Ce.current || P(g);
      },
      [P],
    );
  (i.useEffect(() => {
    const g = (M) => {
      if (M.key.toLowerCase() !== "b" || !(M.metaKey || M.ctrlKey) || M.altKey || M.shiftKey)
        return;
      M.preventDefault();
      const q = Ae.getState();
      q.setRailCollapsed(!q.railCollapsed);
    };
    return (window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g));
  }, []),
    i.useEffect(() => {
      const g = (M) => {
        if (M.key.toLowerCase() !== "v" || M.metaKey || M.ctrlKey || M.altKey || M.shiftKey) return;
        const q = M.target;
        if (
          (q && (q.tagName === "INPUT" || q.tagName === "TEXTAREA" || q.isContentEditable)) ||
          Ce.current
        )
          return;
        const re = Ae.getState();
        re.setView(re.view === "tree" ? "terrain" : "tree");
      };
      return (
        window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g)
      );
    }, []),
    i.useEffect(() => {
      const g = (ne) => {
          const xe = ne;
          return (
            !!xe && (xe.tagName === "INPUT" || xe.tagName === "TEXTAREA" || xe.isContentEditable)
          );
        },
        M = (ne) => {
          ne.key.toLowerCase() !== "p" ||
            !(ne.metaKey || ne.ctrlKey) ||
            ne.altKey ||
            ne.shiftKey ||
            (ne.preventDefault(), oe(!0));
        },
        q = (ne) => {
          ne.key !== "?" ||
            ne.metaKey ||
            ne.ctrlKey ||
            ne.altKey ||
            g(ne.target) ||
            (ne.preventDefault(), m((xe) => !xe));
        },
        re = (ne) => {
          if (
            ne.key.toLowerCase() !== "h" ||
            ne.metaKey ||
            ne.ctrlKey ||
            ne.altKey ||
            ne.shiftKey ||
            g(ne.target)
          )
            return;
          const xe = Ae.getState();
          xe.setHudHidden(!xe.hudHidden);
        };
      return (
        window.addEventListener("keydown", M),
        window.addEventListener("keydown", q),
        window.addEventListener("keydown", re),
        () => {
          (window.removeEventListener("keydown", M),
            window.removeEventListener("keydown", q),
            window.removeEventListener("keydown", re));
        }
      );
    }, []),
    i.useEffect(() => {
      const g = new URL(window.location.href).searchParams;
      g.get("map") === "1" ? ln(g.get("repo") ?? void 0) : kt(!1);
    }, []));
  const Ct = i.useMemo(
      () =>
        Y?.state === "running"
          ? "running"
          : Y?.state === "failed"
            ? "failed"
            : Y?.state === "done"
              ? Y.stale
                ? "stale"
                : "done"
              : null,
      [Y],
    ),
    Ht = i.useMemo(
      () => (Q === null ? "Main" : (me?.agents.find((g) => g.id === Q)?.label ?? "Subagent")),
      [Q, me],
    ),
    En =
      d === "tree"
        ? n
          ? "glow ∝ revisits"
          : "static map"
        : n
          ? "height ∝ depth × revisits"
          : "height ∝ lines",
    Cn = i.useMemo(() => {
      const g = new Map();
      if (!n) return g;
      for (const M of n.events)
        if (M.action === "edit") for (const q of M.targets) g.set(q.path, (g.get(q.path) ?? 0) + 1);
      return g;
    }, [n]),
    Wt = i.useMemo(() => new Da(n, r), [n, r]),
    Se = i.useMemo(() => Wt.snapshotAt(a), [Wt, a]),
    St = i.useMemo(() => {
      let g = 0,
        M = 0,
        q = 0;
      for (const re of Se.touchByPath.values()) re === "edit" ? g++ : re === "read" ? M++ : q++;
      return { edited: g, read: M, seen: q };
    }, [Se]),
    Qe = i.useMemo(() => (o ? r?.files.find((g) => g.path === o) : void 0), [r, o]),
    Sn = i.useMemo(() => {
      const g = new Map();
      for (const M of n?.events ?? [])
        for (const q of M.targets)
          q.touch === "edit" && q.path && g.set(q.path, (g.get(q.path) ?? 0) + 1);
      return [...g.entries()]
        .filter(([, M]) => M >= 3)
        .map(([M, q]) => ({ path: M, edits: q }))
        .sort((M, q) => q.edits - M.edits || (M.path < q.path ? -1 : 1));
    }, [n]);
  return e.jsxs("main", {
    className: y || l ? "app-frame rail-collapsed" : "app-frame",
    children: [
      y
        ? null
        : e.jsx(Oi, {
            sessions: t,
            activeKey: s,
            loading: c,
            hideEmpty: h,
            harnessFilter: v,
            collapsed: l,
            onSelect: un,
            onRefresh: gn,
            onHideEmptyChange: $,
            onHarnessFilterChange: W,
            onCollapse: fn,
            onOpenMap: dn,
            activeRepo: n?.session.cwd,
            locked: b,
            activeReportState: Y === void 0 ? void 0 : Ct,
          }),
      e.jsxs("section", {
        className: "stage",
        children: [
          e.jsxs("div", {
            className: "viewport",
            children: [
              !y && l
                ? e.jsx("button", {
                    className: "rail-expand",
                    onClick: mn,
                    title: `Show sidebar (${cn})`,
                    "aria-label": "Show session sidebar",
                    children: e.jsx(Mr, { size: 15 }),
                  })
                : null,
              r
                ? e.jsx("button", {
                    className: "zoom-fit-btn",
                    onClick: yn,
                    title: "Recenter the map (zoom to fit)",
                    "aria-label": "Recenter the map",
                    children: e.jsx(wr, { size: 15 }),
                  })
                : null,
              !os() && r
                ? e.jsx(gi, { city: r, playback: Se, selectedPath: o, onSelect: Ke })
                : d === "tree"
                  ? e.jsx(fi, {
                      city: r,
                      playback: Se,
                      selectedPath: o,
                      onSelect: Ke,
                      onCanvasReady: Ft,
                    })
                  : e.jsx(ri, {
                      city: r,
                      playback: Se,
                      selectedPath: o,
                      onSelect: Ke,
                      onCanvasReady: Ft,
                      locHeights: y,
                    }),
              r && os() && !f
                ? e.jsx(Di, {
                    city: r,
                    playback: Se,
                    selectedPath: o,
                    onSelect: Ke,
                    heatMode: A,
                    editCounts: Cn,
                  })
                : null,
              f
                ? null
                : e.jsx(Mi, {
                    trace: n,
                    city: r,
                    agentLabel: Ht,
                    editedNow: St.edited,
                    readNow: St.read,
                    seenNow: St.seen,
                    churn: Sn,
                    onSelectFile: Ke,
                    onOpenAgents: !y && n ? bn : void 0,
                    locked: b,
                  }),
              r
                ? e.jsx(la, {
                    panels: [
                      {
                        id: "view",
                        icon: d === "tree" ? qs : Is,
                        hint: `Scene view: ${d} — click to change, or press V`,
                        section: "scene",
                        presentation: "pop",
                        render: () =>
                          e.jsx(Ba, {
                            view: d,
                            onViewChange: j,
                            note: En,
                            locked: b,
                            heatMode: A,
                            onHeatModeChange: O,
                          }),
                      },
                      {
                        id: "inspect",
                        icon: sr,
                        hint: "Inspect the selected file",
                        section: "session",
                        presentation: "sheet",
                        render: () =>
                          e.jsx(Li, {
                            file: Qe,
                            touch: Qe ? Se.touchByPath.get(Qe.path) : void 0,
                            history: Qe ? (Se.historyByPath.get(Qe.path) ?? []) : [],
                            onClose: Et,
                            onJumpTo: Mn,
                            locked: b,
                            currentSeq: a,
                            total: n?.events.length ?? 0,
                          }),
                      },
                      ...(!y && n
                        ? [
                            {
                              id: "events",
                              icon: xr,
                              hint: "Event list — browse and jump to any event",
                              section: "session",
                              presentation: "sheet",
                              render: () =>
                                e.jsx(wa, { trace: n, currentSeq: a, onChange: P, locked: b }),
                            },
                          ]
                        : []),
                      ...(!y && n
                        ? [
                            {
                              id: "agents",
                              icon: Wr,
                              hint: `Agent lenses — current: ${Ht}`,
                              section: "session",
                              presentation: "sheet",
                              render: () =>
                                e.jsx(da, {
                                  graph: me,
                                  current: Q,
                                  loading: X,
                                  loadingAgentID: he,
                                  locked: b,
                                  error: je,
                                  retryAgentID: Ne,
                                  onSelect: (g) => {
                                    Mt(g);
                                  },
                                  onRetry: hn,
                                  onClose: Et,
                                }),
                            },
                          ]
                        : []),
                      ...(!y && n
                        ? [
                            {
                              id: "evaluate",
                              icon: Bs,
                              hint: Qi(Ct),
                              section: "session",
                              presentation: "sheet",
                              badge: Ct,
                              render: () =>
                                e.jsx(ka, {
                                  status: Y,
                                  analyzing: Y?.state === "running",
                                  progress: J,
                                  locked: b,
                                  onAnalyze: (g) => {
                                    xn(g);
                                  },
                                  onClose: Et,
                                  onJumpTo: kn,
                                }),
                            },
                          ]
                        : []),
                    ],
                    openSheet: ae,
                    openPop: V,
                    onToggle: jn,
                    onClosePop: vn,
                  })
                : null,
              !y && !c && t.length === 0 && !n
                ? e.jsx("div", {
                    className: "empty-stage",
                    children: e.jsxs("div", {
                      className: "card",
                      children: [
                        e.jsx("h2", { children: "No sessions found" }),
                        e.jsxs("p", {
                          children: [
                            "mindwalk scans ",
                            e.jsx("code", { children: "~/.claude/projects" }),
                            ", ",
                            e.jsx("code", { children: "~/.codex/sessions" }),
                            ", and ",
                            e.jsx("code", { children: "~/.pi/agent/sessions" }),
                            " for agent traces. Run a session there, then refresh.",
                          ],
                        }),
                        e.jsx("button", {
                          className: "demo-btn",
                          onClick: wn,
                          children: "Try a demo session →",
                        }),
                      ],
                    }),
                  })
                : null,
              c
                ? e.jsx("div", {
                    className: "toast",
                    children: y
                      ? "Building the map…"
                      : t.length === 0
                        ? "Scanning sessions…"
                        : "Reading trace…",
                  })
                : null,
              u ? e.jsx("div", { className: "toast error", children: u }) : null,
            ],
          }),
          e.jsx(Zi, {
            trace: n,
            currentSeq: a,
            onChange: P,
            onExport: Us() ? pn : void 0,
            exporting: b,
            onSubagentMark: Nn,
          }),
        ],
      }),
      G && r
        ? e.jsx(va, {
            files: r.files,
            touchByPath: Se.touchByPath,
            onSelect: Ke,
            onClose: () => oe(!1),
          })
        : null,
      ue ? e.jsx(ga, { onClose: () => m(!1) }) : null,
    ],
  });
}
$n.createRoot(document.getElementById("root")).render(
  e.jsx(i.StrictMode, { children: e.jsx(eo, {}) }),
);
//# sourceMappingURL=index-BUUsOljy.js.map
