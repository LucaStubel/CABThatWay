# ThatWay · CAB — Indoor 360° Wayfinding (Texas A&M University-San Antonio)

Turn-by-turn 360° navigation for the CAB building. A visitor picks a room and the
app plays a photo-by-photo route with a line on the floor, elevator prompts between
floors, and a dynamic arrival confirmation at the door.

## Two builds

- **Public (deploy this):** `index.html` — the visitor app. **No editor code.**
- **Private (keep local, do NOT deploy):** `editor.html` + `editor.js` + `editor.css` —
  the route editor (✏️). Run it locally to build/adjust routes, export, and send the
  text back to bake into `saved.js`. Because GitHub Pages is a static site, an editor
  in the public build could be opened by anyone — so it is kept out of the public build.

## Files

- **index.html** – public app shell (search + 360° viewer)
- **app.js** – routing engine + 360° viewer (public core, no editor)
- **map.js** – building model: `WAYPOINTS`, `EDGES`, `ROOMS`, `KEEP`
- **saved.js** – baked default routes / lines / camera views
- **directions.js** – **editable step instructions** ("Turn left", "Turn right", …) per room
- **rooms.js** – full room catalogue (search)
- **style.css** – design (TAMU-SA brand: Madla Maroon + Yellow Rose, Oswald + Vollkorn)
- **three.min.js** – 3D library
- **images/** – ThatWay logo, dome seal, category icons
- **panos/** – the 48 equirectangular 360° photos
- **editor.html / editor.js / editor.css** – private editor (do not deploy)

## Editing the important bits

- **Colors / fonts:** `style.css` → `:root` (change `--maroon`, `--yellow`, …).
- **Step instructions:** `directions.js` → per room, one text per step in order.
  Change `"Follow the line"` to `"Turn left"`, `"Turn right"`, `"Go straight"`, etc.
  The last entry `""` is the arrival and is ignored. Leave the elevator steps as
  `"Take the elevator to Floor X"`.
- **Room names / which rooms show:** `map.js` (`label`, `KEEP`).
- **Photos:** `panos/`.

## Deploy on GitHub Pages

1. Upload everything **except** `editor.html`, `editor.js`, `editor.css` (keeping the
   `images/` and `panos/` folders and the structure).
2. Settings → Pages → Branch `main` / `/ (root)` → Save.
3. Open `https://<username>.github.io/<repo>/`.

## Deep links (NFC)

`…/?from=f1-lobby-e1` starts the route from that spot; `…/?to=B410` opens a destination
directly. Without `?from`, routes start from the Floor-1 lobby.
