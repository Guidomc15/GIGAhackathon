"""One-job compatibility probe. Uses Qollab's injected backend, never a key."""
import json
import platform
import time
import qiskit
from qiskit import QuantumCircuit
from qiskit.providers.jobstatus import JobStatus
from qiskit.quantum_info import Statevector

def main(shots: int = 1):
    if shots != 1:
        raise ValueError('This probe requires exactly one shot')
    name = backend.name() if callable(getattr(backend,'name',None)) else getattr(backend,'name','unknown')
    config = backend.configuration() if hasattr(backend,'configuration') else None
    print(json.dumps({'python':platform.python_version(),'qiskit':qiskit.__version__,
                      'backend':str(name),'module':type(backend).__module__,
                      'simulator':getattr(config,'simulator',None),
                      'noise_model':str(getattr(getattr(backend,'options',None),'noise_model',None))}))
    qc = QuantumCircuit(1,1)
    qc.h(0)
    print('Qiskit preview:', Statevector.from_instruction(qc).probabilities().tolist())
    qc.measure(0,0)
    print(qc)
    job = backend.run(qc,shots=1)
    deadline = time.monotonic()+120
    while job.status() != JobStatus.DONE:
        status=job.status()
        if status in (JobStatus.ERROR,JobStatus.CANCELLED):
            raise RuntimeError('Remote job failed; no fabricated result')
        if time.monotonic()>deadline: raise TimeoutError('Job still pending after 120 seconds')
        print('Status:',status)
        time.sleep(1)
    counts=job.result().get_counts()
    print('Unfiltered one-bit counts:',json.dumps(counts))
    if any(str(key) not in ('0','1','0x0','0x1') for key in counts):
        raise ValueError('Unexpected bit order or result format')
    print('BIT ORDER: q[0] -> c[0]; exactly one classical bit')
    print('This effort is supported by Qollab & IonQ.')
