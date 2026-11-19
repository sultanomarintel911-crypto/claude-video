"""Jana skrip EffectCraft (gaya After Effects) untuk Ar-Rum 30:54, bina projek .ecproj dan render latar MP4.

Guna:  python3 craft/effectcraft_animasi.py [--frames 1,5,12] [--render]
  --frames  : render PNG pada saat-saat (masa komposisi) untuk semakan, ke craft/build/frame_<s>.png
  --render  : render penuh ke public/craft/kitaran_bg.mp4 (tanpa audio; teks & audio ditambah Remotion)
Lapisan PNG datang dari VectorCraft (vectorcraft_lukis.py). Masa = INTRO + masa perkataan Alafasy.
Kesan EffectCraft: Linear Wipe (pokok & bunga tumbuh), Glow (daun pada "قُوَّةً", matahari),
CC Light Rays (matahari), CC Particle World (debunga), Add Grain (tekstur filem).
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EC = os.environ.get("EC", "/home/user/storytold/effectcraft/target/release/effectcraft-cli")
LAP = os.path.join(HERE, "build", "lapisan") + "/"
PROJ = os.path.join(HERE, "build", "kitaran.ecproj")
data = json.load(open(os.path.join(ROOT, "src", "data", "030054.json")))
INTRO, OUTRO = 2.6, 4.2
W = [None] + [(w["start"] / 1000 + INTRO, w["end"] / 1000 + INTRO) for w in data["words"]]  # 1-based, masa komposisi
END = INTRO + data["duration"]
DUR = round(END + OUTRO, 3)

T = dict(lemah=W[1][0], kuat=W[6][0], tua=W[12][0], cipta=W[19][0], kuasa=W[22][0], quwwah=W[11][0], uban0=W[17][0], uban1=W[18][1])
GROW0, GROW1 = T["kuat"], W[11][0] + 0.9

js = f"""
var DIR = {json.dumps(LAP)};
var DUR = {DUR};
var T = {json.dumps(T)};
var END = {END};
var comp = app.project.items.addComp("Kitaran", 1080, 1920, 1, DUR, 30);
comp.bgColor = [0.11, 0.06, 0.16];
function imp(name) {{
  var it = app.project.importFile(new ImportOptions(new File(DIR + name + ".png")));
  var L = comp.layers.add(it);
  L.name = name;
  return L;
}}
function keys(prop, kv) {{
  for (var i = 0; i < kv.length; i++) prop.setValueAtTime(kv[i][0], kv[i][1]);
  try {{
    for (var k = 1; k <= prop.numKeys; k++) {{
      var e = new KeyframeEase(0, 60);
      var arr = prop.value instanceof Array ? (prop.value.length === 3 ? [e, e, e] : [e]) : [e];
      prop.setTemporalEaseAtKey(k, arr, arr);
    }}
  }} catch (err) {{}}
}}
function tr(L) {{ return L.property("ADBE Transform Group"); }}
function fx(L, name) {{ return L.property("ADBE Effect Parade").addProperty(name); }}
function baseAnchor(L, x, y) {{ tr(L).property("Anchor Point").setValue([x, y]); tr(L).property("Position").setValue([x, y]); }}
function wipeUp(L, t0, t1) {{
  var e = fx(L, "Linear Wipe");
  e.property("Wipe Angle").setValue(WIPE_ANGLE);
  e.property("Feather").setValue(40);
  keys(e.property("Transition Completion"), [[t0, 100], [t1, 0]]);
}}

