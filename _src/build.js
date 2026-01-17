#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const BASE_URL = 'https://flexscoreboard.kosukeohmura.com';

// Read template and translations
const template = fs.readFileSync(path.join(__dirname, 'base.html'), 'utf8');
const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf8'));

const languages = Object.keys(translations);

function buildHeroTitleHtml(heroTitle) {
  // All parts except the last one, joined with <br>
  const regularParts = heroTitle.slice(0, -1).join('<br>\n        ');
  const accentPart = heroTitle[heroTitle.length - 1];
  return `${regularParts}<br>\n        <span class="accent">${accentPart}</span>`;
}

function buildHreflangTags() {
  const tags = languages.map(l =>
    `<link rel="alternate" hreflang="${l}" href="${BASE_URL}${translations[l].path}">`
  );
  tags.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/">`);
  return tags.join('\n  ');
}

function buildLangOptions(currentLang) {
  return languages.map(l => {
    const selected = l === currentLang ? ' selected' : '';
    return `<option value="${translations[l].path}"${selected}>${translations[l].langName}</option>`;
  }).join('\n        ');
}

function buildAppStoreUrl(lang) {
  const langParam = lang.toLowerCase().replace(/[^a-z]/g, '');
  return `https://apps.apple.com/app/apple-store/id1453457844?pt=119669481&ct=lp_${langParam}&mt=8`;
}

function buildPage(lang) {
  const t = translations[lang];
  let html = template;

  // Replace all placeholders
  const replacements = {
    '{{lang}}': lang,
    '{{ogLocale}}': t.ogLocale,
    '{{title}}': t.title,
    '{{appName}}': t.appName,
    '{{metaDescription}}': t.metaDescription,
    '{{heroDescription}}': t.heroDescription,
    '{{downloads}}': t.downloads,
    '{{worldwide}}': t.worldwide,
    '{{contact}}': t.contact,
    '{{rootPath}}': t.rootPath,
    '{{canonicalUrl}}': `${BASE_URL}${t.path}`,
    '{{heroTitleHtml}}': buildHeroTitleHtml(t.heroTitle),
    '{{hreflangTags}}': buildHreflangTags(),
    '{{langOptions}}': buildLangOptions(lang),
    '{{appStoreUrl}}': buildAppStoreUrl(lang),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value);
  }

  return html;
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Remove read-only if file exists
  if (fs.existsSync(filePath)) {
    fs.chmodSync(filePath, 0o644);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  fs.chmodSync(filePath, 0o444);
  console.log(`Generated: ${path.relative(ROOT_DIR, filePath)}`);
}

// Build all pages
console.log('Building multi-language pages...\n');

const generatedFiles = [];

for (const lang of languages) {
  const html = buildPage(lang);
  const outputPath = lang === 'en'
    ? path.join(ROOT_DIR, 'index.html')
    : path.join(ROOT_DIR, lang, 'index.html');

  writeFile(outputPath, html);
  generatedFiles.push(outputPath);
}

console.log('\nBuild complete!');
console.log(`Generated ${generatedFiles.length} files.`);
