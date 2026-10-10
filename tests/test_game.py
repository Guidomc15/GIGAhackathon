"""Rule and state regressions, including actual local Qiskit sampling."""
from collections import Counter
from itertools import product
import random
import unittest

from truco.classic import Card, DECK, GATES, PAIRS, deal, envido, hand_winner
from truco.game import Game
from truco.quantum import LocalSampler
from truco.service import Session


def prepared(seed=0):
    game = Game(['Ana', 'Luis'], random.Random(seed))
    for _ in range(2):
        game.dispatch('choose', 0)
        game.dispatch('edit', [0])
        game.dispatch('confirm')
    return game


class RulesTests(unittest.TestCase):
    def test_deals_have_six_distinct_pairs(self):
        self.assertEqual(len(DECK), 40)
        self.assertEqual(len(PAIRS), 20)
        rng = random.Random(42)
        for _ in range(100):
            cards = sum(deal(rng), [])
            self.assertEqual(len(set(cards)), 6)
            self.assertTrue(all(card.linked() not in cards for card in cards))

    def test_envido_uses_best_same_suit_pair(self):
        self.assertEqual(envido([Card(n, 'oro') for n in (7, 6, 5)]), 33)
        self.assertEqual(envido([Card(10, 'oro'), Card(12, 'oro'), Card(7, 'basto')]), 20)
        self.assertEqual(envido([Card(7, 'oro'), Card(6, 'basto'), Card(10, 'copa')]), 7)

    def test_baza_results_and_pardas(self):
        for mano in (0, 1):
            for first, second, third in product((-1, 0, 1), repeat=3):
                if first != -1 and second in (first, -1): expected = first
                elif first == -1 and second != -1: expected = second
                elif third != -1: expected = third
                else: expected = first if first != -1 else mano
                self.assertEqual(hand_winner([first, second, third], mano), expected)


