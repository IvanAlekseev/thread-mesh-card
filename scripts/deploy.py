#!/usr/bin/env python3
import os, json, subprocess, sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Read version from package.json
pkg_file = os.path.join(root_dir, 'package.json')
version = '0.1.0'
if os.path.exists(pkg_file):
    try:
        with open(pkg_file, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
            version = pkg.get('version', '0.1.0')
    except Exception:
        pass

# 1. Run build script
build_script = os.path.join(os.path.dirname(__file__), 'build.py')
res = subprocess.run([sys.executable, build_script])
if res.returncode != 0:
    print("[ERROR] Build failed, aborting deployment.")
    sys.exit(1)

dist_file = os.path.join(root_dir, 'dist', 'thread-mesh-card.js')
if not os.path.exists(dist_file):
    print(f"[ERROR] Dist file not found at {dist_file}")
    sys.exit(1)

# 2. Resolve target Home Assistant host
ha_host = os.environ.get('HASS_HOST', '192.168.5.100')
ha_user = os.environ.get('HASS_USER', 'root')
ha_dest = os.environ.get('HASS_DEST', '/homeassistant/www/thread-mesh-card.js')

print(f"[DEPLOY] Deploying Thread Mesh Card v{version} to {ha_user}@{ha_host}:{ha_dest}...")
scp_cmd = [
    'scp',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ConnectTimeout=5',
    dist_file,
    f'{ha_user}@{ha_host}:{ha_dest}'
]

deploy_res = subprocess.run(scp_cmd)
if deploy_res.returncode == 0:
    print(f"[SUCCESS] Deployed Thread Mesh Card v{version} to {ha_host} successfully.")
else:
    print(f"[WARNING] SCP exited with code {deploy_res.returncode}. Verify SSH connectivity to {ha_host}.")
    sys.exit(deploy_res.returncode)
