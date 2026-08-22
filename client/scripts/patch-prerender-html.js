/**
 * После react-snap: убирает статичные meta/canonical/JSON-LD главной
 * с внутренних HTML, оставляя теги Helmet (data-rh).
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');

const HOME_REL_PATHS = new Set(['index.html', 'ru/index.html']);

function hasHelmetCanonical(html) {
  return /rel=["']canonical["'][^>]*data-rh=|<link[^>]*data-rh=["']true["'][^>]*rel=["']canonical["']/.test(
    html
  );
}

function dropStaticTags(html, pattern) {
  return html.replace(pattern, (tag) => (/data-rh=/.test(tag) ? tag : ''));
}

function dedupeHelmetHead(html) {
  if (!hasHelmetCanonical(html) && !/name=["']description["'][^>]*data-rh=/.test(html)) {
    return html;
  }

  let out = html;
  out = dropStaticTags(out, /<link\s+rel=["']canonical["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+name=["']description["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+name=["']keywords["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+name=["']robots["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+name=["']googlebot["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+http-equiv=["']content-language["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi);
  out = dropStaticTags(out, /<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi);
  return out;
}

function stripHomepageFallbacks(html) {
  let out = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');
  out = out.replace(
    /<script type=["']application\/ld\+json["'](?![^>]*data-rh)[^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  return out;
}

function isHomeRelPath(relPath) {
  return HOME_REL_PATHS.has(String(relPath || '').replace(/\\/g, '/'));
}

function patchPrerenderHtml(html, relPath) {
  let out = dedupeHelmetHead(html);
  if (!isHomeRelPath(relPath)) {
    out = stripHomepageFallbacks(out);
  }
  return out;
}

function walkHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(full, acc);
    } else if (entry.name === 'index.html') {
      acc.push(full);
    }
  }
  return acc;
}

function patchBuild(buildDir = BUILD_DIR) {
  const files = walkHtmlFiles(buildDir);
  files.forEach((file) => {
    const rel = path.relative(buildDir, file);
    const before = fs.readFileSync(file, 'utf8');
    const after = patchPrerenderHtml(before, rel);
    if (after !== before) {
      fs.writeFileSync(file, after);
    }
  });
  return files.length;
}

if (require.main === module) {
  if (!fs.existsSync(BUILD_DIR)) {
    console.warn('patch-prerender-html: build/ not found, skip');
    process.exit(0);
  }
  const count = patchBuild();
  console.log(`patch-prerender-html: cleaned ${count} html files`);
}

module.exports = {
  dedupeHelmetHead,
  stripHomepageFallbacks,
  patchPrerenderHtml,
  isHomeRelPath,
  patchBuild,
};
