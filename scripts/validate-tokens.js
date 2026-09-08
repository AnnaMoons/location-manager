#!/usr/bin/env node
/**
 * Adapted from vendor/asimetrix-ds/scripts/validate-tokens.js for this app's own
 * app/ and components/ trees (.tsx, not .jsx). Fails on hardcoded hex colors,
 * rgba()/rgb() with literal digits, and arbitrary Tailwind color/spacing classes
 * not covered by the documented exceptions below.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['app', 'components'].map((d) => path.join(ROOT, d));
const HEX_PATTERN = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
const RGBA_PATTERN = /\brgba?\(\s*\d/g;

/* Arbitrary Tailwind class detector — same shape as the DS's own validator. */
const ARBITRARY_CLASS_PATTERN = /(?<![\w:])(?:-)?[a-z]+(?:-[a-z]+)*-\[[^\]]+\]/gi;
const ARBITRARY_ALLOWLIST = [
  // Tailwind *variant* syntax (data-[...]/aria-[...] attribute selectors), not an arbitrary
  // *value* — these drive Radix's data-state/aria-invalid styling and have nothing to do with
  // hardcoded colors/spacing. Excluded wholesale, with or without group-/peer- composition.
  /^(?:group-|peer-)?data-\[/,
  /^(?:group-|peer-)?aria-\[/,
  // Border-widths fraccionarios de sistema (mismo criterio que el DS: AGENTS.md upstream).
  /^border(?:-[trblxy])?-\[1\.5px\]$/,
  /^border(?:-[trblxy])?-\[2\.5px\]$/,
  /^border(?:-[trblxy])?-\[3px\]$/,
  /^border(?:-[trblxy])?-\[5px\]$/,
  /^[wh]-\[1\.5px\]$/,
  // Cálculos posicionales / responsive dinámicos.
  /^-?(?:left|right|top|bottom)-\[calc\(/,
  /^-?m[tlrbxy]?-\[-?[\d.]+rem\]$/,
  /^transition-\[/,
  /^duration-\[/,
  /^(?:group-|peer-)?(?:not|has|is|where)-\[/,
  /-\[(inherit|initial|unset|revert)\]$/,
  /^grid-cols-\[/,
  /^grid-rows-\[/,
  /^max-[wh]-\[(min|max|calc)\(/,
  /^max-[wh]-\[\d+vh\]$/,
  /^max-[wh]-\[\d+vw\]$/,
  /^flex-\[[\d_a-z%]+\]$/,
  // Radix CSS custom properties surfaced as arbitrary values (Select/Popover width/height match).
  /-\[var\(--radix-/,
  // z-index for the Leaflet map overlay controls (components/locations/MapComponent.tsx) — a
  // third-party stacking context, not one of the DS's semantic z-* layers (tooltip/modal/etc).
  /^z-\[1000\]$/,
  // Touch-target minimum width (components/shared/MobileNav.tsx) — accessibility sizing, not a
  // color/spacing token concern.
  /^min-w-\[64px\]$/,
  // Fixed pixel dimensions for brand assets (logo lockup in app/(dashboard)/layout.tsx) — not
  // a color/spacing token concern, just the asset's native size.
  /^[wh]-\[(22|48)px\]$/,
];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function findTsxFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function isLineComment(line) {
  return line.trim().startsWith('//');
}

function isInCommentBlock(line, inComment) {
  const trimmed = line.trim();
  if (trimmed.includes('/*')) inComment = true;
  if (trimmed.includes('*/')) return { inComment: false, isComment: true };
  if (inComment) return { inComment, isComment: true };
  return { inComment, isComment: false };
}

function removeInlineComments(line) {
  const commentIndex = line.indexOf('//');
  if (commentIndex !== -1) {
    const beforeComment = line.substring(0, commentIndex);
    const singleQuotes = (beforeComment.match(/'/g) || []).length;
    const doubleQuotes = (beforeComment.match(/"/g) || []).length;
    const backticks = (beforeComment.match(/`/g) || []).length;
    if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0) {
      return beforeComment;
    }
  }
  return line;
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];
  let inCommentBlock = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const commentCheck = isInCommentBlock(line, inCommentBlock);
    inCommentBlock = commentCheck.inComment;
    if (isLineComment(line) || commentCheck.isComment) return;

    const cleanLine = removeInlineComments(line);

    for (const match of cleanLine.matchAll(HEX_PATTERN)) {
      violations.push({ line: lineNumber, content: line.trim(), match: match[0], column: match.index, kind: 'hex' });
    }

    for (const match of cleanLine.matchAll(ARBITRARY_CLASS_PATTERN)) {
      const cls = match[0];
      if (ARBITRARY_ALLOWLIST.some((rx) => rx.test(cls))) continue;
      violations.push({ line: lineNumber, content: line.trim(), match: cls, column: match.index, kind: 'arbitrary' });
    }

    if (!cleanLine.includes('var(')) {
      for (const match of cleanLine.matchAll(RGBA_PATTERN)) {
        violations.push({ line: lineNumber, content: line.trim(), match: match[0].trim(), column: match.index, kind: 'rgba' });
      }
    }

    if (/style=\{\{/.test(cleanLine)) {
      // Excepción documentada (AGENTS.md regla 3): un comentario "// dinámico: motivo" en la
      // línea anterior justifica el style={{}} cuando depende de props imposibles de expresar
      // en clases (ver StepIndicator/LocationCard/NextActionCTA).
      const prevLine = index > 0 ? lines[index - 1].trim() : '';
      if (!/^\/\/\s*din[aá]mico:/i.test(prevLine)) {
        violations.push({ line: lineNumber, content: line.trim(), match: 'style={{', column: cleanLine.indexOf('style={{'), kind: 'inline-style' });
      }
    }
  });

  return violations;
}

function formatViolation(filePath, violation) {
  const relativePath = path.relative(ROOT, filePath);
  const location = `${relativePath}:${violation.line}`;
  const pointer = ' '.repeat(Math.max(violation.column, 0)) + '^'.repeat(violation.match.length);
  const labels = {
    arbitrary: `Clase arbitraria Tailwind detectada: ${violation.match}`,
    hex: `Hex hardcodeado detectado: ${violation.match}`,
    rgba: `rgba/rgb con valor literal detectado: ${violation.match}...`,
    'inline-style': 'Inline style={{}} detectado',
  };
  const hints = {
    arbitrary: 'Reemplaza por una utility derivada de @theme (ver vendor/asimetrix-ds/app/globals.css).',
    hex: 'Usa una clase Tailwind semántica (bg-brand-primary, text-fg, etc.).',
    rgba: 'Usa un token de color (bg-overlay-bg, etc.) en vez de rgba() literal.',
    'inline-style': 'Usa clases Tailwind; si el valor es dinámico documenta por qué con un comentario.',
  };
  return `${RED}❌ ${location}${RESET}\n   ${violation.content}\n   ${pointer}\n   ${YELLOW}${labels[violation.kind]}${RESET}\n   ${hints[violation.kind]}\n`;
}

function main() {
  console.log(`${YELLOW}🔍 Validando tokens en app/ y components/...${RESET}\n`);

  const tsxFiles = SCAN_DIRS.flatMap((d) => findTsxFiles(d));
  console.log(`📂 Archivos a validar: ${tsxFiles.length}\n`);

  let totalViolations = 0;
  const violationsByFile = [];

  tsxFiles.forEach((filePath) => {
    const violations = validateFile(filePath);
    if (violations.length > 0) {
      totalViolations += violations.length;
      violationsByFile.push({ filePath, violations });
    }
  });

  if (totalViolations === 0) {
    console.log(`${GREEN}✅ Validación exitosa: 0 violaciones encontradas.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Validación fallida: ${totalViolations} violación(es) encontrada(s).\n${RESET}`);
    violationsByFile.forEach(({ filePath, violations }) => {
      violations.forEach((violation) => console.log(formatViolation(filePath, violation)));
    });
    console.log(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${RED}Total: ${totalViolations} violación(es) en ${violationsByFile.length} archivo(s)${RESET}`);
    process.exit(1);
  }
}

main();
