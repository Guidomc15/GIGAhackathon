"""Exercise the Qollab delivery with no source package on the Python path."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

from build_qollab import ROOT, build, engine_source


class QollabBundleTests(unittest.TestCase):
    def test_generated_engine_matches_current_game_sources(self):
        self.assertEqual((ROOT / 'qollab_engine.py').read_text(), engine_source(),
                         'Run python build_qollab.py after changing truco/*.py')

    def test_flat_upload_contains_all_browser_imports_and_python_entrypoint(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / 'upload.zip'
            build(output, check=True)
            with zipfile.ZipFile(output) as archive:
                names = set(archive.namelist())
                self.assertTrue(all('/' not in name for name in names))
                self.assertTrue({'main.js', 'main.css', 'index.html', 'qollab_engine.py',
                                 'THIRD_PARTY_NOTICES.md', 'truco-cuantico-demo.mp4',
                                 'DEMO_TRANSCRIPT.txt'} <= names)
                self.assertNotIn('local-engine.js', names)
                self.assertNotIn('serve.py', names)
                for name in names:
                    if name.endswith('.js'):
                        source = archive.read(name).decode()
                        for imported in re.findall(r"from\s+['\"]([^'\"]+)['\"]", source):
                            if imported.startswith('./'):
                                self.assertIn(imported[2:], names, f'{name}: missing {imported}')
                            else:
                                self.assertIn(imported + '.py', names, f'{name}: missing Python module')

    def test_standalone_api_measures_and_completes_match_without_truco_folder(self):
        script = '''
import base64
import importlib.util
import json
import sys

assert importlib.util.find_spec('truco') is None
spec = importlib.util.spec_from_file_location('qollab_engine', 'qollab_engine.py')
engine = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = engine
spec.loader.exec_module(engine)
def action(name, value=None):
    view = json.loads(engine.dispatch_json(json.dumps({'action': name, 'value': value})))
    assert not view['error'], view['error']
    return view
def measure():
    view = json.loads(engine.start_json(None))
    assert not view['error'], view['error']
    return view

initial = action('public')
assert not initial['development_mode']
action('dev_mode', True)
coach = action('tutorial')['coach']
while not coach['final']:
    name, value = coach['expect'] or ('coach_next', coach['quiz']['answer'] if coach['quiz'] else None)
    coach = action(name, value)['coach']
assert json.loads(engine.poll_json())['done']

view = action('new', {'names': ['Ana', 'Luis'], 'privacy': True, 'difficulty': 'hard'})
assert view['game']['privacy']
assert view['game']['difficulty'] == 'hard'
assert 'private' not in view
assert len(action('reveal')['private']['cards']) == 3
measurements = 0
for step in range(500):
    phase = view['game']['phase']
    if phase == 'match_end':
        break
    if phase == 'prepare':
        action('choose', 0)
        action('edit', [0])
        view = action('confirm')
    elif phase == 'respond':
        assert len(action('reveal')['private']['cards']) == 3
        view = action('accept')
    elif phase == 'measure':
        view = measure()
        measurements += 1
    elif phase == 'play':
        assert 'noise' not in action('reveal')['private']['quantum']['preview']
        legal = [item['id'] for item in view['game']['actions']]
        view = action('envido' if 'envido' in legal else 'fold')
    elif phase == 'hand_end':
        assert len(view['game']['report']['quantum']) == 2
        view = action('next')
    else:
        raise AssertionError(phase)
else:
    raise AssertionError('Standalone game did not finish')
assert max(view['game']['scores']) == 15
assert measurements > 0
assert len(view['game']['history']) > 0
assert 'truco' not in sys.modules
demo = json.loads(engine.demo_json())
assert base64.b64decode(demo['data']) == b'fixture-video'
assert demo['transcript'] == 'fixture transcript'
print(json.dumps({'versions': initial['versions'], 'scores': view['game']['scores'],
                  'measurements': measurements}))
'''
        with tempfile.TemporaryDirectory() as temporary:
            destination = Path(temporary)
            shutil.copy2(ROOT / 'qollab_engine.py', destination)
            (destination / 'truco-cuantico-demo.mp4').write_bytes(b'fixture-video')
            (destination / 'DEMO_TRANSCRIPT.txt').write_text('fixture transcript')
            result = subprocess.run([sys.executable, '-I', '-c', script], cwd=destination,
                                    text=True, capture_output=True, timeout=60)
            self.assertEqual(result.returncode, 0, result.stderr or result.stdout)
            self.assertEqual(max(json.loads(result.stdout)['scores']), 15)


if __name__ == '__main__':
    unittest.main()
