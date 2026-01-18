# Scoreboard Landing Page

Landing page for [Scoreboard](https://apps.apple.com/app/id1453457844), a free score tracking app for iPhone and iPad.

**Live:** https://flexscoreboard.kosukeohmura.com

Vanilla static HTML with inline CSS and JS. No frameworks, no dependencies.

## File Structure

```
_src/
  base.html          # Template
  translations.json  # Translations for all languages
  build.js           # Build script
index.html           # Generated (English)
ja/index.html        # Generated (Japanese)
zh/index.html        # Generated (Chinese)
...                  # Other languages
```

Files in `_src/` are source files. All `index.html` files are generated and should not be edited directly.

## Editing

1. Edit `_src/base.html` (template) or `_src/translations.json` (text, adding a language)
2. Run `node _src/build.js` to regenerate all pages
3. (Optional, for new languages) Download localized App Store badge from [Apple Marketing Resources](https://developer.apple.com/app-store/marketing/guidelines/) and add SVG to the language directory
