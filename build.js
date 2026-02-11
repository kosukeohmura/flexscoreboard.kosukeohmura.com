#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, 'docs');
const BASE_URL = 'https://flexscoreboard.kosukeohmura.com';

// Read template and translations
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const translations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf8'));

const languages = Object.keys(translations).filter(k => k !== '$schema');

function buildHeroTitleHtml(heroTitle) {
  // All parts except the last one, joined with <br>
  const regularParts = heroTitle.slice(0, -1).join('<br>\n        ');
  const accentPart = heroTitle[heroTitle.length - 1];
  return `${regularParts}<br>\n        <span class="accent">${accentPart}</span>`;
}

function buildHreflangTags() {
  const tags = [];

  for (const lang of languages) {
    const t = translations[lang];
    const url = `${BASE_URL}${t.path}`;

    // Use custom hreflangTags if specified, otherwise use the language key
    const hreflangValues = t.hreflangTags || [lang];

    for (const hreflang of hreflangValues) {
      tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${url}">`);
    }
  }

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

function buildSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = languages.map(lang => {
    const url = `${BASE_URL}${translations[lang].path}`;
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
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
    '{{feature1Title}}': t.feature1Title || '',
    '{{feature1Desc}}': t.feature1Desc || '',
    '{{feature2Title}}': t.feature2Title || '',
    '{{feature2Desc}}': t.feature2Desc || '',
    '{{feature3Title}}': t.feature3Title || '',
    '{{feature3Desc}}': t.feature3Desc || '',
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

  // Add "do not edit" comment at the top
  return `<!-- DO NOT EDIT - Generated from template.html -->\n${html}`;
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

  // Ensure trailing newline
  if (!content.endsWith('\n')) {
    content += '\n';
  }
  fs.writeFileSync(filePath, content, 'utf8');
  fs.chmodSync(filePath, 0o444);
  console.log(`Generated: ${path.relative(DOCS_DIR, filePath)}`);
}

// Build all pages
console.log('Building multi-language pages...\n');

const generatedFiles = [];

for (const lang of languages) {
  const html = buildPage(lang);
  const outputPath = lang === 'en'
    ? path.join(DOCS_DIR, 'index.html')
    : path.join(DOCS_DIR, lang, 'index.html');

  writeFile(outputPath, html);
  generatedFiles.push(outputPath);
}

// Generate sitemap.xml
writeFile(path.join(DOCS_DIR, 'sitemap.xml'), buildSitemap());

// Generate robots.txt
writeFile(path.join(DOCS_DIR, 'robots.txt'), buildRobotsTxt());

console.log('\nBuild complete!');
console.log(`Generated ${generatedFiles.length + 2} files.`);
