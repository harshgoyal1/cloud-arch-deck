# Conventions — palette, geometry, defaults, known defects

## Palette

The kit ships a neutral default. Swap the hex values in `deck_kit.js`
`DEFAULT_THEME`, or pass `{ theme: {...} }` to `bind()`, and everything follows.

| Token | Default | Role |
|---|---|---|
| `ink` | `0F172A` | Headings, container labels, table headers, dark grounds |
| `brand` | `2563EB` | The single interactive accent: rules, connectors, step numbers |
| `spark` | `0EA5E9` | Rationed: kickers, top rule, live dots. One element per view |
| `paper` / `white` | `F8FAFC` / `FFFFFF` | Reading ground / cards and panels |
| `tint` | `EFF4FF` | Tinted fills, alternating table rows, step boxes |
| `rule` | `DDE3ED` | Every hairline |
| `body` / `muted` | `1F2937` / `64748B` | Body text / captions and secondary notes |
| `ok` / `okBg` | `15803D` / `E7F3EA` | Measured, live, in place, safe |
| `warn` / `warnBg` | `B45309` / `FBF0DE` | Inferred, roadmap, watch item |
| `bad` / `badBg` | `B91C1C` / `FBE9E9` | Missing, gap, the thing that fails |
| `console` | `111827` | Dark ground for dividers — deep slate, never pure black |
| VNet / subnet line | `2B6CB0` / `94A3B8` | Network boxes; subnets dashed |
| Peering green | `15803D` | VNet/VPC peering connectors only |

Teal and amber are supporting tones. Never introduce a fourth accent.

## Slide geometry — 13.333 × 7.5 in

- Margin `0.55`. Architecture frames use `0.32` to buy width.
- Diagram slide titles are **19–21 pt**, not 36 — a dense architecture needs the space.
- Body 8.4–10 pt; captions 5.6–7 pt; mono for machine values (CIDRs, SKUs, counts).
- Containers at least `0.12` apart. Connector labels sit **beside** the line, not above.
- Row rhythm that works for a five-row architecture: groups at `0.92 / 1.94 / 2.96 /
  3.98 / 5.00`, each `0.86` high, provider band at `6.06`, flow legend `6.62`,
  trade-off line `6.88`.
- Side rails must stop **above** the provider band. A rail of `h 5.0` from `y 0.92`
  clears a band at `6.06`; `5.62` does not.

## Network defaults

| Azure | AWS |
|---|---|
| Hub `10.10.0.0/16`, spoke `10.20.0.0/16` | VPC `10.0.0.0/16` |
| `GatewaySubnet` /27, `AzureFirewallSubnet` /26, `AzureBastionSubnet` /26 | public /24 per AZ, private /23 per AZ |
| `snet-pe` /24 private endpoints, `snet-workload` /24 | `sn-app`, `sn-data`, VPC endpoints |
| UDR `0.0.0.0/0` → Azure Firewall, one inspected egress | route table → NAT/firewall, one inspected egress |
| Private endpoint **plus** the private DNS zone | VPC endpoint **plus** the endpoint policy |

The forgotten half is always DNS: a private endpoint without its zone link is the most
common reason a "private" design does not resolve.

## Controls to state on the diagram

- Managed identity / IAM role only — no keys, SAS or static credentials
- Public network access disabled on every managed service
- Customer-managed keys where policy requires; TLS 1.2+
- Least privilege via groups plus just-in-time elevation
- IaC and policy as code; CI/CD with federated identity
- Immutable audit to the customer's own log estate
- Backup immutability and a restore that has been tested, not assumed

## Comparison slides

Same row spine on both approaches. Same numbered path, worded identically. Put the
honest trade-off on both — the option with no stated cost reads as a sales pitch.

## Known defects

Every one of these shipped at least once and was caught by rendering, not by review.

| Symptom | Cause | Fix |
|---|---|---|
| Label renders one character per line, vertically | Label box width computed as `w - 2.0` on a narrow container | Clamp: `Math.max(w - (chip ? chipw + 0.5 : 0.42), 1.2)` |
| Container half empty | Height set by eye, content needs a third of it | Size the box from its content, then re-render |
| Band label wraps into its own icon row | Label longer than its reserved width | Shorten the label; do not shrink the font |
| Page number sits on the wordmark | Both right-aligned to the same edge | Offset the wordmark left by ~0.35 |
| Connector appears to join the wrong box | Drawn from a coordinate that sits under a neighbour | Anchor connectors to the source container's own edge |
| Arrow runs off the slide | Helper called with the wrong argument count | Check the signature; `ingress(s, x, y1, y2, host)` takes four coordinates, not five |
| Table wider than the slide | Column widths sum past `W - 2*M` | Sum the widths before drawing; `grid` returns its bottom edge — use it |
| Logo invisible | White-on-transparent artwork on a white slide | `brand_logo.py`, tint per ground |
| "Existing" blocks look empty | Grey fill plus desaturated icons | Solid second colour, full-colour icons |
| Overlapping note and card | Note placed into a cell a later loop also fills | Place notes in a reserved cell, not in whitespace |

## Review checklist

- [ ] Every container maps to something the customer's IaC creates
- [ ] Subnets named as they will really be named, with CIDRs
- [ ] Tenant-level SaaS outside every VNet/VPC, with private connectivity noted
- [ ] Identity and secrets shown per workload container
- [ ] Governance band present on estate views
- [ ] Scope colour-coded, with a legend, and grey not used for "existing"
- [ ] Numbered steps plus a one-line flow legend
- [ ] No connector crossing text; no text crossing a border
- [ ] Region and model/SKU claims verified against vendor documentation
- [ ] Rendered and inspected at full size, every slide
