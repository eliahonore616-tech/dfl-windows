/*
 * Gestion des agents DSFL — Copyright © 2026 Direction de Suivi des Finances Locales. Tous droits réservés.
 * Logiciel propriétaire : copie, modification, diffusion et décompilation interdites
 * sans autorisation écrite de l'auteur. Voir LICENSE.txt.
 */
/* Copie la police Montserrat et les modules de lecture/export (Excel, Word, PDF) dans www/ */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), nm = path.join(root, 'node_modules'), www = root;
const jobs = [
  ['@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2', 'fonts/montserrat-latin-wght-normal.woff2'],
  ['@fontsource-variable/montserrat/files/montserrat-latin-ext-wght-normal.woff2', 'fonts/montserrat-latin-ext-wght-normal.woff2'],
  ['xlsx/dist/xlsx.full.min.js', 'lib/xlsx.full.min.js'],
  ['mammoth/mammoth.browser.min.js', 'lib/mammoth.browser.min.js'],
  ['pdfjs-dist/build/pdf.min.js', 'lib/pdf.min.js'],
  ['pdfjs-dist/build/pdf.worker.min.js', 'lib/pdf.worker.min.js']
];
jobs.forEach(([from, to]) => {
  const src = path.join(nm, from), dst = path.join(www, to);
  if (!fs.existsSync(src)) { console.warn('Absent (ignoré) :', from); return; }
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); console.log('OK', to);
});
