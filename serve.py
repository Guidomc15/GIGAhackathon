"""Local Qiskit development server; Qollab exports stay unchanged."""
import argparse
import json
import secrets
import threading
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from truco.service import Session, demo_json

ROOT = Path(__file__).resolve().parent
PUBLIC = {p.name for p in ROOT.iterdir() if p.suffix in {'.js', '.css'}}
PUBLIC.add('artifacts/truco-cuantico-demo.mp4')
PUBLIC.add('artifacts/DEMO_TRANSCRIPT.txt')
TYPES = {'.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.txt': 'text/plain'}


class LocalServer(ThreadingHTTPServer):
    def __init__(self, address):
        super().__init__(address, Handler)
        self.sessions = {}
        self.sessions_lock = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    def respond(self, status, body, content_type='application/json', cookie=None):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if cookie:
            self.send_header('Set-Cookie', f'truco_session={cookie}; HttpOnly; SameSite=Strict; Path=/')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path.lstrip('/')
        if path in ('', 'index.html'):
            body = (ROOT / 'index.html').read_text()
            # Qollab consumes a body fragment and loads main.js/main.css itself.
            # Only the local runner builds a document and maps Python to HTTP.
            html = ('<!doctype html><html lang="es"><head>'
                    '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
                    '<title>Truco Cuántico · Qriollo</title>'
                    '<script type="importmap">{"imports":{"qollab_engine":"/local-engine.js"}}</script>'
                    '<link rel="stylesheet" href="main.css">'
                    '<script type="module" src="main.js"></script>'
                    '</head><body>' + body + '</body></html>')
            self.respond(200, html.encode(), 'text/html; charset=utf-8')
        elif path in PUBLIC and (ROOT / path).is_file():
            self.respond(200, (ROOT / path).read_bytes(), TYPES[Path(path).suffix])
        else:
            self.respond(404, b'{"error":"Not found"}')

    def do_POST(self):
        if urlsplit(self.path).path != '/api':
            self.respond(404, b'{"error":"Not found"}')
            return
        origin = self.headers.get('Origin')
        if origin and origin != f"http://{self.headers.get('Host')}":
            self.respond(403, b'{"error":"Invalid origin"}')
            return
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 16384:
                raise ValueError('Invalid request size')
            if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                raise ValueError('Expected application/json')
            request = json.loads(self.rfile.read(size))
            if not isinstance(request, dict):
                raise ValueError('Invalid request')
            method = request.get('method')
            if method not in ('dispatch_json', 'start_json', 'poll_json', 'demo_json'):
                raise ValueError('Unknown method')
            payload = None
            if method == 'dispatch_json':
                payload = json.loads(request.get('arg', ''))
                if not isinstance(payload, dict) or not isinstance(payload.get('action'), str):
                    raise ValueError('Invalid action')
        except (ValueError, TypeError, UnicodeError):
            self.respond(400, b'{"error":"Invalid request"}')
            return
        cookies = SimpleCookie()
        cookies.load(self.headers.get('Cookie', ''))
        token = cookies['truco_session'].value if 'truco_session' in cookies else None
        new_token = None
        with self.server.sessions_lock:
            if token not in self.server.sessions:
                if len(self.server.sessions) >= 100:
                    self.respond(503, b'{"error":"Session limit reached; restart the local server"}')
                    return
                token = new_token = secrets.token_urlsafe(32)
                self.server.sessions[token] = (Session(local=True), threading.Lock())
            session, lock = self.server.sessions[token]
        with lock:
            if method == 'dispatch_json':
                result = session.safe(lambda: session.action(payload))
            elif method == 'start_json':
                result = session.safe(session.start)
            elif method == 'poll_json':
                result = session.safe(session.poll)
            else:
                result = json.loads(demo_json())
        self.respond(200, json.dumps(result).encode(), cookie=new_token)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    # demo_json reads repository-relative paths.
    import os
    os.chdir(ROOT)
    with LocalServer(('127.0.0.1', args.port)) as server:
        print(f'Truco local: puerto {server.server_port} · Qiskit local, sin IonQ', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
