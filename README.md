# Retro Cable TV Ads

A recreation of a 1990s cable TV guide channel, built with Preact and Vite. Pages are driven by `public/ads.yaml` — no rebuild needed when you change ads or music.

---

## Running on a Raspberry Pi

### 1. Install Node.js

The easiest way is via [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### 2. Install dependencies and build

```bash
cd /path/to/retro-cable-tv-ads
npm install
npm run build
```

This produces a `dist/` folder of static files.

### 3. Serve the built app

Install a lightweight static file server:

```bash
npm install -g serve
```

Then serve the build:

```bash
serve dist -l 8080
```

The app will be available at `http://localhost:8080`.

### 4. Launch in kiosk mode on boot

To have the Pi display the guide channel automatically on startup, add these two lines to your `~/.bashrc` (or create a systemd service):

```bash
serve dist -l 8080 &
sleep 3 && chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:8080
```

For a proper always-on setup, use a systemd service for `serve` and set Chromium to launch at the end of your desktop autostart script (`~/.config/lxsession/LXDE-pi/autostart`):

```
@chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:8080
```

> **Tip:** The app is designed for a 4:3 display ratio. Set your Pi's screen resolution accordingly for the best appearance.

---

## Adding a new ad page to ads.yaml

All pages live in `public/ads.yaml` under the `pages:` key. The file is fetched at runtime, so changes take effect on the next page load — no rebuild required.

### Page structure

Each page must have exactly **11 visual rows** to fill the screen without overflow. The template below is the standard layout:

```yaml
- bg: 8                         # page background colour (index 0–15, see palette below)
  lines:
    - type: text                 # row 1 — blank top spacer
      text: ""
      bg: 8                     # match page bg
      color: 8                  # match page bg (invisible)
      height: 1

    - type: text                 # row 2 — channel header
      text: "Palisade CableVision"
      bg: 8
      color: 7                  # white
      height: 1

    - type: datetime             # row 3 — live clock/date bar
      format: "%a %b %d, %Y  TIME  %-I:%M:%S %p"
      bg: 5
      color: 10
      height: 1
      caps: true

    - type: text                 # rows 4–5 — hero title (double height)
      text: "YOUR BRAND"        # keep to ~20 characters or it will wrap
      bg: 9
      color: 7
      height: 2
      caps: true

    - type: text                 # row 6 — blinking highlight line
      text: "YOUR OFFER HERE!"
      bg: 9
      color: 0
      height: 1
      caps: true
      blink: true
      blink_interval: 0.6

    - type: block                # rows 7–8 — two-line content block
      bg: 7
      color: 8
      height: 1
      caps: true
      inverted: true
      lines:
        - "DETAIL LINE ONE"
        - "DETAIL LINE TWO"

    - type: text                 # row 9 — standalone detail line
      text: "PHONE  *  ADDRESS  *  HOURS"
      bg: 8
      color: 7
      height: 1
      caps: true

    - type: text                 # row 10 — second standalone line
      text: "TAGLINE OR EXTRA INFO"
      bg: 9
      color: 0
      height: 1
      caps: true

    - type: text                 # row 11 — blank bottom spacer
      text: ""
      bg: 8
      color: 8
      height: 1
```

### Colour palette

| Index | Colour       | Index | Colour    |
|-------|--------------|-------|-----------|
| 0     | Black        | 8     | Red       |
| 1     | Dark blue    | 9     | Orange    |
| 2     | Dark purple  | 10    | Yellow    |
| 3     | Dark green   | 11    | Green     |
| 4     | Brown        | 12    | Blue      |
| 5     | Dark grey    | 13    | Lavender  |
| 6     | Light grey   | 14    | Pink      |
| 7     | White        | 15    | Peach     |

### Visual row counts

Every line counts as one visual row, **except**:
- `height: 2` lines count as **2 rows**
- `block` items: each entry in `lines:` counts as one row (multiplied by `height`)

A standard page uses: 1 + 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 = **11 rows**.

### Other line properties

| Property         | Values              | Description                                  |
|------------------|---------------------|----------------------------------------------|
| `caps`           | `true`              | Renders text in uppercase                    |
| `blink`          | `true`              | Enables blinking                             |
| `blink_interval` | seconds (e.g. `0.6`)| How fast the line blinks                    |
| `inverted`       | `true`              | Swaps `bg` and `color`                       |

---

## Adding music

Music files are played in the background while the guide cycles through pages.

1. Place your audio files (MP3 recommended) in the `public/music/` folder.

2. Check the `global` settings at the top of `public/ads.yaml`:

```yaml
global:
  audio:
    folder: music     # relative to public/ — change if you use a different folder name
    shuffle: true     # true to randomise track order, false to play in sequence
    volume: 0.6       # 0.0 (silent) to 1.0 (full volume)
```

3. That's it. The app picks up all files in the folder automatically — no list to maintain. Changes to the folder take effect on the next page load.

> **Note:** Most browsers require a user interaction before allowing audio playback. On the Pi in kiosk mode this isn't an issue once the page has focus, but during local development you may need to click the window once to unmute.
