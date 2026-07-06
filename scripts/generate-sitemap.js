import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const domain = 'https://gift-planner.ba-tools.cc'
const routes = ['gift-recommendation', 'bond-calculator']
const langConfigs = {
  'en': 'en',
  'zh-tw': 'zh-Hant',
  'zh-cn': 'zh-Hans',
  'ja': 'ja',
  'ko': 'ko'
}

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

for (const route of routes) {
  xml += `\n  <!-- Route: /${route} -->`
  for (const lang of Object.keys(langConfigs)) {
    const loc = `${domain}/${route}?lang=${lang}`
    xml += `\n  <url>\n    <loc>${loc}</loc>`
    
    // Generates hreflang alternates
    for (const [lKey, lVal] of Object.entries(langConfigs)) {
      xml += `\n    <xhtml:link rel="alternate" hreflang="${lVal}" href="${domain}/${route}?lang=${lKey}"/>`
    }
    // x-default fallback
    xml += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}/${route}?lang=en"/>`
    
    const priority = route === 'gift-recommendation' ? '1.0' : '0.8'
    xml += `\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  }
}

xml += '\n</urlset>\n'

// Write to public/ directory for tracking in repository
const publicDir = path.join(__dirname, '../public')
const distDir = path.join(__dirname, '../dist')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8')
console.log('Sitemap.xml generated in public/ directory successfully.')

// Write to dist/ directory if it exists (so that it gets included in the wrangler assets build output)
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8')
  console.log('Sitemap.xml copied to dist/ directory successfully.')
}
