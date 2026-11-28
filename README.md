# Saints, the anglerfish, and checkmate.

A responsive, retro personal website for GitHub Pages. Built with plain HTML, CSS and JavaScript.

## Run locally
Open `index.html` in a browser. For the best experience, use a small local server (for example, VS Code Live Server). Weather needs an internet connection. All other sections work without a backend.

## Publish on GitHub Pages
1. Create a GitHub repository.
2. Upload the contents of this folder (not the ZIP itself).
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`.
4. Save and wait for GitHub Pages to publish the site.

## Add your own photos
Put image files in `assets/photos/` and name them:
- `photo1.jpg`
- `photo2.jpg`
- `photo3.jpg`
- `photo4.jpg`
- `photo5.jpg`
- `photo6.jpg`

The gallery already looks for those names. You can add more by extending the `photoFiles` list near the top of the Gallery section in `app.js`. PNG and WEBP work too; make sure the extension in `app.js` matches the real file.

You can also use **add photos from device** on the Gallery page. Those photos are stored in that browser only (not uploaded to GitHub).

## Add music and cover art
Audio goes in `assets/music/`:
- `music1.mp3`
- `music2.mp3`
- `music3.mp3`
- `music4.mp3`
- `music5.mp3`

Cover images go in `assets/covers/`:
- `music1.png`
- `music2.png`
- `music3.png`
- `music4.png`
- `music5.png`

The first three tracks belong to **Nin's Choice**; the next two belong to **Eri's Choice**. Change titles, artists, lyrics and translations in the `tracks` object in `app.js`. For a new track, add an object with `file`, `cover`, `title`, `artist`, `lyrics` and `translation`, then commit the matching files to GitHub.

The **add audio from device** control creates a temporary local preview for the current browser session. It does not upload audio to GitHub and it does not permanently add the track for other visitors.

## Optional custom icons / artwork
The site includes original text/CSS decorations and SVG placeholders. You can replace:
- `assets/icons/fish.svg` — browser tab icon
- `assets/icons/album-placeholder.svg` — fallback album art

You can upload PNG artwork as album covers using the `music1.png`, `music2.png` naming pattern. The cover appears on the player screen and in the track list.

## What is saved
Personal edits such as schedule, bills, parent arrival date, mood, journal notes, calendar notes, guest notes, character additions, glossary additions, pet stats and feeding limit are saved in the current browser using `localStorage`.

Important: `localStorage` is per browser/device. It does not sync between visitors or devices. The visitor counter is also a local decorative counter, not a shared site-wide counter. A static GitHub Pages site cannot write uploaded files back into your GitHub repository. To make photos/music available to everyone, add them to the repository and push the changes.

## Tamagotchi
Bubbles can be fed up to **3 times per local calendar day**. Hunger, happiness and energy decrease gradually while time passes. Pet state is saved in the current browser.

## Notes
- Weather is fetched from Open-Meteo and requires an internet connection.
- The sample character and glossary entries are placeholders; edit them to match your story.
- This project does not include copyrighted music or lyrics. Add only audio and text you have permission to use.
