"""Qiskit previews and explicit measurement sources. No game scoring here."""
import math
import random
from dataclasses import dataclass, field
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
import numpy as np

from .gates import VALID, ROTATIONS

def circuit(gates, measured=False):
    if not isinstance(gates, (list, tuple)) or len(gates) > 3 or any(g not in VALID for g in gates):
        raise ValueError('Circuito inválido: hasta tres compuertas')
    qc = QuantumCircuit(1, 1) if measured else QuantumCircuit(1)
    for gate in gates:
        if gate == 'H': qc.h(0)
        elif gate == 'X': qc.x(0)
        elif gate == 'Z': qc.z(0)
        else:
            axis, angle = ROTATIONS[gate]
            getattr(qc, axis)(angle, 0)
    if measured: qc.measure(0, 0)
    return qc

def preview(gates):
    steps = []
    for i in range(len(gates) + 1):
        state = Statevector.from_instruction(circuit(gates[:i]))
        a, b = state.data
        cross = a.conjugate() * b
        phase = None if abs(a) < 1e-12 or abs(b) < 1e-12 else float(math.atan2(cross.imag, cross.real))
        steps.append({'gate': gates[i-1] if i else '|0⟩',
                      'amplitudes': [[float(z.real), float(z.imag)] for z in (a, b)],
                      'probabilities': [float(p) for p in state.probabilities()],
                      'bloch': [float(2 * cross.real), float(2 * cross.imag), float(abs(a)**2 - abs(b)**2)],
                      'relative_phase': phase})
    # Partial rotations for a physically consistent Bloch trajectory.
    # H is a pi rotation around (X+Z)/sqrt(2), equivalent up to global phase.
    trajectory = [steps[0]['bloch']]
    segments = []
    for i, gate in enumerate(gates):
        start = len(trajectory) - 1
        state = Statevector.from_instruction(circuit(gates[:i]))
        axis, angle = ROTATIONS.get(gate, (None, math.pi))
        for t in range(1, 25):
            theta = angle * t / 24
            partial = QuantumCircuit(1)
            if axis: getattr(partial, axis)(theta, 0)
            elif gate == 'X': partial.rx(theta, 0)
            elif gate == 'Z': partial.rz(theta, 0)
            else:
                h = np.array([[1,1],[1,-1]]) / math.sqrt(2)
                partial.unitary(Operator(math.cos(theta/2)*np.eye(2)-1j*math.sin(theta/2)*h), [0])
            a, b = state.evolve(partial).data
            cross = a.conjugate()*b
            trajectory.append([float(2*cross.real),float(2*cross.imag),float(abs(a)**2-abs(b)**2)])
        segments.append({'gate':gate, 'start':start, 'end':len(trajectory)-1})
    return {'gates': list(gates), 'steps': steps, 'trajectory':trajectory, 'segments':segments, **steps[-1]}

@dataclass
class QuantumCard:
    index: int
    tokens: list
    sequence: list = field(default_factory=list)
    locked: bool = False
    result: int | None = None
    record: dict | None = None
    _preview: dict | None = field(default=None, repr=False)
    def edit(self, indices):
        if self.locked: raise ValueError('Circuito confirmado: no puede cambiar')
        if not isinstance(indices, (list, tuple)) or len(indices) > 3 or any(type(i) is not int or not 0 <= i < len(self.tokens) for i in indices) or len(set(indices)) != len(indices):
            raise ValueError('Cada ficha se usa una vez; máximo tres')
        self.sequence = list(indices)
        self._preview = None
        return self.view()
    @property
    def gates(self):
        return [self.tokens[i] for i in self.sequence]
    def view(self):
        if self._preview is None: self._preview = preview(self.gates)
        return self._preview
    def collapse(self, bit, record):
        if not self.locked: raise ValueError('Confirmá antes de medir')
        if self.result is not None: raise ValueError('La carta ya fue medida')
        if type(bit) is not int or bit not in (0, 1): raise ValueError('Resultado inválido')
        self.result, self.record = bit, record

class LocalSampler:
    name = 'LOCAL DEVELOPMENT — Qiskit Statevector; NO IonQ'
    def sample(self, gates):
        state = Statevector.from_instruction(circuit(gates))
        bit = int(state.sample_memory(1)[0])
        return bit, {'backend': self.name, 'shots': 1, 'gates': list(gates), 'result': bit,
                     'method': 'Qiskit Statevector.sample_memory(1)'}

def effective_sample(distribution, rng=None):
    """One effective draw from validated one-qubit probabilities/counts."""
    weights = [0.0, 0.0]
    for key, value in distribution.items():
        key = str(key).replace(' ', '')
        if key in ('0', '0x0'): bit = 0
        elif key in ('1', '0x1'): bit = 1
        else: raise ValueError('Orden/formato de bits no reconocido: se esperaba un bit')
        value = float(value)
        if not math.isfinite(value) or value < 0: raise ValueError('Distribución inválida')
        weights[bit] += value
    total = sum(weights)
    if not total or not math.isfinite(total): raise ValueError('Resultado sin probabilidades válidas')
    return int((rng or random.SystemRandom()).random() >= weights[0] / total)
