#!/usr/bin/env python3
"""Architecture icons for Azure, AWS and open source, behind one command.

    python icons.py --list bedrock            # search all three catalogues
    python icons.py azure Firewalls Key_Vaults Virtual_Networks
    python icons.py aws AmazonBedrock AWSLambda AmazonVPCEndpoints
    python icons.py oss kubernetes postgresql grafana
    python icons.py --grey azure Firewalls    # also write a desaturated variant

Writes, relative to the working directory:

    icons/azure/png/<Name>.png      icons/azure/grey/<Name>.png
    icons/aws/png/<Name>.png        icons/aws/grey/<Name>.png
    icons/oss/png/<slug>.png        icons/oss/grey/<slug>.png

Nothing is vendored. Artwork is fetched on first use and cached, so this repository
carries no third-party icons and no vendor's terms travel with it. See NOTICE.md
before a diagram leaves your building.

Requires: rsvg-convert (brew install librsvg / apt install librsvg2-bin), and npm on
PATH for the AWS and open-source sets.
"""
import argparse, json, os, re, shutil, subprocess, sys, pathlib, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
CACHE = pathlib.Path(os.environ.get("ARCH_ICON_CACHE", HERE.parent / ".icon-cache"))
OUT = pathlib.Path("icons")
UA = {"User-Agent": "cloud-arch-deck"}

# The Azure architecture icon artwork mirrored in the drawio shape library.
AZURE_TREE = "https://api.github.com/repos/jgraph/drawio/git/trees/dev?recursive=1"
AZURE_RAW = "https://raw.githubusercontent.com/jgraph/drawio/dev/"
AZURE_DIR = "/azure2/"


def die(msg):
    sys.exit(msg)


def need(binary, hint):
    if not shutil.which(binary):
        die(f"{binary} not found. {hint}")


def http(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()


def npm_pkg(name):
    """Install a package into the shared cache once; return its directory."""
    CACHE.mkdir(parents=True, exist_ok=True)
    d = CACHE / "node_modules" / name
    if not d.exists():
        need("npm", f"It is needed to fetch the {name} icon set.")
        print(f"fetching {name} ...")
        subprocess.run(["npm", "install", name, "--no-audit", "--no-fund", "--silent"],
                       cwd=CACHE, check=True)
    return d


def rasterise(svg_text, png_path, size=256, fill=None, desaturate=False):
    if fill:
        svg_text = re.sub(r"<svg ", f'<svg fill="{fill}" ', svg_text, count=1)
    if desaturate:
        m = re.search(r"<svg[^>]*>", svg_text)
        inner = svg_text[m.end():]
        inner = inner[:inner.rindex("</svg>")]
        svg_text = (svg_text[:m.end()]
                    + '<filter id="d"><feColorMatrix type="saturate" values="0.07"/></filter>'
                    + '<g filter="url(#d)" opacity="0.72">' + inner + "</g></svg>")
    png_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = png_path.with_suffix(".tmp.svg")
    tmp.write_text(svg_text)
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), "-o", str(png_path), str(tmp)],
                   check=True, capture_output=True)
    tmp.unlink()


# ---------------------------------------------------------------- catalogues
def azure_catalogue():
    """Icon name -> repository path. Built from the upstream tree, cached locally."""
    cache = CACHE / "azure_catalogue.json"
    if cache.exists():
        return json.loads(cache.read_text())
    print("building the Azure catalogue ...")
    tree = json.loads(http(AZURE_TREE))["tree"]
    cat = {}
    for node in tree:
        p = node.get("path", "")
        if AZURE_DIR in p and p.endswith(".svg"):
            cat[pathlib.Path(p).stem] = p
    CACHE.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(cat, indent=0, sort_keys=True))
    print(f"  {len(cat)} Azure icons catalogued")
    return cat


def aws_catalogue():
    d = npm_pkg("aws-icons") / "icons"
    return {p.stem: p for p in d.rglob("*.svg")}


