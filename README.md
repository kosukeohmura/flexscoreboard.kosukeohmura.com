# Scoreboard Landing Page

Landing page for [Scoreboard](https://apps.apple.com/app/id1453457844), a free score tracking app for iPhone and iPad.

**Live:** https://flexscoreboard.kosukeohmura.com

Vanilla static HTML with inline CSS and JS. No frameworks, no dependencies.

## File Structure

```
template.html             # Template
translations.json         # Translations for all languages
translations.schema.json  # Schema for translations.json
build.js                  # Build script
docs/
  index.html         # Generated (English)
  ja/index.html      # Generated (Japanese)
  zh/index.html      # Generated (Chinese)
  ...                # Other languages
  sitemap.xml        # Generated
  robots.txt         # Generated
```

Source files are at root. All files in `docs/` are generated and should not be edited directly.

## Editing

1. Edit `template.html` or `translations.json` (text, adding a language)
2. Run `node build.js` to regenerate all pages
3. (Optional, for new languages) Download localized App Store badge from [Apple Marketing Resources](https://developer.apple.com/app-store/marketing/guidelines/) and add SVG to `docs/<lang>/`