class GameTests(unittest.TestCase):
    def test_response_and_reassert_keep_cards_visible_but_not_playable(self):
        game=prepared();game.dispatch('truco')
        self.assertEqual(len(game.private_view()['cards']),3)
        self.assertNotIn('play',game.legal())
        game.dispatch('envido');game.dispatch('reject')
        self.assertEqual(game.phase,'reassert')
        self.assertEqual(len(game.private_view()['cards']),3)

    def test_envido_announces_real_values_automatically_and_tie_favors_mano(self):
        game=prepared();game.cards=[[Card(7,'oro'),Card(6,'oro'),Card(4,'basto')],
                                   [Card(7,'copa'),Card(6,'copa'),Card(4,'espada')]]
        game.dispatch('envido');acceptor=game.actor;game.dispatch('accept')
        game.complete_measure([(0,{}),(0,{})])
        self.assertEqual(game.phase,'play')
        self.assertEqual(game.envido_result['values'],[33,33])
        self.assertEqual(game.envido_result['winner'],game.mano)
        speeches=[e for e in game.events if e.get('speech') in ('envido_first','envido_answer')]
        self.assertEqual([e['player'] for e in speeches],[acceptor,1-acceptor])
        self.assertEqual([e['value'] for e in speeches],[33,33])
        self.assertTrue(speeches[-1]['tie'])
        self.assertNotIn('hide',game.legal())

    def test_result_precedes_optional_public_report_and_contains_both_players(self):
        game=prepared();self.assertNotIn('report',game.public_view())
        game.dispatch('fold')
        self.assertEqual(game.phase,'hand_end')
        report=game.public_view()['report']
        self.assertEqual(len(report['quantum']),2)
        self.assertEqual([len(cards) for cards in report['cards']],[3,3])
        self.assertEqual(report['cards'][0][0]['original'],game.cards[0][0].data())
        self.assertEqual(game.private_view(),{})
        self.assertEqual(game.legal(),['next'])

    def test_names_require_two_strings_in_a_list(self):
        for names in ('AB', None, ['Solo'], ['Ana', 3], ['', 'Luis']):
            with self.assertRaises(ValueError): Game(names)

    def test_measurement_batch_is_atomic(self):
        game = prepared()
        game.dispatch('envido'); game.dispatch('accept')
        players = list(game.measure_requests)
        for batch in ([(0, {}), (1, None)], [(0, {}), (True, {})], [(0, {})], None):
            with self.assertRaises(ValueError): game.complete_measure(batch)
            self.assertEqual([game.q[p].result for p in players], [None, None])
        game.complete_measure([(0, {}), (1, {})])
        with self.assertRaises(ValueError): game.complete_measure([(0, {}), (1, {})])

    def test_public_play_does_not_label_later_envido_as_public(self):
        game = prepared()
        game.dispatch('play', 0)
        game.complete_measure([(1, {})])
        self.assertIn('public_measurement', game.public_view())
        game.dispatch('envido'); game.dispatch('accept')
        self.assertNotIn('public_measurement', game.public_view())
        self.assertEqual(len(game.measure_requests), 1)

    def test_envido_pauses_truco_and_preserves_measurements(self):
        game = prepared()
        proposer = game.actor
        game.dispatch('truco'); game.dispatch('envido'); game.dispatch('accept')
        sampler = LocalSampler()
        game.complete_measure([sampler.sample(game.q[p].gates) for p in game.measure_requests])
        results = [q.result for q in game.q]
        self.assertEqual(game.phase, 'reassert')
        self.assertEqual(game.actor, proposer)
        game.dispatch('reassert'); game.dispatch('accept')
        game.dispatch('play', 0)
        self.assertEqual([q.result for q in game.q], results)
        self.assertNotEqual(game.phase, 'measure')

    def test_canto_hints_match_accepted_and_refused_values(self):
        game = prepared(); game.dispatch('truco')
        self.assertIn('2 puntos', game.action_hint('accept'))
        self.assertIn('1 punto', game.action_hint('reject'))
        game.dispatch('envido'); game.dispatch('real')
        self.assertIn('5 puntos', game.action_hint('accept'))
        self.assertIn('2 puntos', game.action_hint('reject'))
        game.dispatch('reject'); game.dispatch('reassert'); game.dispatch('retruco')
        self.assertIn('3 puntos', game.action_hint('accept'))
        self.assertIn('2 puntos', game.action_hint('reject'))

    def test_baza_explains_strength_instead_of_printed_number(self):
        game = prepared(); first = game.actor
        game.cards[first][1] = Card(1, 'espada')
        game.cards[1-first][1] = Card(3, 'oro')
        game.dispatch('play', 1); game.dispatch('play', 1)
        event = game.events[-1]
        self.assertEqual(event['winner'], first)
        self.assertEqual(event['strengths'], [14, 10])
        self.assertEqual([item['card']['number'] for item in event['cards']], [1, 3])

    def test_falta_can_end_match_without_playing_a_card(self):
        game = prepared(); game.scores = [14, 14]
        game.dispatch('falta'); game.dispatch('accept')
        game.complete_measure([(0, {}), (0, {})])
        self.assertEqual(game.phase, 'match_end')
        self.assertEqual(max(game.scores), 15)
        self.assertEqual(len(game.history), 1)

    def test_full_matches_with_varied_legal_actions(self):
        sampler = LocalSampler()
        seen = set()
        for seed in range(12):
            rng = random.Random(seed)
            game = Game(['Ana', 'Luis'], rng)
            forced_suspend = False
            for _ in range(1500):
                seen.add(game.phase)
                if game.phase == 'match_end':
                    self.assertEqual(max(game.scores), 15)
                    self.assertEqual(Counter(game.gate_deck.draw_pile + game.gate_deck.discard), Counter(GATES))
                    break
                if game.phase == 'prepare':
                    game.dispatch('choose', rng.randrange(3))
                    game.dispatch('edit', rng.sample(range(4), rng.randrange(4)))
                    game.dispatch('confirm')
                elif game.phase == 'measure':
                    game.complete_measure([sampler.sample(game.q[p].gates) for p in game.measure_requests])
                else:
                    if seed == 0 and game.phase == 'play' and not forced_suspend:
                        # Guarantee this branch rather than depending on random samples.
                        game.dispatch('truco'); game.dispatch('envido'); game.dispatch('accept')
                        forced_suspend = True
                        continue
                    action = rng.choice(game.legal())
                    value = rng.choice([i for i in range(3) if i not in game.played[game.actor]]) if action == 'play' else None
                    game.dispatch(action, value)
            else: self.fail('A match did not finish')
        self.assertTrue({'measure', 'hand_end', 'respond', 'reassert'} <= seen)


