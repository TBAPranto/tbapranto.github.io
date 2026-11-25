#!/usr/bin/env python3
"""Configure an approved static-host URL. Does not upload or publish anything."""
from pathlib import Path
from urllib.parse import urlsplit
from html import escape
import argparse
import re
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url', required=True, help='Full HTTPS URL, including a GitHub project path if applicable')
parser.add_argument('--enable-indexing', action='store_true', help='Use only after approving the public content')
args = parser.parse_args()
parts = urlsplit(args.base_url)
if parts.scheme != 'https' or not parts.netloc or parts.query or parts.fragment or parts.username or parts.password or any(c.isspace() for c in args.base_url):
    parser.error('Use a clean HTTPS URL with no credentials, query or fragment.')
base = args.base_url.rstrip('/') + '/'
root = Path(__file__).resolve().parent.parent
pages = sorted([*root.glob('*.html'), *root.glob('projects/*.html')])
for page in pages:
    relative = page.relative_to(root).as_posix()
    url = base + ('' if relative == 'index.html' else relative)
    text = page.read_text(encoding='utf-8')
    text = re.sub(r'<link rel="canonical"[^>]*>\s*', '', text)
    text = text.replace('</head>', f'<link rel="canonical" href="{escape(url, quote=True)}">\n</head>')
    text = re.sub(r'(<meta property="og:image" content=")[^"]*(">)', lambda m: m[1]+escape(base+'assets/media/social-card.jpg',quote=True)+m[2], text)
    text = re.sub(r'<meta property="og:url"[^>]*>\s*','',text)
    text = text.replace('</head>',f'<meta property="og:url" content="{escape(url,quote=True)}">\n</head>')
    if args.enable_indexing:
        text = text.replace('content="noindex,nofollow"', 'content="index,follow"')
    page.write_text(text,encoding='utf-8')
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
tree = ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
for page in pages:
    item = ET.SubElement(tree,'{http://www.sitemaps.org/schemas/sitemap/0.9}url')
    loc = ET.SubElement(item,'{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
    relative = page.relative_to(root).as_posix()
    loc.text = base + ('' if relative == 'index.html' else relative)
ET.ElementTree(tree).write(root/'sitemap.xml',encoding='utf-8',xml_declaration=True)
if args.enable_indexing:
    (root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'sitemap.xml\n',encoding='utf-8')
print('Configured canonical URLs, sharing image and sitemap. No upload was performed.')
