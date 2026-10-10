"""Adapter for Qollab's documented injected Qiskit backend.

No credentials, provider construction or undocumented network endpoints.
Lifecycle is polled by the UI so it stays responsive. Never substitutes local data.
"""
import time
from qiskit.providers.jobstatus import JobStatus
from .quantum import circuit, effective_sample

class RemoteMeasurement:
    def __init__(self, backend, one_job=True):
        self.backend = backend
        self.one_job = one_job
        self.sent = False
        self.job = None
        self.gates = []
        self.cached = None
        self.started = None
        self.last_error = None
        self.submission_uncertain = False
    def info(self):
        name = getattr(self.backend,'name','unknown')
        if callable(name): name = name()
        config = self.backend.configuration() if hasattr(self.backend,'configuration') else None
        simulator = getattr(config,'simulator',None) if config else None
        module = type(self.backend).__module__
        return {'name':str(name),'module':module,'simulator':simulator,
                'noise_model':str(getattr(getattr(self.backend,'options',None),'noise_model',None))}
    def start(self, sequences):
        if self.job is not None: return  # resumes the SAME job after timeout
        if self.submission_uncertain:
            raise RuntimeError('El envío anterior tiene estado incierto. No se enviará otro job que pueda duplicar la medición')
        info = self.info()
        if 'ionq' not in (info['name']+' '+info['module']).lower():
            raise ValueError('Seleccioná un simulador IonQ; este backend no está identificado como IonQ')
        if info['simulator'] is not True and 'simulator' not in info['name'].lower():
            raise ValueError('No se verificó que el backend sea simulador. No se enviará a hardware')
        if self.sent and self.one_job:
            raise ValueError('Qollab permite un solo job IonQ por ejecución. No se inventará una segunda medición')
        if not sequences: raise ValueError('No hay circuitos para medir')
        circuits = [circuit(g, measured=True) for g in sequences]
        self.gates = [list(g) for g in sequences]
        self.sent = True  # fail closed after uncertain submission; avoid duplicate jobs
        self.started = time.monotonic()
        try:
            self.job = self.backend.run(circuits if len(circuits)>1 else circuits[0], shots=1)
        except Exception as exc:
            self.submission_uncertain = True
            message = str(exc).lower()
            recognized = next((p for p in ('only one','one job','xhr','xmlhttprequest','keyword','connection','not supported','unexpected') if p in message), 'unclassified')
            self.last_error = {'type':type(exc).__name__,'recognized':recognized}
            raise RuntimeError(f'Falló el envío ({type(exc).__name__}; {recognized}); estado remoto incierto. No se reenviará automáticamente') from None
    def poll(self):
        if self.cached is not None: return {'done':True,'measurements':self.cached}
        if self.job is None: raise ValueError('No hay job remoto para consultar')
        status = self.job.status()
        if status in (JobStatus.ERROR,JobStatus.CANCELLED):
            self.last_error = str(status)
            raise RuntimeError('IonQ informó error o cancelación; no hay resultado de juego')
        if status != JobStatus.DONE:
            if time.monotonic()-self.started>120:
                raise TimeoutError('IonQ sigue pendiente. Reintentar consulta retoma el mismo job')
            return {'done':False,'status':str(status)}
        try:
            result = self.job.result()
            measurements = []
            for i, gates in enumerate(self.gates):
                # A single bit: only 0/1 or 0x0/0x1 allowed. No low-probability filtering.
                counts = result.get_counts(i)
                bit = effective_sample(counts)
                job_id = str(self.job.job_id()) if hasattr(self.job,'job_id') else None
                record = {'backend':self.info(),'shots':1,'gates':gates,'result':bit,
                          'job_id':job_id,'distribution':dict(counts),
                          'method':'one effective sample from returned counts/probabilities'}
                measurements.append((bit,record))
            self.cached = measurements
            return {'done':True,'measurements':measurements}
        except Exception as exc:
            self.last_error = type(exc).__name__
            raise RuntimeError('No se pudo validar el resultado IonQ; no se asignó una identidad') from None
    def release(self):
        self.job = None; self.cached = None; self.started = None
