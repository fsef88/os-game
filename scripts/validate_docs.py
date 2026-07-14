from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
LINK_RE = re.compile(r'\[[^\]]+\]\(([^)]+)\)')

errors = []
for md in ROOT.rglob('*.md'):
    if any(part in {'node_modules', 'dist', '.git'} for part in md.parts):
        continue
    text = md.read_text(encoding='utf-8', errors='ignore')
    # ignore fenced code blocks so snippets like foo[bar](baz) are not treated as links
    text = re.sub(r'```.*?```', '', text, flags=re.S)
    for target in LINK_RE.findall(text):
        if '://' in target or target.startswith('#'):
            continue
        target = target.split('#', 1)[0].split('?', 1)[0].strip()
        if not target:
            continue
        full = (md.parent / target).resolve()
        if not full.exists():
            errors.append(f'{md.relative_to(ROOT)} -> {target}')

if errors:
    print('Broken links found:')
    for item in errors:
        print('-', item)
    sys.exit(1)

print('No broken markdown links found.')
