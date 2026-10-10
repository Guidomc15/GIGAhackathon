"""Fixed rotation catalogue shared by the deck and Qiskit circuit builder."""
import math
ANGLES = {'pi/2': math.pi/2, 'pi/6': math.pi/6, '-pi/6': -math.pi/6,
          'pi/3': math.pi/3, 'pi/67': math.pi/67}
ROTATIONS = {f'{axis}:{name}': (axis.lower(), angle)
             for axis in ('RX', 'RY', 'RZ') for name, angle in ANGLES.items()}
# Compatibility aliases for saved circuits; the new deck uses explicit angles.
ROTATIONS.update({'RY+': ('ry', math.pi/6), 'RY-': ('ry', -math.pi/6)})
VALID = ('H', 'X', 'Z', *ROTATIONS)
DECK = ('H',)*6 + ('X',) + ('Z',)*3 + tuple(g for g in ROTATIONS if ':' in g)*2
