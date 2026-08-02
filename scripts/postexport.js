// Post-procesa el export web de Expo para el deploy en Vercel:
//  1. Inyecta las etiquetas PWA en dist/index.html.
//  2. Renombra las carpetas "node_modules" dentro de dist/assets a "nm" y
//     actualiza las referencias, porque Vercel ignora cualquier ruta que
//     contenga "node_modules" (por eso las fuentes de iconos daban 404).
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) {
  console.error('No se encontro dist/. Ejecuta primero el export web.');
  process.exit(1);
}

// --- 1. Inyectar etiquetas PWA ---
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const pwaTags = `
    <meta name="theme-color" content="#ffffff" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="StockIt" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon.png" />
`;
  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', `${pwaTags}  </head>`);
    fs.writeFileSync(indexPath, html);
    console.log('Etiquetas PWA inyectadas en dist/index.html');
  }
}

// --- 2. Eliminar "node_modules" de las rutas de assets ---
// Reemplaza las referencias "/node_modules/" -> "/nm/" en archivos de texto.
const TEXT_EXT = ['.js', '.html', '.css', '.json', '.map'];
function replaceRefs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceRefs(full);
    } else if (TEXT_EXT.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('/node_modules/')) {
        fs.writeFileSync(full, content.split('/node_modules/').join('/nm/'));
      }
    }
  }
}
replaceRefs(distDir);

// Renombra fisicamente las carpetas "node_modules" -> "nm" (de mas profunda a menos).
function renameDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      renameDirs(path.join(dir, entry.name));
    }
  }
  const base = path.basename(dir);
  if (base === 'node_modules') {
    const target = path.join(path.dirname(dir), 'nm');
    fs.renameSync(dir, target);
    console.log('Renombrado', path.relative(distDir, dir), '->', path.relative(distDir, target));
  }
}
renameDirs(distDir);

console.log('Post-export completado (PWA + fix node_modules para Vercel).');
