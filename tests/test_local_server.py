"""HTTP integration checks for the local Qiskit bridge."""
import http.cookiejar
import json
import threading
import unittest
import urllib.error
import urllib.request

from serve import LocalServer


class LocalServerTests(unittest.TestCase):
    def setUp(self):
        self.server = LocalServer(('127.0.0.1', 0))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f'http://127.0.0.1:{self.server.server_port}'
        self.client = self.new_client()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def new_client(self):
        return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def api(self, method='dispatch_json', action='public', value=None, client=None):
        data = json.dumps({'method': method, 'arg': json.dumps({'action': action, 'value': value})}).encode()
        request = urllib.request.Request(self.url + '/api', data, {'Content-Type': 'application/json'})
        with (client or self.client).open(request) as response:
            return json.load(response)

    def test_local_ui_import_and_static_boundaries(self):
        with self.client.open(self.url) as response:
            html = response.read()
            self.assertIn(b'"truco.service":"/local-engine.js"', html)
            self.assertTrue(html.startswith(b'<!doctype html><html lang="es">'))
        with self.client.open(self.url + '/local-engine.js') as response:
            self.assertEqual(response.headers['Content-Type'], 'text/javascript')
        for path in ('/.git/config', '/serve.py', '/requirements.txt', '/../serve.py'):
            with self.assertRaises(urllib.error.HTTPError) as error:
                self.client.open(self.url + path)
            self.assertEqual(error.exception.code, 404)

    def test_independent_sessions_and_private_reveal(self):
        self.api(action='new', value=['Ana', 'Luis'])
        self.assertNotIn('game', self.api(client=self.new_client()))
        self.assertNotIn('private', self.api())
        self.assertEqual(len(self.api(action='reveal')['private']['cards']), 3)
        self.assertTrue(self.api()['host_local'])
        self.assertTrue(self.api(action='dev_mode', value=False)['error'])

    def test_real_tutorial_measurement(self):
        self.api(action='tutorial', value=1)
        self.api(action='tutorial_sample', value=0)
        result = self.api(method='start_json')['tutorial']['result']
        self.assertEqual(result['bit'], 1)
        self.assertIn('Qiskit Statevector', result['record']['backend'])
        self.assertEqual(self.api(method='start_json')['tutorial']['result'], result)

    def test_reject_cross_origin_and_malformed_requests(self):
        for headers, body, expected in (
            ({'Content-Type':'application/json', 'Origin':'http://other.invalid'}, b'{}', 403),
            ({'Content-Type':'application/json'}, b'not-json', 400),
            ({'Content-Type':'application/json'}, b'{"method":"unknown"}', 400),
        ):
            request = urllib.request.Request(self.url + '/api', body, headers)
            with self.assertRaises(urllib.error.HTTPError) as error:
                self.client.open(request)
            self.assertEqual(error.exception.code, expected)


if __name__ == '__main__':
    unittest.main()
