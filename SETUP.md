# 📦 GitHub Repository Setup

## Option 1: Mit GitHub CLI (empfohlen)

```bash
# GitHub CLI installieren (falls noch nicht vorhanden)
# Download: https://cli.github.com/

# In das Projektverzeichnis wechseln
cd King_Finder_Scraper

# Repository erstellen und hochladen
gh repo create King_Finder_Scraper --public --source=. --description "🍔 Scraper for all Burger King locations in Germany with GPS coordinates" --push
```

## Option 2: Manuell über GitHub Web Interface

### Schritt 1: Repository auf GitHub erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository Name: `King_Finder_Scraper`
3. Description: `🍔 Scraper for all Burger King locations in Germany with GPS coordinates`
4. Visibility: **Public**
5. **NICHT** "Initialize this repository with a README" ankreuzen
6. Klicke auf "Create repository"

### Schritt 2: Code hochladen

Führe folgende Befehle in deinem Terminal aus:

```bash
cd King_Finder_Scraper

# Remote Repository hinzufügen (ersetze 'philippwatzke' mit deinem GitHub Username)
git remote add origin https://github.com/philippwatzke/King_Finder_Scraper.git

# Code hochladen
git branch -M main
git push -u origin main
```

## ✅ Fertig!

Dein Repository ist jetzt online unter:
`https://github.com/philippwatzke/King_Finder_Scraper`

## 🚀 Scraper ausführen

```bash
npm install
npm run dev
```