class SessionTests(unittest.TestCase):
    def test_privacy_is_optional_and_validated_at_start(self):
        session=Session(local=True)
        self.assertFalse(session.action({'action':'new','value':['Ana','Luis']})['game']['privacy'])
        view=session.action({'action':'new','value':{'names':['Ana','Luis'],'privacy':True}})
        self.assertTrue(view['game']['privacy']);self.assertNotIn('private',view)
        game=session.game
        with self.assertRaises(ValueError): session.action({'action':'new','value':{'names':['Ana','Luis'],'privacy':'yes'}})
        self.assertIs(session.game,game)

    def test_pending_tutorial_cannot_change_context(self):
        session = Session(local=True)
        session.action({'action':'tutorial', 'value':1})
        session.action({'action':'tutorial_sample', 'value':0})
        for action, value in (('tutorial',2), ('new',['Ana','Luis']), ('guided','Vos')):
            with self.assertRaises(ValueError): session.action({'action':action, 'value':value})
        self.assertTrue(session.output()['tutorial']['pending'])
        result = session.start()['tutorial']
        self.assertEqual(result['index'], 1)
        self.assertEqual(result['result']['bit'], 1)
        self.assertFalse(result['pending'])

    def test_invalid_new_keeps_guided_game(self):
        session = Session(local=True)
        session.action({'action':'guided', 'value':'Vos'})
        game = session.game
        with self.assertRaises(ValueError): session.action({'action':'new', 'value':['Solo']})
        self.assertTrue(session.guided)
        self.assertIs(session.game, game)
        self.assertEqual(game.events[0]['mano'], game.mano)

    def test_pending_game_cannot_receive_tutorial_measurements(self):
        session = Session(local=True); session.game = prepared()
        session.game.dispatch('play', 0)
        with self.assertRaises(ValueError): session.action({'action':'tutorial_sample', 'value':0})
        self.assertIsNone(session.tutorial_pending)

    def test_pending_tutorial_cannot_mutate_existing_game(self):
        session = Session(local=True); session.game = prepared()
        session.action({'action':'tutorial','value':1})
        session.action({'action':'tutorial_sample','value':0})
        with self.assertRaises(ValueError): session.action({'action':'play','value':0})
        self.assertEqual(session.game.phase, 'play')
        self.assertEqual(session.game.table, [])

    def test_guided_bot_hand_finishes(self):
        session = Session(local=True)
        session.action({'action':'guided', 'value':'Vos'})
        for action, value in (('choose',0), ('edit',[0]), ('confirm',None), ('envido',None)):
            session.action({'action':action, 'value':value})
        session.start(); session.action({'action':'accept'})
        for _ in range(20):
            game = session.game
            if game.phase == 'hand_end': break
            if game.phase == 'measure': session.start()
            elif game.phase == 'report': session.action({'action':'hide'})
            else:
                self.assertEqual(game.actor, 0)
                session.action({'action':'play','value':next(i for i in range(3) if i not in game.played[0])})
        self.assertEqual(session.game.phase, 'hand_end')
        self.assertTrue(session.game.history)
