#!/usr/bin/env python3
"""Cetak perkataan@masa bagi julat masa tertentu (untuk isi RAW dalam data.ts).
Guna: python3 words.py transcript.json 72 128"""
import json, sys
t0, t1 = float(sys.argv[2]), float(sys.argv[3])
for s in json.load(open(sys.argv[1])):
    if t0 - 1 < s["start"] < t1 + 1:
        print(" ".join(f"{w['w'].strip()}@{w['s']:.2f}" for w in s["words"]))
