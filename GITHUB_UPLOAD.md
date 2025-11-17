# 🚀 GitHub Upload Anleitung

## Schritt-für-Schritt: Repository auf GitHub hochladen

### 1. GitHub Repository erstellen

Gehe zu: **https://github.com/new**

Fülle folgende Felder aus:
- **Repository name**: `King_Finder_Scraper`
- **Description**: `🍔 Scraper for all Burger King locations in Germany with GPS coordinates | Built with Playwright & TypeScript`
- **Visibility**: ✅ Public
- **Initialize**: ❌ NICHT "Add a README file" ankreuzen

Klicke auf **"Create repository"**

### 2. Code hochladen

Öffne dein Terminal im Projektordner und führe aus:

```bash
cd King_Finder_Scraper

# Remote Repository hinzufügen
git remote add origin https://github.com/deinusername/King_Finder_Scraper.git

# Branch umbenennen (falls nötig)
git branch -M main

# Code hochladen
git push -u origin main
```

**Wichtig**: Ersetze `deinusername` mit deinem GitHub Benutzernamen!

### 3. Fertig! ✅

Dein Repository ist jetzt online unter:
`https://github.com/deinusername/King_Finder_Scraper`

---

## 📦 Lokaler Status

✅ Git Repository initialisiert
✅ 3 Commits erstellt
✅ Alle Dateien bereit zum Upload

### Commits:
1. Initial commit: King Finder Scraper - Grundstruktur
2. Add MIT License
3. Add setup instructions
4. Fix TypeScript types and add test script

---

## 🛠️ Scraper ausführen

Nach dem Upload kann jeder mit:

```bash
git clone https://github.com/deinusername/King_Finder_Scraper.git
cd King_Finder_Scraper
npm install
npm run dev
```

den Scraper ausführen und die Daten herunterladen!
