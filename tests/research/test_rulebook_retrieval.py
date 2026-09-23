"""Offline regression checks for bounded PDF retrieval.

Run with: python -m unittest discover -s tests/research -v
Requires pypdf, like the retrieval script itself. No network requests are made.
"""
from contextlib import redirect_stdout
from io import BytesIO, StringIO
import json
from pathlib import Path
import runpy
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pypdf import PdfWriter


ROOT = Path(__file__).resolve().parents[2]


class PartialResponse(BytesIO):
    def __init__(self, body, content_length):
        super().__init__(body)
        self.headers = {} if content_length is None else {'Content-Length': str(content_length)}
        self.read_calls = 0

    def read(self, size=-1):
        self.read_calls += 1
        # A single read may return fewer bytes than requested, without EOF.
        return super().read(min(size, 31_337))


class RulebookRetrievalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        writer.add_metadata({'/Subject': 'Offline partial-read fixture ' * 4000})
        output = BytesIO()
        writer.write(output)
        cls.pdf = output.getvalue()

    def retrieve(self, body, declared_length):
        cache = (ROOT / 'research/source-files').resolve()
        cache.mkdir(exist_ok=True)
        with TemporaryDirectory(prefix='retrieval-test-', dir=cache) as temporary:
            directory = Path(temporary).resolve()
            self.assertEqual(directory.parent, cache)
            queue = directory / 'queue.json'
            queue.write_text(json.dumps({
                'allowedHosts': ['example.test'],
                'manuals': [{'gameName': 'Offline Fixture', 'url': 'https://example.test/rules.pdf',
                             'indexSource': 'https://example.test/'}],
            }), encoding='utf-8')
            response = PartialResponse(body, declared_length)
            class Opener:
                def open(self, request, timeout):
                    self_request_headers = dict(request.header_items())
                    if self_request_headers.get('Accept-encoding') != 'identity':
                        raise AssertionError('Retrieval must request an unencoded response')
                    return response
            argv = ['cache-rulebook-queue.py', '--queue', str(queue), '--output', str(directory / 'out'), '--max-mb', '1']
            with patch.object(sys, 'argv', argv), patch('urllib.request.build_opener', return_value=Opener()), redirect_stdout(StringIO()):
                runpy.run_path(str(ROOT / 'scripts/cache-rulebook-queue.py'), run_name='__main__')
            record = json.loads((directory / 'out/intake.json').read_text(encoding='utf-8'))['manuals'][0]
            cached = list((directory / 'out').glob('*.pdf'))
            return record, [path.read_bytes() for path in cached], response.read_calls

    def test_partial_reads_are_joined_until_eof(self):
        record, cached, calls = self.retrieve(self.pdf, len(self.pdf))
        self.assertEqual(record['status'], 'needs-source-review')
        self.assertEqual(record['pages'], 1)
        self.assertEqual(cached, [self.pdf])
        self.assertGreater(calls, 2)

    def test_response_without_content_length_still_reads_to_eof(self):
        record, cached, _ = self.retrieve(self.pdf, None)
        self.assertEqual(record['status'], 'needs-source-review')
        self.assertEqual(cached, [self.pdf])

    def test_incomplete_response_is_not_cached(self):
        record, cached, _ = self.retrieve(self.pdf, len(self.pdf) + 1)
        self.assertEqual(record['status'], 'retrieval-failed')
        self.assertIn('Incomplete PDF response', record['error'])
        self.assertEqual(cached, [])

    def test_size_limit_remains_bounded(self):
        oversized = b'%PDF' + b'x' * 1_000_001
        record, cached, calls = self.retrieve(oversized, len(oversized))
        self.assertEqual(record['status'], 'retrieval-failed')
        self.assertIn('exceeds 1 MB', record['error'])
        self.assertEqual(cached, [])
        self.assertLess(calls, 40)


if __name__ == '__main__':
    unittest.main()
