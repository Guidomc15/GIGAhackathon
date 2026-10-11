"""Fixed rotation catalogue shared by the deck and Qiskit circuit builder."""
import math
ANGLES = {'pi/2': math.pi/2, 'pi/6': math.pi/6, '-pi/6': -math.pi/6,
          'pi/3': math.pi/3}
ROTATIONS = {f'{axis}:{name}': (axis.lower(), angle)
             for axis in ('RX', 'RY', 'RZ') for name, angle in ANGLES.items()}
VALID = ('H', 'X', 'Z', *ROTATIONS)
# Token deck: H, Z, RX, RY and RZ are equally likely (8 tokens each; each rotation axis
# has 4 angles x 2 copies) and X is rare (1 token): about 20 % each and 2.4 % for X.
DECK = ('H',)*8 + ('X',) + ('Z',)*8 + tuple(ROTATIONS)*2
