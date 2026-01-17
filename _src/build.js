#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const BASE_URL = 'https://flexscoreboard.kosukeohmura.com';

// Read template and translations
const template = fs.readFileSync(path.join(__dirname, 'base.html'), 'utf8');
const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf8'));

const languages = ['en', 'ja', 'zh', 'th'];

function buildHeroTitleHtml(heroTitle) {
  // All parts except the last one, joined with <br>
  const regularParts = heroTitle.slice(0, -1).join('<br>\n        ');
  const accentPart = heroTitle[heroTitle.length - 1];
  return `${regularParts}<br>\n        <span class="accent">${accentPart}</span>`;
}

function buildPage(lang) {
  const t = translations[lang];
  let html = template;

  // Replace all placeholders
  const replacements = {
    '{{lang}}': t.lang,
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
    '{{langLinkEn}}': lang === 'en' ? 'aria-current="page"' : '',
    '{{langLinkJa}}': lang === 'ja' ? 'aria-current="page"' : '',
    '{{langLinkZh}}': lang === 'zh' ? 'aria-current="page"' : '',
    '{{langLinkTh}}': lang === 'th' ? 'aria-current="page"' : '',
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
