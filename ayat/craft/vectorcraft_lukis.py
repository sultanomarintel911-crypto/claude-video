"""Lukis setiap lapisan geometri dengan VectorCraft (headless) dan eksport PNG lutsinar 1080x1920.

Guna:  python3 craft/vectorcraft_lukis.py [/path/to/vectorcraft-cli]
Input: craft/build/geometri.json (dari geometri_30_54.py)
Output: craft/build/lapisan/<nama>.png  (+ <nama>.vectorcraft untuk disunting dalam aplikasi)
Kesan VectorCraft: Outer Glow (matahari, benih, bintang), Feather (awan), Inner Glow (daun & bunga).
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
VC = sys.argv[1] if len(sys.argv) > 1 else "/home/user/storytold/vectorcraft/target/release/vectorcraft-cli"
geo = json.load(open(os.path.join(HERE, "build", "geometri.json")))
OUT = os.path.join(HERE, "build", "lapisan")
os.makedirs(OUT, exist_ok=True)

# kesan VectorCraft mengikut lapisan
LAYER_FX = {
    "matahari": [("stylize.outerGlow", {"blur": 110, "color": "#ffc98f", "opacity": 95, "mode": "screen"})],
    "benih": [("stylize.outerGlow", {"blur": 26, "color": "#ffd9a0", "opacity": 90, "mode": "screen"})],
    "bintang": [("stylize.outerGlow", {"blur": 6, "color": "#fff4ea", "opacity": 80, "mode": "screen"})],
    "awan": [("stylize.feather", {"radius": 9})],
}
SHAPE_FX = {
    "daun": [("stylize.innerGlow", {"blur": 6, "color": "#fff1e0", "opacity": 45, "mode": "screen", "source": "center"})],
}


def steps_for(name, shapes):
    st = [{"command": "file.new", "params": {"name": name, "width": geo["W"], "height": geo["H"], "units": "Pixels", "backgroundContents": "transparent"}}]
    for s in shapes:
        k = s["kind"]
        if k == "ellipse":
            p = {"x": s["cx"] - s["rx"], "y": s["cy"] - s["ry"], "width": 2 * s["rx"], "height": 2 * s["ry"]}
            if s.get("rotate"):
                p["rotation"] = s["rotate"]
            st.append({"command": "shape.ellipse", "params": p})
        elif k == "rect":
            p = {"x": s["x"], "y": s["y"], "width": s["w"], "height": s["h"]}
            if s.get("rx"):
                p["radius"] = s["rx"]
            st.append({"command": "shape.rectangle", "params": p})
        else:
            st.append({"command": "path.create", "params": {"d": s["d"]}})
        # isian
        if s.get("gradient"):
            st.append({"command": "paint.setFill", "params": {"gradient": {"kind": "linear", "angle": -90, "stops": [{"offset": o, "color": c} for o, c in s["gradient"]]}}})
        elif s.get("fill", "none") == "none":
            st.append({"command": "paint.setFill", "params": {"none": True}})
        else:
            st.append({"command": "paint.setFill", "params": {"color": s["fill"]}})
        # garisan
        if s.get("stroke"):
            st.append({"command": "paint.setStroke", "params": {"color": s["stroke"]}})
            st.append({"command": "stroke.set", "params": {"weight": s.get("strokeWidth", 2), "cap": "round", "join": "round"}})
        else:
            st.append({"command": "paint.setStroke", "params": {"none": True}})
        if s.get("opacity") is not None:
            st.append({"command": "object.setProps", "params": {"opacity": round(s["opacity"] * 100)}})
        for eff, prm in SHAPE_FX.get("daun" if name.startswith("daun") and not name.endswith("_uban") else name, []):
            st.append({"command": "effect.apply", "params": {"effect": eff, "params": prm}})
    if name in LAYER_FX:
        st.append({"command": "select.all", "params": {}})
        st.append({"command": "object.group", "params": {}})
        for eff, prm in LAYER_FX[name]:
            st.append({"command": "effect.apply", "params": {"effect": eff, "params": prm}})
    return st


def build(item):
    name, shapes = item
    cmds = os.path.join(OUT, name + ".commands.json")
    json.dump(steps_for(name, shapes), open(cmds, "w"))
    png = os.path.join(OUT, name + ".png")
    res = subprocess.run([VC, "run", "--commands", cmds, "--export", png, "--export", os.path.join(OUT, name + ".vectorcraft")], capture_output=True, text=True)
    ok = res.returncode == 0 and os.path.exists(png)
    return name, ok, (res.stderr or res.stdout)[-400:] if not ok else ""


with ThreadPoolExecutor(4) as ex:
    for name, ok, err in ex.map(build, geo["layers"].items()):
        print(("OK  " if ok else "GAGAL ") + name, err)
