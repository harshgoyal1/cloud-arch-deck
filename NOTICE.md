# Icon sources and their terms

**This repository contains no third-party icon artwork.** `scripts/icons.py` fetches
what you ask for at run time and caches it in `.icon-cache/`, which is gitignored. The
MIT licence on this repository covers the code and documentation only — it does not and
cannot relicense anyone's trademarks.

| Set | Fetched from | Terms you are accepting |
|---|---|---|
| **Azure** | The Azure architecture icon artwork mirrored in the drawio shape library | Microsoft permits the Azure icons in architecture diagrams and documentation. Do not modify the artwork, and do not use it to imply a Microsoft endorsement. Review Microsoft's current icon terms before publishing. |
| **AWS** | The `aws-icons` npm package, which packages the official AWS Architecture Icons | The AWS asset terms apply. Do not modify the artwork, and do not use AWS marks in a way that suggests AWS sponsors or endorses your work. Review the AWS Trademark Guidelines before publishing. |
| **Open source** | The `simple-icons` npm package | simple-icons is CC0. The marks it contains remain the property of their respective projects, and each project's own trademark policy still applies. |

## The practical rule

Use a mark to **identify a technology inside an architecture diagram**. That is what all
three sets exist for.

Do not put a vendor's mark on a title slide, inside a logo lock-up next to your own, on
marketing material, or anywhere a reader could reasonably infer partnership, sponsorship
or certification that does not exist.

## Where no mark exists

Some technologies have no official mark, or none that is redistributable. The kit renders
a **wordmark tile** for these — the project's name, set in the deck's own type. Use it.
Substituting a visually similar logo from another project is worse than having no logo.

## The placeholder brand

`assets/sample-wordmark.png` is a fictional mark drawn for this repository so the examples
run out of the box. Replace it with your own before using the kit for real work.
