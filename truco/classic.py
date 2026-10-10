"""Pure rules for the specified two-player, no-Flor variant."""
from dataclasses import dataclass
from itertools import combinations
from .gates import DECK as GATES

NUMBERS = (1, 2, 3, 4, 5, 6, 7, 10, 11, 12)
SUITS = ('espada', 'basto', 'oro', 'copa')
LINK = {'espada': 'copa', 'copa': 'espada', 'basto': 'oro', 'oro': 'basto'}

@dataclass(frozen=True)
class Card:
    number: int
    suit: str
    def __post_init__(self):
        if self.number not in NUMBERS or self.suit not in SUITS:
            raise ValueError('Carta inválida')
    def linked(self):
        return Card(self.number, LINK[self.suit])
    def data(self):
        return {'number': self.number, 'suit': self.suit, 'label': f'{self.number} de {self.suit}'}

DECK = tuple(Card(n, s) for n in NUMBERS for s in SUITS)
PAIRS = tuple((Card(n, s), Card(n, s).linked()) for n in NUMBERS for s in ('espada', 'basto'))
SPECIAL = {(1, 'espada'): 14, (1, 'basto'): 13, (7, 'espada'): 12, (7, 'oro'): 11}
RANK = {3: 10, 2: 9, 1: 8, 12: 7, 11: 6, 10: 5, 7: 4, 6: 3, 5: 2, 4: 1}

def strength(card):
    return SPECIAL.get((card.number, card.suit), RANK[card.number])

def deal(rng):
    cards = [rng.choice(pair) for pair in rng.sample(PAIRS, 6)]
    rng.shuffle(cards)
    return [cards[:3], cards[3:]]

def envido(cards):
    value = lambda c: c.number if c.number <= 7 else 0
    same = [20 + value(a) + value(b) for a, b in combinations(cards, 2) if a.suit == b.suit]
    return max(same) if same else max(map(value, cards))

def hand_winner(bazas, mano):
    """None means undecided. -1 marks a parda; players are 0 and 1."""
    if not bazas:
        return None
    if len(bazas) >= 2:
        first, second = bazas[:2]
        if first == -1 and second != -1:
            return second
        if first != -1 and (second == first or second == -1):
            return first
    if len(bazas) == 3:
        first, second, third = bazas
        if third != -1:
            return third
        return next((p for p in (first, second) if p != -1), mano)
    return None

ENVIDO_CHAINS = {
    (): ('envido', 'real', 'falta'),
    ('envido',): ('envido', 'real', 'falta'),
    ('envido', 'envido'): ('real', 'falta'),
    ('real',): ('falta',),
    ('envido', 'real'): ('falta',),
    ('envido', 'envido', 'real'): ('falta',),
}

def envido_value(chain, scores=None, loser=None):
    if chain[-1] == 'falta':
        if scores is None:
            raise ValueError('Falta necesita el marcador')
        return 15 - max(scores)
    return sum({'envido': 2, 'real': 3}[c] for c in chain)

def refusal_value(chain):
    return envido_value(chain[:-1]) if len(chain) > 1 else 1



class GateDeck:
    def __init__(self, rng):
        self.rng = rng
        self.draw_pile = list(GATES)
        self.discard = []
        rng.shuffle(self.draw_pile)
    def draw_hand(self):
        if len(self.draw_pile) < 8:
            self.draw_pile.extend(self.discard)
            self.discard.clear()
            self.rng.shuffle(self.draw_pile)
        return [[self.draw_pile.pop() for _ in range(4)] for _ in range(2)]
    def discard_hand(self, hands):
        self.discard.extend(g for hand in hands for g in hand)
