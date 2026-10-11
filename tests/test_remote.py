from types import SimpleNamespace
import unittest
from qiskit.providers.jobstatus import JobStatus

from truco.remote import RemoteMeasurement
from truco.service import Session


class Simulator:
    name = 'ionq_simulator'
    options = SimpleNamespace(noise_model='test')
    def __init__(self, fail=False): self.calls = 0; self.fail = fail
    def configuration(self): return SimpleNamespace(simulator=True)
    def run(self, circuits, shots):
        self.calls += 1
        if self.fail: raise ConnectionError('Connection unavailable')
        self.job = SimpleNamespace(status=lambda:JobStatus.DONE,
                                   result=lambda:SimpleNamespace(get_counts=lambda i:{'1':1}), job_id=lambda:'mock')
        return self.job


class RemoteTests(unittest.TestCase):
    def test_uncertain_submission_is_never_duplicated(self):
        for one_job in (True, False):
            backend = Simulator(fail=True)
            remote = RemoteMeasurement(backend, one_job=one_job)
            with self.assertRaises(RuntimeError): remote.start([['X']])
            with self.assertRaises(RuntimeError): remote.start([['X']])
            self.assertEqual(backend.calls, 1)

    def test_poll_reuses_job_and_cached_result(self):
        backend = Simulator(); remote = RemoteMeasurement(backend)
        remote.start([['X'], ['H']]); remote.start([['X'], ['H']])
        first = remote.poll()
        self.assertTrue(first['done'])
        self.assertEqual(len(first['measurements']), 2)
        self.assertEqual(remote.poll(), first)
        self.assertEqual(backend.calls, 1)
        remote.release()
        with self.assertRaises(ValueError): remote.start([['X']])

    def test_hardware_is_refused(self):
        backend = Simulator(); backend.name = 'ionq_qpu'
        backend.configuration = lambda:SimpleNamespace(simulator=False)
        with self.assertRaises(ValueError): RemoteMeasurement(backend).start([['H']])
        self.assertEqual(backend.calls, 0)

    def test_timeout_resumes_the_same_job(self):
        backend = Simulator(); remote = RemoteMeasurement(backend)
        remote.start([['X']]); remote.job.status = lambda:JobStatus.RUNNING
        remote.started -= 121
        with self.assertRaises(TimeoutError): remote.poll()
        remote.start([['X']])
        self.assertEqual(backend.calls, 1)
        remote.job.status = lambda:JobStatus.DONE
        self.assertEqual(remote.poll()['measurements'][0][0], 1)

    def test_pending_job_blocks_mode_switch(self):
        session = Session()
        session.action({'action':'new','value':['Ana','Luis']})
        for _ in range(2):
            for action, value in (('choose',0), ('edit',[0]), ('confirm',None)):
                session.action({'action':action,'value':value})
        session.action({'action':'play','value':0})
        self.assertEqual(session.game.phase, 'measure')
        session.start(Simulator())
        with self.assertRaises(ValueError): session.action({'action':'dev_mode','value':True})
        self.assertFalse(session.local)
        session.poll()
        session.action({'action':'dev_mode','value':True})
        self.assertTrue(session.local)