// ---- latar ----
imp("langit");
var bin = imp("bintang");
tr(bin).property("Opacity").expression = "70 + 30*Math.sin(time*1.7)";
var sun = imp("matahari");
keys(tr(sun).property("Position"), [[T.kuasa + 0.2, [540, 960]], [T.kuasa + 1.8, [540, 875]]]);
var rays = fx(sun, "CC Light Rays");
rays.property("Center").setValue([540, 1066]);
rays.property("Radius").setValue(320);
keys(rays.property("Intensity"), [[0, 0], [T.quwwah - 0.3, 0], [T.quwwah + 0.4, 60], [T.tua, 0], [T.kuasa, 0], [T.kuasa + 1.6, 140], [END + 2.5, 90]]);
var aw = imp("awan");
tr(aw).property("Position").expression = "[value[0] + Math.sin(time*0.12)*70, value[1]]";
imp("bukit_jauh");
imp("bukit_tengah");
imp("bukit_dekat");

// ---- bunga (cipta) ----
for (var g = 0; g < 3; g++) {{
  var f = imp("bunga_" + g);
  wipeUp(f, T.cipta + 0.2 + g * 1.1, T.cipta + 1.3 + g * 1.1);
  tr(f).property("Position").expression = "[value[0] + Math.sin(time*1.4 + " + g + ")*2, value[1]]";
}}

// ---- benih & anak pokok (lemah) ----
var seed = imp("benih");
keys(tr(seed).property("Opacity"), [[0, 0], [0.6, 100], [T.kuat, 100], [T.kuat + 1, 0]]);
var sp = imp("anak_pokok");
baseAnchor(sp, 540, 1172);
keys(tr(sp).property("Scale"), [[{W[3][0]}, [0, 0]], [{W[5][0]} + 0.6, [100, 100]]]);
keys(tr(sp).property("Opacity"), [[{W[3][0]}, 0], [{W[3][0]} + 0.3, 100], [T.kuat + 0.4, 100], [T.kuat + 1.6, 0]]);
tr(sp).property("Rotation").expression = "var w = (time > {W[5][0] - 0.2} && time < {W[6][0] + 0.6}) ? 9 : 3; Math.sin(time*6)*w";

// ---- pokok (kuat): tumbuh tingkat demi tingkat ----
var tree = [];
for (var d = 0; d <= 6; d++) {{
  var L = imp("pokok_d" + d);
  wipeUp(L, {GROW0} + d / 7 * {GROW1 - GROW0}, {GROW0} + (d + 1) / 7 * {GROW1 - GROW0} + 0.05);
  tree.push(L);
}}
// ---- daun ----
var leafIn0 = {GROW0} + 4 / 7 * {GROW1 - GROW0};
function leafLayer(name, uban, fallG) {{
  var L = imp(name);
  tree.push(L);
  if (!uban) keys(tr(L).property("Opacity"), [[leafIn0, 0], [{GROW1} + 0.2, 100]]);
  else keys(tr(L).property("Opacity"), [[T.uban0 + (fallG < 0 ? 0.3 : fallG * 0.12), 0], [T.uban1 - (fallG < 0 ? 0 : 0.6) + 0.2, 100]]);
  if (!uban) {{
    var gl = fx(L, "Glow");
    gl.property("Glow Radius").setValue(22);
    keys(gl.property("Glow Intensity"), [[T.quwwah - 0.2, 0], [T.quwwah + 0.3, 0.55], [T.quwwah + 1.4, 0.1]]);
  }}
  if (fallG >= 0) {{
    var t0 = T.uban0 + 0.9 + fallG * 0.55;
    keys(tr(L).property("Position"), [[t0, [540, 1172]], [t0 + 3.0, [540 + (fallG % 2 ? 90 : -90), 1172 + 430]]]);
    keys(tr(L).property("Rotation"), [[t0, 0], [t0 + 3.0, fallG % 2 ? 8 : -8]]);
    var op = tr(L).property("Opacity");
    op.setValueAtTime(t0 + 1.6, 100);
    op.setValueAtTime(t0 + 3.0, 0);
  }}
  return L;
}}
leafLayer("daun_kekal", false, -1);
for (var g2 = 0; g2 < 6; g2++) leafLayer("daun_gugur" + g2, false, g2);
leafLayer("daun_kekal_uban", true, -1);
for (var g3 = 0; g3 < 6; g3++) leafLayer("daun_gugur" + g3 + "_uban", true, g3);
// denyut kuat: semua lapisan pokok berskala dari pangkal pada "قُوَّةً"
for (var i = 0; i < tree.length; i++) {{
  var Lt = tree[i];
  var pos = tr(Lt).property("Position");
  if (pos.numKeys === 0) baseAnchor(Lt, 540, 1172); else tr(Lt).property("Anchor Point").setValue([540, 1172]);
  keys(tr(Lt).property("Scale"), [[{GROW0}, [88, 88]], [T.quwwah - 0.1, [100, 100]], [T.quwwah + 0.35, [105, 105]], [T.quwwah + 1.2, [100, 100]]]);
}}

