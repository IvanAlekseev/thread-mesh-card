#!/usr/bin/env python3
import os, json, re, sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src_dir = os.path.join(root_dir, 'src')
dist_dir = os.path.join(root_dir, 'dist')
os.makedirs(dist_dir, exist_ok=True)
out_file = os.path.join(dist_dir, 'thread-mesh-card.js')

# Read version from package.json
pkg_file = os.path.join(root_dir, 'package.json')
version = '0.1.6'
if os.path.exists(pkg_file):
    try:
        with open(pkg_file, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
            version = pkg.get('version', '0.1.6')
    except Exception:
        pass

modules = [
    'constants.js',
    'styles.js',
    'utils.js',
    'topology.js',
    'physics.js',
    'hud.js',
    'controls.js',
    'thread-mesh-card.js'
]

combined = [
    f"/**\n * Thread Mesh Topology Card for Home Assistant v{version}\n * (c) 2026 Ivan Alekseev (MIT License)\n */\n(function () {{\n  'use strict';\n"
]

for mod in modules:
    path = os.path.join(src_dir, mod)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # 1. Strip all multiline and single-line ES6 import statements
    code = re.sub(r'import\s+[\s\S]*?from\s+[\'"][^\'"]+[\'"];?\n?', '', code)
    
    # 2. Strip export keywords
    code = re.sub(r'^\s*export\s+(const|let|var|function|async\s+function|class)\s+', r'\1 ', code, flags=re.MULTILINE)
    code = re.sub(r'^\s*export\s+default\s+', '', code, flags=re.MULTILINE)
    
    # 3. Update CARD_VERSION constant
    code = re.sub(r'^\s*(const|let|var)\s+CARD_VERSION\s*=\s*[\'"][^\'"]+[\'"];?', f"const CARD_VERSION = '{version}';", code, flags=re.MULTILINE)

    lines = [('  ' + l if l.strip() else '') for l in code.splitlines()]
    
    combined.append(f"\n  // ===========================================================================")
    combined.append(f"  // Module: {mod}")
    combined.append(f"  // ===========================================================================\n")
    combined.append('\n'.join(lines))

combined.append("\n})();\n")

bundle_content = '\n'.join(combined)

# Verification check: Ensure zero stray "from './" or "import " remains
stray_imports = re.findall(r'(\bimport\b|\bfrom\s+[\'"][^\'"]+[\'"])', bundle_content)
if stray_imports:
    print(f"[ERROR] Stray module keywords found in bundle: {stray_imports}", file=sys.stderr)
    sys.exit(1)

with open(out_file, 'w', encoding='utf-8') as f:
    f.write(bundle_content)

print(f"[OK] Built modular v{version} -> {out_file} ({os.path.getsize(out_file)} bytes) - Zero stray module syntax.")