def oss_catalogue():
    d = npm_pkg("simple-icons")
    data = json.loads((d / "data" / "simple-icons.json").read_text())
    icons = data.get("icons", data) if isinstance(data, dict) else data
    out = {}
    for it in icons:
        title = it.get("title", "")
        slug = it.get("slug") or re.sub(r"[^a-z0-9]", "", title.lower())
        out[slug] = (title, it.get("hex", "333333"))
    return out


# ---------------------------------------------------------------- fetchers
def do_azure(names, grey):
    cat = azure_catalogue()
    for n in names:
        path = cat.get(n)
        if not path:
            near = [k for k in cat if n.lower() in k.lower()][:4]
            print(f"  NOT FOUND (azure): {n}" + (f"   did you mean: {', '.join(near)}" if near else ""))
            continue
        svg = http(AZURE_RAW + path).decode("utf-8", "replace")
        rasterise(svg, OUT / "azure" / "png" / f"{n}.png")
        if grey:
            rasterise(svg, OUT / "azure" / "grey" / f"{n}.png", desaturate=True)
        print(f"  azure  {n}")


def do_aws(names, grey):
    cat = aws_catalogue()
    index = {k.lower(): v for k, v in cat.items()}
    for n in names:
        p = index.get(n.lower())
        if not p:
            near = [k for k in cat if n.lower() in k.lower()][:4]
            print(f"  NOT FOUND (aws): {n}" + (f"   did you mean: {', '.join(near)}" if near else ""))
            continue
        svg = p.read_text()
        rasterise(svg, OUT / "aws" / "png" / f"{p.stem}.png")
        if grey:
            rasterise(svg, OUT / "aws" / "grey" / f"{p.stem}.png", desaturate=True)
        print(f"  aws    {p.stem}")


def do_oss(names, grey):
    d = npm_pkg("simple-icons")
    cat = oss_catalogue()
    for n in names:
        slug = n.lower()
        svg_path = d / "icons" / f"{slug}.svg"
        if not svg_path.exists():
            print(f"  NOT FOUND (oss): {n}  — use a wordmark tile instead of a lookalike logo")
            continue
        title, hexv = cat.get(slug, (n, "333333"))
        svg = svg_path.read_text()
        rasterise(svg, OUT / "oss" / "png" / f"{slug}.png", fill="#" + hexv)
        if grey:
            rasterise(svg, OUT / "oss" / "grey" / f"{slug}.png", desaturate=True)
        print(f"  oss    {slug:<22} #{hexv}  ({title})")


def do_list(terms):
    az, aws, oss = azure_catalogue(), aws_catalogue(), oss_catalogue()
    if not terms:
        print(f"azure {len(az)}  ·  aws {len(aws)}  ·  oss {len(oss)}")
        return
    for t in terms:
        tl = t.lower()
        print(f"=== {t}")
        for n in sorted(k for k in az if tl in k.lower())[:8]:
            print(f"  azure  {n}")
        for n in sorted(k for k in aws if tl in k.lower())[:8]:
            print(f"  aws    {n}")
        for slug, (title, hexv) in sorted(oss.items()):
            if tl in slug or tl in title.lower():
                print(f"  oss    {slug:<22} #{hexv}  ({title})")
        print()


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", nargs="?", choices=["azure", "aws", "oss"])
    ap.add_argument("names", nargs="*")
    ap.add_argument("--list", nargs="*", dest="search", metavar="TERM")
    ap.add_argument("--grey", action="store_true",
                    help="also write desaturated variants, for out-of-scope blocks")
    a = ap.parse_args()
    if a.search is not None:
        do_list(a.search)
        return
    if not a.source or not a.names:
        ap.error("give a source (azure|aws|oss) and at least one name, or use --list")
    need("rsvg-convert", "Install it: brew install librsvg  /  apt install librsvg2-bin")
    {"azure": do_azure, "aws": do_aws, "oss": do_oss}[a.source](a.names, a.grey)


if __name__ == "__main__":
    main()
