#!/usr/bin/env python3
"""Subset woff2 dari Google Fonts (SIL OFL 1.1) ke fonts/, meliputi aksara dalam index.html. Padam fonts/ dan jalankan semula jika teks berubah."""
import re, sys, urllib.parse, urllib.request, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chars = ''.join(sorted(set(open(os.path.join(D, 'index.html'), encoding='utf-8').read() + '0123456789,.≈°?·abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') - set('\n\r\t')))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
JOBS = [('hand700', 'Caveat:wght@700'), ('type400', 'Courier Prime:wght@400'), ('type700', 'Courier Prime:wght@700')]
os.makedirs(os.path.join(D, 'fonts'), exist_ok=True)
for name, fam in JOBS:
    url = 'https://fonts.googleapis.com/css2?' + urllib.parse.urlencode({'family': fam, 'text': chars, 'display': 'block'})
    css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    if not urls: sys.exit(f'no font url for {fam}')
    data = urllib.request.urlopen(urllib.request.Request(urls[0], headers={'User-Agent': UA}), timeout=60).read()
    open(os.path.join(D, f'fonts/{name}.woff2'), 'wb').write(data); print(name, len(data), 'bytes', len(urls))
