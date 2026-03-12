import { promises as fs } from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const DEFAULT_SITE_URL = 'https://vtime.pro';
const SITEMAP_CONFIG_PATH = path.resolve('vite/sitemap.config.json');

function normalizeBaseUrl(url) {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  return withProtocol.endsWith('/') ? withProtocol : `${withProtocol}/`;
}

function toRoute(filePath) {
  const normalized = filePath.split(path.sep).join('/');

  if (normalized === 'index.html') {
    return '/';
  }

  if (normalized.endsWith('/index.html')) {
    return `/${normalized.replace('/index.html', '/')}`;
  }

  return `/${normalized.replace(/\.html$/, '')}`;
}

function escapeRegex(pattern) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePattern(pattern) {
  const trimmedPattern = pattern.trim();

  if (trimmedPattern === '/') {
    return '/';
  }

  const normalizedPattern = trimmedPattern.startsWith('/') ? trimmedPattern : `/${trimmedPattern}`;

  return normalizedPattern.length > 1 && normalizedPattern.endsWith('/')
    ? normalizedPattern.slice(0, -1)
    : normalizedPattern;
}

function isRouteExcluded(route, excludedRoutes) {
  const normalizedRoute = normalizePattern(route);

  return excludedRoutes.some((pattern) => {
    const normalizedPattern = normalizePattern(pattern);

    if (!normalizedPattern.includes('*')) {
      return normalizedRoute === normalizedPattern;
    }

    const regexPattern = `^${escapeRegex(normalizedPattern).replace(/\\\*/g, '.*')}$`;
    return new RegExp(regexPattern).test(normalizedRoute);
  });
}

async function loadSitemapConfig() {
  try {
    const rawConfig = await fs.readFile(SITEMAP_CONFIG_PATH, 'utf8');
    const parsedConfig = JSON.parse(rawConfig);
    const excludedRoutes = Array.isArray(parsedConfig.excludedRoutes)
      ? parsedConfig.excludedRoutes
        .filter((route) => typeof route === 'string')
        .map((route) => route.trim())
        .filter(Boolean)
      : [];

    return { excludedRoutes };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { excludedRoutes: [] };
    }

    throw error;
  }
}

async function getHtmlFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getHtmlFiles(fullPath, baseDir);
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      return [path.relative(baseDir, fullPath)];
    }

    return [];
  }));

  return files.flat();
}

async function generateSitemap(siteUrl) {
  const { excludedRoutes } = await loadSitemapConfig();
  const htmlFiles = await getHtmlFiles(DIST_DIR);
  const urls = htmlFiles
    .map((filePath) => ({
      route: toRoute(filePath),
      sourcePath: path.join(DIST_DIR, filePath),
    }))
    .filter(({ route }) => !isRouteExcluded(route, excludedRoutes))
    .sort((a, b) => a.route.localeCompare(b.route));

  const lines = await Promise.all(urls.map(async ({ route, sourcePath }) => {
    const stats = await fs.stat(sourcePath);
    const lastModified = stats.mtime.toISOString().split('T')[0];
    const location = new URL(route, siteUrl).toString();

    return [
      '  <url>',
      `    <loc>${location}</loc>`,
      `    <lastmod>${lastModified}</lastmod>`,
      '  </url>',
    ].join('\n');
  }));

  const sitemapContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lines,
    '</urlset>',
    '',
  ].join('\n');

  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
}

async function generateRobots(siteUrl) {
  const robotsContent = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap.xml', siteUrl).toString()}`,
    '',
  ].join('\n');

  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), robotsContent, 'utf8');
}

async function main() {
  const siteUrl = normalizeBaseUrl(process.env.SITE_URL || DEFAULT_SITE_URL);

  await generateSitemap(siteUrl);
  await generateRobots(siteUrl);

  console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
}

main().catch((error) => {
  console.error('Failed to generate sitemap.xml and robots.txt');
  console.error(error);
  process.exit(1);
});
