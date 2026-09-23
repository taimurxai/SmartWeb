const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'components'];

const classReplacements = {
  // Backgrounds
  'bg-\\[#0a0a0f\\]': 'bg-surface-secondary',
  'bg-slate-950': 'bg-surface-secondary',
  'bg-slate-950/70': 'bg-surface-secondary',
  'bg-slate-950/80': 'bg-surface-secondary',
  'bg-slate-900': 'bg-surface-primary',
  'bg-slate-900/70': 'bg-surface-primary',
  'bg-slate-900/90': 'bg-surface-primary',
  'bg-slate-800': 'bg-surface-primary',
  'bg-slate-800/60': 'bg-surface-primary',
  'bg-blue-600': 'bg-accent',
  'bg-blue-500': 'bg-accent',
  'bg-brand-500': 'bg-accent',
  'hover:bg-brand-600': 'hover:opacity-90',
  'hover:bg-slate-800': 'hover:bg-surface-secondary',
  'bg-white/5': 'bg-surface-primary',
  'bg-white/10': 'bg-surface-secondary',
  'hover:bg-white/10': 'hover:bg-surface-secondary',
  'glass-card': 'bg-surface-primary',
  'glass-input': 'bg-surface-secondary',
  'glass-panel': 'bg-surface-primary',
  
  // Text colors
  'text-white': 'text-text-primary',
  'hover:text-white': 'hover:text-text-primary',
  'text-slate-100': 'text-text-primary',
  'text-slate-200': 'text-text-primary',
  'text-slate-300': 'text-text-secondary',
  'text-slate-400': 'text-text-muted',
  'text-slate-400/80': 'text-text-muted',
  'text-slate-500': 'text-text-faint',
  'text-slate-600': 'text-text-tertiary',
  'text-blue-400': 'text-info',
  'text-blue-500': 'text-info',
  'text-brand-300': 'text-accent',
  'text-rose-500': 'text-error',
  'text-rose-400': 'text-error',
  'text-emerald-500': 'text-success',
  'text-emerald-400': 'text-success',
  'placeholder-slate-500': 'placeholder-text-faint',

  // Borders
  'border-slate-800': 'border-border-subtle',
  'border-slate-800/80': 'border-border-subtle',
  'border-slate-800/90': 'border-border-subtle',
  'border-slate-800/50': 'border-border-faint',
  'border-slate-700': 'border-border-subtle',
  'border-white/5': 'border-border-subtle',
  'border-white/10': 'border-border-subtle',
  'border-slate-950': 'border-surface-secondary',
  'focus:border-blue-500/60': 'focus:border-accent',
  'focus:ring-blue-500/30': 'focus:ring-accent',
  
  // Radii
  'rounded-2xl': 'rounded-pill',
  'rounded-xl': 'rounded-md',
  'rounded-lg': 'rounded-sm',
  
  // Shadows
  'shadow-card': 'shadow-sm',
  'shadow-elevated': 'shadow-md',
  'shadow-glow': 'shadow-sm',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Apply string replacements matching whole words/classes
  for (const [oldClass, newClass] of Object.entries(classReplacements)) {
    // Need to handle regex special chars in keys, but keys in JS object might have it
    const escapedClass = oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=\\s|["'\`])${escapedClass}(?=\\s|["'\`])`, 'g');
    content = content.replace(regex, newClass);
  }
  
  // Replace arbitrary rgba/hex text/bg that looks dark theme oriented
  content = content.replace(/bg-opacity-\d+/g, '');
  content = content.replace(/text-opacity-\d+/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) walkDir(dir);
});
