# Bistro Aurora – Beispiel-Website

Dies ist eine statische Beispiel-Website für ein fiktives Bistro in Dortmund: **„Bistro Aurora“**.  
Sie dient als Portfolio-Projekt und zeigt Aufbau, Struktur und Design einer kleinen, aber hochwertigen Gastro-Website.

## Inhalt

- `index.html` – Startseite mit Hero, Intro, Highlights und Gästestimmen
- `ueber-uns.html` – Über uns, Story des Bistros und Team
- `speisekarte.html` – Auszug der Speisekarte mit Kategorien und Badges
- `galerie.html` – Bildergalerie (Innenraum, Gerichte, Atmosphäre)
- `kontakt.html` – Kontakt & Reservierung mit Formular und eingebetteter Karte
- `impressum.html` – Rechtliche Angaben gemäß § 5 TMG
- `datenschutz.html` – Datenschutzerklärung (Basis-Variante)

Zusätzliche Ordner:

- `css/` – Stylesheets (mobile-first, modular je Seite)
  - `mainstyles.css` – globale Basisstyles (Layout, Farben, Navigation, Footer)
  - `home.css` – Startseite
  - `ueber-uns.css` – Über uns
  - `speisekarte.css` – Speisekarte
  - `galerie.css` – Galerie
  - `kontakt.css` – Kontakt
  - `recht.css` – Impressum & Datenschutz
- `Bilder/` – Beispielbilder für Hero, Galerie und Favicons

## Features

- **Mobile-first Layout** mit CSS Grid und flexiblen Sektionen
- **Einheitliches Design** über alle Unterseiten (Navigation, Header, Footer)
- **SEO-Grundlagen**:
  - Sinnvolle Seitentitel
  - Meta-Descriptions
  - Open-Graph-Tags pro Seite
- **Strukturierte Inhalte**:
  - Klar getrennte HTML-Dateien je Unterseite
  - Semantische Tags (`header`, `main`, `section`, `footer`)
- **Rechtliche Basis-Seiten**:
  - Impressum
  - Datenschutzerklärung (ohne Anspruch auf Rechtsberatung)

## Projekt lokal öffnen

Du brauchst keinen Build-Step oder Node.js – es ist eine reine HTML/CSS-Seite.

1. Projektordner klonen oder herunterladen:
   ```bash
   git clone https://github.com/<dein-benutzername>/bistro-aurora.git
   cd bistro-aurora
   ```
