"""Analytical noise-channel checks and regression checks for game integration."""
import math
import random
import unittest

import numpy as np
from truco.quantum import noisy_state, noise_view, preview, NOISE_T1, NOISE_T2
from truco.service import Session
from truco.classic import envido_value


def noisy_session():
    session=Session(local=True)
    session.action({'action':'new','value':{'names':['Ana','Luis'],'noise':True}})
    for _ in range(2):
        session.action({'action':'choose','value':0})
        session.game.q[session.game.actor].tokens=['H','X','Z','RY:pi/6']
        session.action({'action':'edit','value':[0]})
        session.action({'action':'confirm'})
    return session


class NoiseTests(unittest.TestCase):
    def test_channel_matches_exponential_solution_and_remains_physical(self):
        for gates in ([],['H'],['X'],['RY:pi/6'],['H','Z'],['RX:pi/2']):
            ideal=preview(gates)
            x,y,z=ideal['bloch']
            for seconds in (0,1,30,60,600):
                state=noisy_state(gates,seconds)
                view=noise_view(gates,seconds)
                expected_p1=ideal['probabilities'][1]*math.exp(-seconds/NOISE_T1)
                self.assertAlmostEqual(view['probabilities'][1],expected_p1)
                self.assertAlmostEqual(sum(view['probabilities']),1)
                self.assertTrue(state.is_valid())
                self.assertGreaterEqual(np.linalg.eigvalsh(state.data).min(),-1e-12)
                for actual,expected in zip(view['bloch'],(x*math.exp(-seconds/NOISE_T2),y*math.exp(-seconds/NOISE_T2),1+(z-1)*math.exp(-seconds/NOISE_T1))):
                    self.assertAlmostEqual(actual,expected)
                self.assertLessEqual(sum(v*v for v in view['bloch']),1+1e-12)
                self.assertAlmostEqual(view['noise_trajectory'][-1][2],view['bloch'][2])

    def test_bad_noise_times_are_rejected(self):
        for seconds in (-1,True,None,float('inf'),float('nan')):
            with self.assertRaises(ValueError): noisy_state(['H'],seconds)

    def test_clock_is_private_checked_and_freezes_after_measurement(self):
        session=noisy_session();g=session.game;p=g.actor
        tick={'action':'noise_tick','value':{'hand':g.hand_number,'player':p,'seconds':3}}
        result=session.action(tick)
        self.assertAlmostEqual(result['private']['quantum']['preview']['noise']['seconds'],3)
        self.assertEqual(g.q[1-p].noise_seconds,0)
        self.assertNotIn('private',session.action({'action':'public'}))
        self.assertNotIn('noise_seconds',session.output()['game'])
        for value in ({'hand':999,'player':p,'seconds':3},{'hand':g.hand_number,'player':1-p,'seconds':3},{'hand':g.hand_number,'player':p,'seconds':99}):
            with self.assertRaises(ValueError): session.action({'action':'noise_tick','value':value})
        session.action({'action':'envido'});session.action({'action':'accept'});session.start()
        before=[q.noise_seconds for q in g.q]
        result=session.action({'action':'noise_tick','value':{'hand':g.hand_number,'player':g.actor,'seconds':4}})
        self.assertEqual([q.noise_seconds for q in g.q],before)
        self.assertIsNotNone(result['private']['quantum']['result'])

    def test_measurement_uses_exact_displayed_distribution(self):
        session=noisy_session();g=session.game;p=g.actor
        for _ in range(6):g.q[p].age(5)
        displayed=g.quantum_report(p)['preview']['probabilities']
        session.action({'action':'play','value':0})
        session.start()
        record=g.q[p].record
        self.assertIn('DensityMatrix',record['method'])
        self.assertEqual(record['noise']['seconds'],30)
        for actual,expected in zip(record['noise']['probabilities'],displayed):self.assertAlmostEqual(actual,expected)

    def test_noise_is_never_submitted_to_ionq(self):
        session=Session()
        with self.assertRaises(ValueError): session.action({'action':'new','value':{'names':['A','B'],'noise':True}})
        session=noisy_session()
        session.action({'action':'play','value':0});session.local=False
        backend=type('Backend',(),{'run':lambda *args: self.fail('Noise was submitted remotely')})()
        with self.assertRaises(ValueError): session.start(backend)
        self.assertIsNone(session.remote)

    def test_card_played_player_cannot_propose_envido_after_truco(self):
        session=noisy_session();g=session.game
        session.action({'action':'play','value':1})
        self.assertIn('envido',g.legal())
        session.action({'action':'truco'})
        self.assertNotIn('envido',g.legal())

    def test_falta_uses_leading_score_in_this_fifteen_point_variant(self):
        self.assertEqual(envido_value(['falta'],[9,6],0),6)
        self.assertEqual(envido_value(['envido','falta'],[9,6],1),6)

    def test_full_noisy_matches_keep_sampling_and_reports_consistent(self):
        for seed in range(3):
            rng=random.Random(seed);session=noisy_session();g=session.game
            for _ in range(600):
                if g.phase=='match_end':break
                if g.phase=='prepare':
                    session.action({'action':'choose','value':0})
                    session.action({'action':'edit','value':[0]})
                    session.action({'action':'confirm'})
                elif g.phase=='measure':session.start()
                else:
                    g.q[g.actor].age(rng.random()*5) if g.phase in ('play','respond','reassert') else None
                    action='envido' if 'envido' in g.legal() else 'accept' if 'accept' in g.legal() else 'play' if 'play' in g.legal() else g.legal()[0]
                    value=next(i for i in range(3) if i not in g.played[g.actor]) if action=='play' else None
                    session.action({'action':action,'value':value})
            else:self.fail('Noisy match did not finish')
            self.assertEqual(max(g.scores),15)
            records=[q['record'] for hand in g.history for q in hand['quantum'] if q and q['record']]
            self.assertTrue(records)
            self.assertTrue(all('noise' in record for record in records))


if __name__=='__main__':unittest.main()
