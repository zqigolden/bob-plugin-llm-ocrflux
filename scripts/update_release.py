import sys
import hashlib
import json
from pathlib import Path
import zipfile

def build_plugin(version):
    """Builds the .bobplugin file from the src directory."""
    src_dir = Path('src')
    release_dir = Path('release')
    
    # Clean up old plugin files
    if release_dir.exists():
        for old_plugin in release_dir.glob('*.bobplugin'):
            print(f"Removing old plugin file: {old_plugin.name}")
            old_plugin.unlink()
    else:
        release_dir.mkdir()
    
    plugin_file_name = f'llm-ocr-{version}.bobplugin'
    plugin_path = release_dir / plugin_file_name
    
    files_to_zip = [f for f in src_dir.iterdir() if f.is_file()]

    with zipfile.ZipFile(plugin_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file in files_to_zip:
            zf.write(file, file.name)
    print(f"Successfully built {plugin_path}")


def update_appcast(version, desc):
    """Updates the appcast.json file with the new version details."""
    release_file = Path(f'release/llm-ocr-{version}.bobplugin')
    assert release_file.is_file(), f'Release file not exist: {release_file}'
    with open(release_file, 'rb') as f:
        c = f.read()
        file_hash = hashlib.sha256(c).hexdigest()
    version_info = {
        'version': version,
        'desc': desc,
        'sha256': file_hash,
        'url': f'https://github.com/zqigolden/bob-plugin-llm-ocrflux/releases/download/v{version}/{release_file.name}',
        'minBobVersion': '1.8.0'
    }
    appcast_file = Path('appcast.json')
    if appcast_file.is_file():
        with open(appcast_file, 'r') as f:
            appcast = json.load(f)
    else:
        appcast = dict(identifier='henry.llm.ocr', versions=[])
    
    appcast['versions'] = [v for v in appcast['versions'] if v['version'] != version]
    appcast['versions'].insert(0, version_info)

    with open(appcast_file, 'w') as f:
        json.dump(appcast, f, ensure_ascii=False, indent=2)
    print(f"Successfully updated appcast.json for version {version}")


def update_info_json(version):
    """Updates the version in src/info.json."""
    info_file = Path('src/info.json')
    with open(info_file, 'r') as f:
        info = json.load(f)
    info['version'] = version
    with open(info_file, 'w') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)
    print(f"Successfully updated src/info.json to version {version}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python scripts/update_release.py <version> <description>")
        sys.exit(1)
        
    version_arg = sys.argv[1]
    desc_arg = sys.argv[2]
    
    print(f"Starting release process for version {version_arg}...")
    
    update_info_json(version_arg)
    build_plugin(version_arg)
    update_appcast(version_arg, desc_arg)
    
    print("Release process completed successfully.")