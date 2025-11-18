# Bistro Aurora — Beispiel-Website

Dieses Repository enthält die statischen Seiten einer Beispiel-Website für ein kleines Bistro namens "Bistro Aurora" (HTML, CSS und Bilder).

Inhalt:
- `index.html` — Startseite
- `speisekarte.html` — Speisekarte
- `ueber-uns.html` — Über uns
- `galerie.html` — Galerie mit Bildern
- `kontakt.html` — Kontakt / Reservierung (Frontend)
- `css/` — Stylesheets
- `Bilder/` — Fotos (aktuell als JPG)

Kurzanleitung

1) Lokales Git (bereits initialisiert):
   - `git status` — Status prüfen
   - `git add .` und `git commit -m "Initial commit"` — Änderungen committen

2) Auf GitHub hochladen (manuell):
   - Erstellen Sie ein neues Repository auf GitHub (z. B. `bistro-aurora`).
   - Kopieren Sie die Remote-URL (HTTPS oder SSH).
   - Fügen Sie die Remote hinzu und pushen:

```powershell
cd "c:\Users\marck\Desktop\Pixelmensch_Ordnerstruktur\02_WEBSEITEN\Beispiel-Webseiten\bistro-aurora"
# Beispiel mit HTTPS
git remote add origin https://github.com/<Ihr-Benutzername>/bistro-aurora.git
git branch -M main
git push -u origin main
```

3) Optional: Mit GitHub CLI automatisch erstellen (wenn installiert):

```powershell
cd "c:\Users\marck\Desktop\Pixelmensch_Ordnerstruktur\02_WEBSEITEN\Beispiel-Webseiten\bistro-aurora"
gh repo create <Ihr-Benutzername>/bistro-aurora --public --source=. --remote=origin --push
```

Weitere Hinweise

- Bilder optimieren: Konvertieren Sie die JPGs in WebP (z. B. mit `cwebp`) und prüfen Sie die Datei-Größen.
- Backend für Reservierungen: `kontakt.html` enthält nur ein Frontend-Formular. Implementieren Sie serverseitig ein POST-Endpoint (`/reserve`) oder nutzen Sie einen Drittanbieter (z. B. Formspree, Netlify Forms).
- Datenschutz: Überprüfen Sie `datenschutz.html` und `impressum.html` bevor Sie die Seite veröffentlichen.

Wenn Sie möchten, kann ich:
- das Repository automatisch zu GitHub erstellen und pushen (benötigt `gh` und Ihre Zustimmung),
- ein kleines Node.js-Beispiel-Backend zum Empfangen der Formular-POSTs hinzufügen,
- ein PowerShell-Skript zur WebP-Konvertierung der Bilder erstellen.

Sagen Sie mir kurz, welche(s) der obigen Schritte ich ausführen soll.