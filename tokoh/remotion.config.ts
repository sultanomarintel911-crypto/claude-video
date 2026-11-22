import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
// Lalai Remotion ialah 80 — terlalu rendah, menyebabkan blok/kabur pada teks & gradien bila ditayang di TV.
Config.setJpegQuality(100);
// Mampatan lebih cekap -> lebih tajam pada saiz fail yang sama.
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setChromiumOpenGlRenderer('swangle');