// ---- debunga (CC Particle World) ----
var pol = comp.layers.addSolid([0, 0, 0], "debunga", 1080, 1920, 1);
var pw = fx(pol, "CC Particle World");
pw.property("Birth Rate").setValue(0.6);
pw.property("Longevity (sec)").setValue(5);
pw.property("Producer").property("Position Y").setValue(0.25);
pw.property("Producer").property("Radius X").setValue(0.6);
pw.property("Producer").property("Radius Y").setValue(0.1);
pw.property("Physics").property("Velocity").setValue(0.12);
pw.property("Physics").property("Gravity").setValue(-0.04);
pw.property("Particle").property("Particle Type").setValue(3); // Faded Sphere (indeks AE bermula 1)
pw.property("Particle").property("Transfer Mode").setValue(3); // Add
pw.property("Particle").property("Birth Size").setValue(0.05);
pw.property("Particle").property("Death Size").setValue(0.02);
pw.property("Particle").property("Birth Color").setValue([1, 0.93, 0.82]);
pw.property("Particle").property("Death Color").setValue([1, 0.75, 0.55]);
keys(tr(pol).property("Opacity"), [[0, 0], [T.kuat + 1.5, 0], [T.kuat + 2.5, 80], [T.tua, 80], [T.tua + 1, 0], [T.cipta, 0], [T.cipta + 1, 90]]);

// ---- butiran filem ----
var adj = comp.layers.addSolid([0.5, 0.5, 0.5], "grain", 1080, 1920, 1);
adj.adjustmentLayer = true;
var gr = fx(adj, "Add Grain");
gr.property("Viewing Mode").setValue(3);
gr.property("Tweaking").property("Intensity").setValue(0.35);
gr.property("Tweaking").property("Size").setValue(1.2);
app.project.save(new File({json.dumps(PROJ)}));
"done";
"""

if __name__ == "__main__":
    wipe = os.environ.get("WIPE_ANGLE", "180")
    path = os.path.join(HERE, "build", "kitaran.jsx")
    open(path, "w").write(js.replace("WIPE_ANGLE", wipe))
    r = subprocess.run([EC, "script", path, "--empty"], capture_output=True, text=True)
    print("skrip:", r.stdout.strip()[-300:], r.stderr.strip()[-600:])
    if "--frames" in sys.argv:
        for s in sys.argv[sys.argv.index("--frames") + 1].split(","):
            out = os.path.join(HERE, "build", f"frame_{float(s):05.1f}.png")
            r = subprocess.run([EC, "render-frame", PROJ, "--comp", "Kitaran", "--time", s, "--max-side", "640", "--out", out], capture_output=True, text=True)
            print(s, "OK" if r.returncode == 0 else r.stderr[-300:])
    if "--render" in sys.argv:
        os.makedirs(os.path.join(ROOT, "public", "craft"), exist_ok=True)
        out = os.path.join(ROOT, "public", "craft", "kitaran_bg.mp4")
        r = subprocess.run([EC, "render", PROJ, "--comp", "Kitaran", "--out", out, "--format", "h264", "--audio", "off", "--video-quality", "90", "--progress"], text=True)
        print("render", r.returncode, out)
