---
name: cloud-arch-deck
description: Generate architecture diagrams and capability decks as editable PowerPoint, for Azure, AWS and open-source stacks. Use whenever someone asks for an architecture diagram, solution architecture, target-state architecture, landing zone, reference architecture, HLD/LLD visual, network topology, AI/RAG architecture, a comparison of two solution approaches, an architecture slide, or a capability or product deck. Also use when they share an architecture image and ask to redraw, extend, harden or restyle it. Default to this skill for any customer-facing architecture visual, even when the requester does not mention style.
---

# Architecture diagrams and decks

Produce visuals that survive review by a customer's platform, network and security team.
Three icon sets, one layout language, delivered as editable PowerPoint.

## Deliverable format — always PPTX

**Deliver a `.pptx`. Every time.** Native editable shapes via `scripts/deck_kit.js` —
never a picture of a diagram pasted onto a slide. The audience presents from PowerPoint
and edits in PowerPoint, so a PNG-only answer is a failed answer even when the request
says "diagram", "draw" or "show me". PNG, SVG or `.drawio` only when explicitly named,
and then in addition, not instead.

## Before you draw

1. **Read the brief for the constraints, not the components.** Region, data residency,
   compliance regime, existing estate, who operates it, and what must not change. These
   decide the diagram; the service list is downstream.
2. **Fetch the icons you need.** `--list` first — never guess a name, never hand-draw a
   logo, never substitute a similar vendor's mark.
3. **Verify anything that could block procurement** — model or service availability in
   the target region, GPU SKU availability, sovereign-cloud support. A wrong region claim
   is found by the customer's architect, not by you.

## Icons

```bash
python scripts/icons.py --list bedrock          # search Azure, AWS and OSS at once
python scripts/icons.py azure Firewalls Key_Vaults Virtual_Networks --grey
python scripts/icons.py aws AmazonBedrock AWSLambda AmazonVPCEndpoints
python scripts/icons.py oss kubernetes postgresql grafana kong
```

AWS uses full service names — `AmazonSimpleStorageService`, not `AmazonS3`. When no
official mark exists, use a **wordmark tile** (`k.tile` with `mark:`), not a lookalike.

## Non-negotiable conventions

`references/conventions.md` holds the palette, geometry and spacing. The rules that get a
diagram rejected if broken:

1. **Organise by the customer's own boundary** — resource group, account, VPC, namespace.
   Each container should map to something their IaC actually creates.
2. **Draw networking, never annotate it.** Network boundaries as bordered boxes with the
   CIDR in the label; subnets as dashed boxes with their real names.
3. **Draw every link, with a label** — peering, hybrid entry, ingress, east-west. A
   reviewer must be able to trace a request without reading a bullet list. Finish with
   `connLegend` so the line colours mean something.
4. **Number the request path.** Circled numbers on components plus a one-line flow legend,
   so the diagram can be walked 1→n in a meeting.
5. **Colour-code scope, and never use grey for "existing".** Grey plus desaturated icons
   reads as *empty*, not as context. Use a solid second colour with full-colour icons for
   what exists, the brand colour for what is being built, and keep grey-dashed for
   genuinely out-of-scope.
6. **Identity and secrets on every workload container** — what identity it runs as, where
   secrets live, and what is explicitly not held.
7. **Governance band along the foot** on estate views: identity, privileged access,
   policy, posture, logging, keys, IaC, evidence.
8. **State the trade-off.** Every approach slide ends with one honest line about what the
   customer takes on by choosing it. This is what buys technical trust.

## Comparing two approaches

Use the **same row spine on both slides** — channels, services, gateway, shared
foundation, data — so the customer can diff them row by row. Same numbered path, worded
identically, on both. Differences should come from the components, not the layout.

## Stack from returned edges

`grid()`, `card()`, `band()`, `steps()`, `versus()` and `providerBand()` return the y they
finished at. Use it. Guessing the next y is how blocks silently overlap after an edit.

## Render and inspect — not optional

```bash
./scripts/render.sh out/deck.pptx        # prints a temp directory of slide images
```

**Then look at every slide.** Generating a deck is not the same as looking at one. Every
entry in the known-defects table was found this way, never by reading the code.

## Files

| Path | What |
|---|---|
| `scripts/icons.py` | One entry point for Azure, AWS and open-source icons |
| `scripts/deck_kit.js` | Slide shells, layout blocks, architecture primitives |
| `scripts/brand_logo.py` | Tint a transparent wordmark for light and dark grounds |
| `scripts/render.sh` | Render a pptx to page images |
| `references/conventions.md` | Palette, geometry, network defaults, known defects, checklist |
| `examples/` | Architecture slide, network slide, three-slide deck |
