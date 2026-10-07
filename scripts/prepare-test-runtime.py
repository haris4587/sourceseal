"""Cache the pinned official artifact under genlayer-test's legacy filename."""
from pathlib import Path
import hashlib
import urllib.request

TARGET = Path.home() / '.cache/gltest-direct/genvm-universal-v0.3.0-rc7.tar.xz'
DIGEST = 'e218a1854214681560351051f76fe2b878545cf3409455ef372d57014a88ca67'
URL = 'https://github.com/genlayerlabs/genvm/releases/download/v0.3.0-rc7/genvm-runners-all.tar.xz'
TARGET.parent.mkdir(parents=True, exist_ok=True)
if not TARGET.exists():
    urllib.request.urlretrieve(URL, TARGET)
if hashlib.file_digest(TARGET.open('rb'), 'sha256').hexdigest() != DIGEST:
    raise SystemExit('GenVM artifact checksum mismatch')
print('Pinned official GenVM test artifact verified')
