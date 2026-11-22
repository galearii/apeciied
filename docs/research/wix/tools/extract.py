"""Turn rendered Wix DOM dumps into Markdown pages plus an asset manifest.

usage: python3 -I extract.py <dom_dir> <out_dir>
"""
import json, re, sys, html
from pathlib import Path
from urllib.parse import unquote
from bs4 import BeautifulSoup, NavigableString, Tag

dom_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
PAGES = ["home", "about", "organization", "apec-hrdwg-ednet", "newsletters",
         "project-schedule", "apec-events", "apec-event-highlights", "contact"]
MEDIA = re.compile(r"static\.wixstatic\.com/media/([^/\"&;?\s]+\.(?:jpe?g|png|gif|webp|svg))")
SHAPE = re.compile(r"static\.wixstatic\.com/shapes/([0-9a-f_]+\.svg)")
PDF = re.compile(r"/_files/ugd/([0-9a-f]{6}_[0-9a-f]{32}\.pdf)")

images, files, links = {}, {}, {}

def inline(el):
    """Text of a block with links kept as Markdown."""
    parts = []
    for n in el.descendants:
        if isinstance(n, NavigableString):
            if n.find_parent("a") is not None and n.find_parent("a") in el.find_all("a"):
                continue
            parts.append(str(n))
        elif n.name == "a":
            t = n.get_text(" ", strip=True)
            href = n.get("href", "")
            parts.append(f"[{t}]({href})" if t else "")
        elif n.name == "br":
            parts.append("  \n")
    return re.sub(r"[ \t ]+", " ", "".join(parts)).strip()

def note_href(href, page):
    if not href:
        return
    m = PDF.search(href)
    if m:
        files.setdefault(m.group(1), {"url": "https://www.apeciied.org/_files/ugd/" + m.group(1), "pages": []})
        if page not in files[m.group(1)]["pages"]:
            files[m.group(1)]["pages"].append(page)
    links.setdefault(href, set()).add(page)

def note_image(mid, page, alt, kind="media"):
    rec = images.setdefault(mid, {"kind": kind, "alt": alt or "", "pages": []})
    if alt and not rec["alt"]:
        rec["alt"] = alt
    if page not in rec["pages"]:
        rec["pages"].append(page)

def walk(root, page):
    lines, seen_imgs = [], set()
    for el in root.find_all(True):
        if el.get("data-testid") == "richTextElement":
            for b in el.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"]):
                if b.find_parent(["li"]) is not None and b.name != "li":
                    continue
                for a in b.find_all("a"):
                    note_href(a.get("href"), page)
                t = inline(b).replace("\u200b", "").strip()
                if not t:
                    continue
                if b.name.startswith("h"):
                    lines.append("#" * int(b.name[1]) + " " + t)
                elif b.name == "li":
                    lines.append("- " + t)
                else:
                    lines.append(t)
        elif el.get("data-testid") == "linkElement" and el.find_parent(attrs={"data-testid": "richTextElement"}) is None:
            t = el.get_text(" ", strip=True)
            href = el.get("href", "")
            note_href(href, page)
            if t or href:
                lines.append(f"[button: {t or '(no label)'}]({href})")
        elif el.name == "img" or el.has_attr("data-image-info"):
            src = " ".join([el.get("src", ""), el.get("srcset", ""), el.get("srcSet", ""),
                            html.unescape(el.get("data-image-info", ""))])
            uri = re.search(r'"uri":"([^"]+)"', src)
            m = (MEDIA.search("static.wixstatic.com/media/" + uri.group(1)) if uri else None) \
                or MEDIA.search(src) or SHAPE.search(src)
            mid = m.group(1).replace("%7E", "~") if m else None
            if mid and mid not in seen_imgs:
                seen_imgs.add(mid)
                alt = el.get("alt", "")
                note_image(mid, page, alt, "shape" if m.re is SHAPE else "media")
                lines.append(f"![{alt}](../images/{mid.replace('~', '-')})")
        elif el.name == "iframe":
            lines.append(f"[iframe: {el.get('title', '')}]")
        elif el.get("role") == "tab":
            lines.append(f"[tab: {el.get_text(' ', strip=True)}]")
        elif el.name == "svg" and el.find_parent(attrs={"data-testid": "richTextElement"}) is None:
            pass
    # Collapse consecutive duplicates (Wix renders some blocks twice for mobile/desktop).
    out_lines = []
    for l in lines:
        if not out_lines or out_lines[-1] != l:
            out_lines.append(l)
    return "\n\n".join(out_lines) + "\n"

(out / "pages").mkdir(parents=True, exist_ok=True)
meta = {}
for p in PAGES:
    soup = BeautifulSoup((dom_dir / f"{p}.html").read_text(), "lxml")
    title = soup.title.get_text(strip=True) if soup.title else ""
    desc = soup.find("meta", attrs={"name": "description"})
    og = soup.find("meta", attrs={"property": "og:image"})
    meta[p] = {"title": title, "description": desc.get("content") if desc else "",
               "og_image": og.get("content") if og else "",
               "url": "https://www.apeciied.org/" + ("" if p == "home" else p)}
    for m in re.finditer(MEDIA, og.get("content", "") if og else ""):
        note_image(m.group(1).replace("%7E", "~"), p, "og:image")
    for l in soup.find_all("link", rel=lambda r: r == "icon"):
        for m in re.finditer(MEDIA, l.get("href", "")):
            note_image(m.group(1).replace("%7E", "~"), p, "favicon")
    body = walk(soup.find(id="SITE_PAGES"), p)
    bg = soup.find(id="BACKGROUND_GROUP")
    bg = walk(bg, p).strip() if bg else ""
    if bg:
        body = "Page background: " + bg + "\n\n" + body
    head = f"---\nsource: {meta[p]['url']}\ntitle: {json.dumps(title)}\ndescription: {json.dumps(meta[p]['description'])}\n---\n\n"
    (out / "pages" / f"{p}.md").write_text(head + body)
    if p == "home":
        (out / "pages" / "_header.md").write_text(walk(soup.find(id="SITE_HEADER"), "_header"))
        logo = soup.find(id="SITE_HEADER").find("svg", attrs={"data-bbox": True})
        (out / "images").mkdir(exist_ok=True)
        (out / "images" / "logo.svg").write_text(str(logo) + "\n")
        (out / "pages" / "_footer.md").write_text(walk(soup.find(id="SITE_FOOTER"), "_footer"))

manifest = {"pages": meta, "images": images, "files": files,
            "links": {k: sorted(v) for k, v in sorted(links.items())}}
(out / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
print(len(images), "images,", len(files), "pdfs,", len(links), "links")
