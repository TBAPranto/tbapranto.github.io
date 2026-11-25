#!/usr/bin/env python3
"""Check website-relative files, fragment targets and duplicate IDs without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parent.parent

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = []
        self.links = []
        self.h1 = 0
        self.missing_alt = 0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if 'id' in data:
            self.ids.append(data['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'img' and 'src' in data and 'alt' not in data:
            self.missing_alt += 1
        for key in ('href', 'src'):
            value = data.get(key)
            if value:
                self.links.append(value)
        if 'srcset' in data:
            for entry in data['srcset'].split(','):
                candidate = entry.split()
                if candidate:
                    self.links.append(candidate[0])

pages = {path: Page(path.read_text(encoding='utf-8')) for path in [*ROOT.glob('*.html'), *ROOT.glob('projects/*.html')]}
issues = []
for path, page in pages.items():
    name = path.relative_to(ROOT).as_posix()
    if len(page.ids) != len(set(page.ids)):
        issues.append(f'{name}: duplicate IDs')
    if page.h1 != 1:
        issues.append(f'{name}: expected one H1, found {page.h1}')
    if page.missing_alt:
        issues.append(f'{name}: missing image alt text')
    for value in page.links:
        parts = urlsplit(value)
        if parts.scheme or parts.netloc:
            continue
        target = (path.parent / unquote(parts.path)).resolve() if parts.path else path
        if not target.exists():
            issues.append(f'{name}: missing file {value}')
        elif parts.fragment and target.suffix == '.html':
            other = pages.get(target) or Page(target.read_text(encoding='utf-8'))
            if unquote(parts.fragment) not in other.ids:
                issues.append(f'{name}: missing anchor {value}')
css = ROOT / 'assets/style.css'
for value in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text(encoding='utf-8')):
    if not urlsplit(value).scheme and not (css.parent / value).exists():
        issues.append(f'style.css: missing asset {value}')
for issue in issues:
    print(issue)
if not issues:
    print(f'{len(pages)} pages: local files, anchors, H1s, IDs and image alt checks pass.')
raise SystemExit(1 if issues else 0)
