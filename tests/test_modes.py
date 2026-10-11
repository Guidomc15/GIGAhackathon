"""Difficulty modes, gate catalogue and rules shared by both modes."""
import random
import unittest

from truco.classic import envido_value
from truco.game import Game, HARD_LIMIT
from truco.gates import VALID, DECK
from truco.service import Session


def session_with_cards(difficulty='normal'):
    session = Session(local=True)
    session.action({'action':'new','value':{'names':['Ana','Luis'],'difficulty':difficulty}})
    for _ in range(2):
        session.action({'action':'choose','value':0})
        session.game.q[session.game.actor].tokens = ['H','X','Z','RY:pi/6']
        session.action({'action':'edit','value':[0]})
        session.action({'action':'confirm'})
    return session


def prepare_hard(seed=0):
    game = Game(['Ana','Luis'], random.Random(seed), difficulty='hard')
    game.dispatch('choose', 0)
    return game


class ModeTests(unittest.TestCase):
    def test_pi_over_67_is_not_in_the_game(self):
        self.assertFalse(any('pi/67' in gate for gate in VALID))
        self.assertFalse(any('pi/67' in gate for gate in DECK))

    def test_normal_mode_allows_unlimited_removals(self):
        game = Game(['Ana','Luis'], random.Random(1))
        game.dispatch('choose', 0)
        for _ in range(10):
            game.dispatch('edit', [0, 1]); game.dispatch('edit', [])
        self.assertIsNone(game.removals_left[game.actor])
        self.assertIsNone(game.private_view()['removals_left'])

    def test_hard_mode_allows_two_removals_per_hand(self):
        game = prepare_hard()
        p = game.actor
        game.dispatch('edit', [0, 1, 2])
        game.dispatch('edit', [0, 1])          # removal 1 (undo)
        game.dispatch('edit', [1, 0])          # reordering is free
        self.assertEqual(game.removals_left[p], 1)
        game.dispatch('edit', [])              # removal 2 (reset)
        self.assertEqual(game.private_view()['removals_left'], 0)
        game.dispatch('edit', [3, 2])          # adding is still allowed
        with self.assertRaisesRegex(ValueError, HARD_LIMIT): game.dispatch('edit', [3])
        with self.assertRaisesRegex(ValueError, HARD_LIMIT): game.dispatch('choose', 1)
        self.assertEqual(game.q[p].sequence, [3, 2])
        self.assertEqual(game.q[p].index, 0)

    def test_hard_mode_changing_card_with_gates_counts_and_same_card_keeps_circuit(self):
        game = prepare_hard()
        p = game.actor
        game.dispatch('edit', [0])
        game.dispatch('choose', 0)
        self.assertEqual(game.q[p].sequence, [0])
        game.dispatch('choose', 1)
        self.assertEqual(game.removals_left[p], 1)
        game.dispatch('choose', 2)             # empty circuit: no removal used
        self.assertEqual(game.removals_left[p], 1)

    def test_hard_mode_limit_is_per_player_and_resets_each_hand(self):
        game = prepare_hard()
        first = game.actor
        game.dispatch('edit', [0]); game.dispatch('edit', []); game.dispatch('edit', [1]); game.dispatch('edit', [])
        game.dispatch('confirm')
        self.assertEqual(game.removals_left, [2, 2][:first] + [0] + [2, 2][first+1:])
        game.dispatch('choose', 0); game.dispatch('confirm')
        game.dispatch('fold'); game.dispatch('next')
        self.assertEqual(game.removals_left, [2, 2])

    def test_invalid_difficulty_is_rejected(self):
        with self.assertRaises(ValueError): Game(['A','B'], difficulty='expert')
        session = Session(local=True)
        view = session.safe(lambda: session.action({'action':'new','value':{'names':['A','B'],'difficulty':'x'}}))
        self.assertTrue(view['error'])
        self.assertIsNone(session.game)

    def test_card_played_player_cannot_propose_envido_after_truco(self):
        session = session_with_cards(); g = session.game
        session.action({'action':'play','value':1})
        self.assertIn('envido', g.legal())
        session.action({'action':'truco'})
        self.assertNotIn('envido', g.legal())

    def test_falta_uses_leading_score_in_this_fifteen_point_variant(self):
        self.assertEqual(envido_value(['falta'],[9,6],0),6)
        self.assertEqual(envido_value(['envido','falta'],[9,6],1),6)

    def test_full_matches_finish_in_both_modes(self):
        for difficulty in ('normal', 'hard'):
            for seed in range(2):
                session = session_with_cards(difficulty); g = session.game
                for _ in range(600):
                    if g.phase == 'match_end': break
                    if g.phase == 'prepare':
                        session.action({'action':'choose','value':0})
                        session.action({'action':'edit','value':[0]})
                        session.action({'action':'confirm'})
                    elif g.phase == 'measure': session.start()
                    else:
                        action = 'envido' if 'envido' in g.legal() else 'accept' if 'accept' in g.legal() else 'play' if 'play' in g.legal() else g.legal()[0]
                        value = next(i for i in range(3) if i not in g.played[g.actor]) if action == 'play' else None
                        session.action({'action':action,'value':value})
                else: self.fail('Match did not finish')
                self.assertEqual(max(g.scores), 15)
                records = [q['record'] for hand in g.history for q in hand['quantum'] if q and q['record']]
                self.assertTrue(records)
                self.assertTrue(all(r['method'] == 'Qiskit Statevector.sample_memory(1)' for r in records))


if __name__ == '__main__': unittest.main()
