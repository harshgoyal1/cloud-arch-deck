// Network and data path: the slide a customer's security team actually reviews.
//
//   python ../scripts/icons.py azure Firewalls Application_Gateways Private_Link Virtual_Machine Azure_Active_Directory Key_Vaults
//   python ../scripts/icons.py oss kubernetes postgresql
//   node 02_network.js
const pptx = require("pptxgenjs");
const kit = require("../scripts/deck_kit.js");

const p = new pptx(); p.layout = "LAYOUT_WIDE";
const k = kit.bind(p, { logo: "../assets/logo/ink.png" });
const AZ = n => `icons/azure/png/${n}.png`;
const OSS = n => `icons/oss/png/${n}.png`;
const t = k.t;

const s = k.frame({
  title: "Order platform · network, security and data path",
  badge: "AZURE",
  sub: "Every hop private · no public IP on any workload · one inspected egress · region west-europe, paired north-europe",
});

// consumer, edge, then the network itself
k.box(s, { x: 0.32, y: 0.92, w: 1.8, h: 1.5, fill: t.tint, line: t.rule });
k.txt(s, "Users", { x: 0.42, y: 1.0, w: 1.6, h: 0.2, fs: 7.4, b: true, c: t.ink });
k.txt(s, "Staff and partners\nBrowser over the corporate\nnetwork, MFA enforced",
  { x: 0.42, y: 1.24, w: 1.6, h: 0.8, fs: 5.9, c: t.muted, ls: 7.6, v: "top" });
k.arrow(s, 2.14, 1.66, 2.44, 1.66);

k.box(s, { x: 2.46, y: 0.92, w: 1.9, h: 1.5, fill: t.white, line: t.brand, lw: 1.1 });
k.txt(s, "Edge", { x: 2.56, y: 1.0, w: 1.7, h: 0.2, fs: 7.4, b: true, c: t.brand });
[[AZ("Application_Gateways"), "App Gateway WAF", "OWASP, TLS 1.2+"],
 [AZ("Firewalls"), "Azure Firewall", "egress inspection"]].forEach(([ic, title, sub], i) => {
  k.icon(s, ic, 2.58, 1.28 + i * 0.5, 0.2);
  k.txt(s, title, { x: 2.84, y: 1.27 + i * 0.5, w: 1.44, h: 0.18, fs: 6.4, b: true, c: t.ink });
  k.txt(s, sub, { x: 2.84, y: 1.44 + i * 0.5, w: 1.44, h: 0.18, fs: 5.6, c: t.muted });
});
k.arrow(s, 4.38, 1.66, 4.68, 1.66);

k.vnet(s, 4.7, 0.92, 8.31, 2.76, "vnet-platform  ·  10.60.0.0/16  ·  UDR 0.0.0.0/0 → firewall");
[["snet-app  10.60.1.0/23", OSS("kubernetes"), "Workload cluster", "services, HPA on queue depth"],
 ["snet-data  10.60.3.0/24", OSS("postgresql"), "Managed database", "primary + replica, no public access"],
 ["snet-pe  10.60.4.0/24", AZ("Private_Link"), "Private endpoints", "key vault, storage, monitoring"],
 ["AzureFirewallSubnet", AZ("Firewalls"), "Egress", "single inspected path"],
 ["GatewaySubnet", AZ("Virtual_Machine"), "Hybrid", "site-to-site to the datacentre"],
 ["snet-admin  10.60.7.0/24", AZ("Key_Vaults"), "Break-glass", "just-in-time, audited"],
].forEach(([label, icon, title, sub], i) => {
  k.subnet(s, 4.86 + (i % 3) * 2.67, 1.14 + Math.floor(i / 3) * 1.24, 2.55, 1.12,
    { label, icon, t: title, sub });
});

k.box(s, { x: 0.32, y: 2.6, w: 4.04, h: 1.94, fill: t.paper, line: t.rule });
k.txt(s, "IDENTITY, SECRETS AND SUPPLY CHAIN", { x: 0.42, y: 2.68, w: 3.8, h: 0.2, fs: 6.6, b: true, c: t.brand, cs: 0.6 });
[[AZ("Azure_Active_Directory"), "Entra ID", "user auth, MFA, group claims"],
 [AZ("Key_Vaults"), "Key Vault", "secrets, certificates, rotation"],
 [null, "Workload identity", "federated, no stored credentials"],
 [null, "Signed images", "admission policy on every deploy"],
].forEach(([icon, title, sub], i) => {
  const y = 2.92 + i * 0.4;
  if (icon) k.icon(s, icon, 0.44, y + 0.02, 0.2);
  k.txt(s, title, { x: 0.7, y, w: 3.5, h: 0.18, fs: 6.4, b: true, c: t.ink });
  k.txt(s, sub, { x: 0.7, y: y + 0.17, w: 3.55, h: 0.2, fs: 5.6, c: t.muted });
});

[["Data boundary", "Records stay inside snet-data behind a private endpoint. Nothing leaves the subscription.", t.ok],
 ["Retention and audit", "Access, changes and admin actions land in the customer's own log estate.", t.ok],
 ["DR position", "Geo-replicated backup, paired-region restore, rehearsed quarterly.", t.warn],
 ["The permanent work", "Patch cadence, certificate renewal and an on-call rota someone has to own.", t.bad],
].forEach(([title, body, colour], i) => {
  const x = 0.32 + i * 3.2;
  k.box(s, { x, y: 4.72, w: 3.06, h: 1.18, fill: t.white, line: t.rule });
  k.rect(s, x, 4.72, 3.06, 0.05, colour);
  k.txt(s, title, { x: x + 0.12, y: 4.84, w: 2.8, h: 0.2, fs: 7.2, b: true, c: t.ink });
  k.txt(s, body, { x: x + 0.12, y: 5.06, w: 2.82, h: 0.8, fs: 5.9, c: t.body, ls: 7.6, v: "top" });
});

k.connLegend(s, 6.08, [[t.brand, "request path", false, 2.0], [t.peer, "network peering", true, 2.2],
                       [t.ink, "hybrid link", true, 2.0]]);
k.flowLegend(s, 6.34, ["browser + MFA", "WAF", "workload", "private endpoint", "database", "response"]);
k.save("out/02-network.pptx");
