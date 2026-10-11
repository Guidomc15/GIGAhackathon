from collections import Counter
import math
import unittest

from truco.quantum import LocalSampler, QuantumCard, circuit, effective_sample, preview
from truco.gates import ANGLES, ROTATIONS
from truco.classic import GATES


class QuantumTests(unittest.TestCase):
    def test_fixed_rotations_have_expected_probabilities_and_paths(self):
        for axis in ('RX', 'RY', 'RZ'):
            for angle_name, angle in ANGLES.items():
                gate = f'{axis}:{angle_name}'
                with self.subTest(gate=gate):
                    data = preview([gate])
                    expected = 0 if axis == 'RZ' else math.sin(angle/2)**2
                    self.assertAlmostEqual(data['probabilities'][1], expected)
                    for actual, expected in zip(data['trajectory'][-1], data['bloch']):
                        self.assertAlmostEqual(actual, expected)
                    self.assertTrue(all(math.isclose(sum(v*v for v in point),1,abs_tol=1e-8) for point in data['trajectory']))
        # A phase rotation matters after interference, even though RZ alone has P(1)=0.
        self.assertAlmostEqual(preview(['H','RZ:pi/2','H'])['probabilities'][1], .5)
        self.assertAlmostEqual(preview(['H','RY:pi/6'])['probabilities'][1], .75)
        self.assertAlmostEqual(preview(['H','RY:-pi/6'])['probabilities'][1], .25)

    def test_deck_has_one_x_and_every_fixed_rotation(self):
        self.assertEqual(len(GATES),41)  # 8 H, 1 X, 8 Z and two of each of the 12 fixed rotations
        families=Counter(g.split(':')[0] for g in GATES)
        self.assertEqual(families,{'H':8,'Z':8,'RX':8,'RY':8,'RZ':8,'X':1})
        self.assertEqual(GATES.count('X'),1)
        for gate in ROTATIONS: self.assertEqual(GATES.count(gate),2)

    def test_gate_probabilities_and_path_endpoints(self):
        for gates, probabilities in ((['X'], [0,1]), (['H'], [.5,.5]), (['H','H'], [1,0]),
                                     (['H','Z','H'], [0,1]), (['H','RY:pi/6'], [.25,.75]), (['H','RY:-pi/6'], [.75,.25])):
            with self.subTest(gates=gates):
                result = preview(gates)
                for actual, expected in zip(result['probabilities'], probabilities):
                    self.assertAlmostEqual(actual, expected)
                for segment, step in zip(result['segments'], result['steps'][1:]):
                    for actual, expected in zip(result['trajectory'][segment['end']], step['bloch']):
                        self.assertAlmostEqual(actual, expected)
                self.assertTrue(all(math.isclose(sum(v*v for v in point),1,abs_tol=1e-8) for point in result['trajectory']))

    def test_edit_validation_and_locked_collapse(self):
        card = QuantumCard(0, ['H','X','Z','RY:pi/6'])
        for indices in (None, [{}], [True], [-1], [4], [0,0], [0,1,2,3]):
            with self.assertRaises(ValueError): card.edit(indices)
            self.assertEqual(card.sequence, [])
        card.edit([1]); card.locked = True
        with self.assertRaises(ValueError): card.edit([])
        bit, record = LocalSampler().sample(card.gates)
        self.assertEqual(bit, 1)
        card.collapse(bit, record)
        with self.assertRaises(ValueError): card.collapse(0, {})

    def test_distribution_validation(self):
        for counts in ({}, {'0':-1}, {'0':float('nan')}, {'0':float('inf')}, {'01':1}, {'0':1e308,'1':1e308}):
            with self.assertRaises(ValueError): effective_sample(counts)
        self.assertEqual(effective_sample({'0':1}), 0)
        self.assertEqual(effective_sample({'0x1':1}), 1)
        with self.assertRaises(ValueError): circuit('HX')
