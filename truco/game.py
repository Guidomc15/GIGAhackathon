"""Interface-independent state machine. Private projections are explicit."""
import random
from datetime import datetime, timezone
from .classic import Card, deal, strength, envido, hand_winner, ENVIDO_CHAINS, envido_value, refusal_value, GateDeck
from .quantum import QuantumCard

LABELS = {'envido':'Envido', 'real':'Real Envido', 'falta':'Falta Envido',
          'truco':'Truco', 'retruco':'Retruco', 'vale4':'Vale Cuatro',
          'accept':'Quiero', 'reject':'No quiero', 'fold':'Irse al mazo',
          'reassert':'Reafirmar canto', 'confirm':'Confirmar circuito',
          'next':'Nueva mano'}

class Game:
    def __init__(self, names, rng=None, privacy=False):
        if not isinstance(names, (list, tuple)) or len(names) != 2 or any(not isinstance(n,str) or not n.strip() or len(n)>30 for n in names):
            raise ValueError('Ingresá dos nombres de hasta 30 caracteres')
        self.names = [n.strip() for n in names]
        if type(privacy) is not bool: raise ValueError("Privacidad inválida")
        self.privacy = privacy
        self.rng = rng or random.SystemRandom()
        self.scores = [0,0]
        self.mano = self.rng.randrange(2)
        self.gate_deck = GateDeck(self.rng)
        self.history = []
        self.hand_number = 0
        self.new_hand()
    def new_hand(self):
        self.hand_number += 1
        self.cards = deal(self.rng)
        self.tokens = self.gate_deck.draw_hand()
        self.q = [None, None]
        self.played = [set(), set()]
        self.table = []
        self.bazas = []
        self.events = []
        self.actor = self.mano
        self.turn = self.mano
        self.phase = 'prepare'
        self.stake = 1
        self.truco_right = None
        self.pending = None
        self.suspended = None
        self.envido_done = False
        self.envido_result = None
        self.measure_context = None
        self.measure_requests = []
        self.last_public_measurement = None
        self.winner = None
        self.event('Reparto de mano', mano=self.mano)
    def event(self, text, **data):
        self.events.append({'text':text, 'time':datetime.now(timezone.utc).isoformat(), **data})
    def effective_card(self, player, index):
        card = self.cards[player][index]
        q = self.q[player]
        return card.linked() if q is not None and q.index == index and q.result == 1 else card
    def can_envido(self):
        return not self.envido_done and not self.bazas and self.stake == 1
    def legal(self):
        if self.phase == 'prepare': return ['choose','edit','confirm']
        if self.phase == 'play':
            result = ['play','fold']
            if self.can_envido(): result += list(ENVIDO_CHAINS[()])
            if self.stake < 4 and (self.stake == 1 or self.truco_right == self.actor):
                result += [{1:'truco',2:'retruco',3:'vale4'}[self.stake]]
            return result
        if self.phase == 'respond':
            result = ['accept','reject']
            if self.pending['kind'] == 'envido':
                result += list(ENVIDO_CHAINS.get(tuple(self.pending['chain']), ()))
            else:
                if self.pending['level'] < 4:
                    result += [{2:'retruco',3:'vale4'}[self.pending['level']]]
                if self.can_envido(): result += list(ENVIDO_CHAINS[()])
            return result
        if self.phase == 'reassert': return ['reassert']
        if self.phase == 'hand_end': return ['next']
        return []
    def dispatch(self, action, value=None):
        if action not in self.legal(): raise ValueError('Acción inválida para este estado')
        p = self.actor
        if action == 'choose':
            if type(value) is not int or not 0 <= value < 3: raise ValueError('Carta inválida')
            self.q[p] = QuantumCard(value, self.tokens[p])
        elif action == 'edit':
            if self.q[p] is None: raise ValueError('Elegí una carta')
            self.q[p].edit(value)
        elif action == 'confirm':
            if self.q[p] is None: raise ValueError('Elegí exactamente una carta')
            self.q[p].locked = True
            other = 1-p
            if self.q[other] is None or not self.q[other].locked:
                self.actor = other
            else:
                self.phase = 'play'; self.actor = self.turn = self.mano
        elif action in ('envido','real','falta'):
            if self.phase == 'respond' and self.pending['kind'] == 'envido':
                chain = self.pending['chain'] + [action]
            else:
                if self.phase == 'respond': self.suspended = self.pending.copy()
                chain = [action]
            self.pending = {'kind':'envido','chain':chain,'proposer':p}
            self.phase = 'respond'; self.actor = 1-p
            self.event(' → '.join(LABELS[c] for c in chain), player=p, kind='speech', speech=action)
        elif action in ('truco','retruco','vale4'):
            level = {'truco':2, 'retruco':3,'vale4':4}[action]
            # Raising a pending canto accepts its prior level implicitly.
            if self.phase == 'respond': self.stake = self.pending['level']
            self.pending = {'kind':'truco','level':level,'proposer':p}
            self.phase = 'respond'; self.actor = 1-p
            self.event(LABELS[action], player=p, kind='speech', speech=action)
        elif action == 'reject':
            self.event('No quiero', player=p, kind='speech', speech='reject')
            pending = self.pending
            if pending['kind'] == 'envido':
                self.envido_done = True
                self.award(pending['proposer'], refusal_value(pending['chain']), 'Envido no querido')
                self.pending = None
                if self.phase != 'match_end': self.resume_truco()
            else:
                self.finish_hand(pending['proposer'], pending['level']-1, 'Truco no querido')
        elif action == 'accept':
            self.event('Quiero', player=p, kind='speech', speech='accept')
            if self.pending['kind'] == 'truco':
                self.stake = self.pending['level']; self.truco_right = p
                self.pending = None; self.phase = 'play'; self.actor = self.turn
            else:
                self.envido_done = True
                self.envido_acceptor = p
                self.begin_measure('envido', [self.mano,1-self.mano])
        elif action == 'reassert':
            self.pending = self.suspended; self.suspended = None
            self.event('Truco reafirmado', player=p, kind='speech', speech='truco')
            self.phase = 'respond'; self.actor = 1-p
        elif action == 'play':
            if type(value) is not int or not 0 <= value < 3 or value in self.played[p]:
                raise ValueError('Carta no disponible')
            if self.q[p].index == value and self.q[p].result is None:
                self.play_intent = (p, value)
                self.begin_measure('play', [p])
            else: self.commit_play(p, value)
        elif action == 'fold':
            self.event('Al mazo', player=p, kind='speech', speech='fold')
            self.finish_hand(1-p, self.stake, 'Al mazo')
        elif action == 'next':
            self.mano = 1-self.mano
            self.new_hand()
    def begin_measure(self, context, players):
        self.measure_context = context
        self.measure_requests = [p for p in players if self.q[p].result is None]
        self.phase = 'measure'
        if not self.measure_requests: self.after_measure()
    def complete_measure(self, measurements):
        if self.phase != 'measure' or not isinstance(measurements, (list, tuple)) or len(measurements) != len(self.measure_requests):
            raise ValueError('No hay medición pendiente o lote incompleto')
        if any(not isinstance(item, (list, tuple)) or len(item) != 2 or
               type(item[0]) is not int or item[0] not in (0,1) or not isinstance(item[1], dict)
               for item in measurements):
            raise ValueError('Medición inválida')
        # Validate the whole batch before collapsing any card.
        if any(not self.q[p].locked or self.q[p].result is not None for p in self.measure_requests):
            raise ValueError('La carta no está disponible para medir')
        for p, (bit, record) in zip(self.measure_requests, measurements):
            self.q[p].collapse(bit, {**record,'moment':self.measure_context})
        self.measure_requests = []
        self.after_measure()
    def after_measure(self):
        if self.measure_context == 'envido':
            self.resolve_envido()
        else:
            p, index = self.play_intent
            self.last_public_measurement = {'player':p, **self.quantum_report(p)}
            public = {k:v for k,v in self.last_public_measurement.items() if k in ('player','original','linked','preview','result')}
            self.event('Carta medida', kind='measurement', measurement=public)
            self.commit_play(p, index)
    def resolve_envido(self):
        values = [envido([self.effective_card(p,i) for i in range(3)]) for p in (0,1)]
        winner = self.mano if values[0] == values[1] else int(values[1] > values[0])
        points = envido_value(self.pending['chain'], self.scores, 1-winner)
        self.envido_result = {'values':values,'winner':winner,'points':points}
        first = self.envido_acceptor
        self.event('Tantos de Envido', kind='speech', speech='envido_first', player=first, value=values[first])
        other = 1-first
        self.event('Respuesta de tantos', kind='speech', speech='envido_answer', player=other, value=values[other], better=values[other]>values[first], tie=values[other]==values[first], mano=other==self.mano)
        self.award(winner, points, 'Envido querido', values=values)
        self.pending = None
        if self.phase != 'match_end': self.resume_truco()
    def resume_truco(self):
        if self.suspended:
            self.phase = 'reassert'; self.actor = self.suspended['proposer']
        else:
            self.phase = 'play'; self.actor = self.turn
    def commit_play(self, p, index):
        card = self.effective_card(p,index)
        self.played[p].add(index)
        self.table.append({'player':p,'card':card.data()})
        self.event('Carta jugada', player=p, card=card.data())
        if len(self.table) % 2:
            self.turn = self.actor = 1-p; self.phase = 'play'; return
        pair = self.table[-2:]
        ranks = [strength(Card(item['card']['number'], item['card']['suit'])) for item in pair]
        winner = -1 if ranks[0] == ranks[1] else pair[int(ranks[1] > ranks[0])]['player']
        self.bazas.append(winner)
        self.event('Baza parda' if winner == -1 else 'Baza ganada', winner=winner,
                   cards=list(pair), strengths=ranks)
        outcome = hand_winner(self.bazas,self.mano)
        if outcome is not None: self.finish_hand(outcome,self.stake,'Mano ganada')
        else:
            self.turn = self.actor = pair[0]['player'] if winner == -1 else winner
            self.phase = 'play'
    def award(self, player, points, reason, **data):
        before = self.scores[player]
        self.scores[player] = min(15,self.scores[player]+points)
        self.event(reason, winner=player, points=points, gained=self.scores[player]-before, **data)
        if self.scores[player] == 15:
            self.winner = player; self.phase = 'match_end'
            self.archive()
    def finish_hand(self, winner, points, reason):
        self.award(winner,points,reason)
        if self.phase != 'match_end':
            self.winner = winner; self.archive()
            self.phase = 'hand_end'
    def archive(self):
        if self.history and self.history[-1]['hand'] == self.hand_number: return
        self.history.append({'hand':self.hand_number,'mano':self.mano,'scores':list(self.scores),
                             'quantum':[self.quantum_report(p) for p in (0,1)],
                             'cards':[[{'original':self.cards[p][i].data(), 'effective':self.effective_card(p,i).data(),
                                        'played':i in self.played[p], 'quantum':self.q[p] is not None and self.q[p].index==i}
                                       for i in range(3)] for p in (0,1)],
                             'events':list(self.events),'bazas':list(self.bazas)})
        self.gate_deck.discard_hand(self.tokens)
    def quantum_report(self,p):
        q = self.q[p]
        if q is None: return None
        original = self.cards[p][q.index]
        return {'original':original.data(), 'linked':original.linked().data(),
                'tokens':list(q.tokens),'sequence':list(q.sequence), 'preview':q.view(),
                'result':q.result,'record':q.record,'locked':q.locked,
                'discarded':[g for i,g in enumerate(q.tokens) if i not in q.sequence],
                'explanation': 'Terminó sin producir un resultado clásico.' if q.result is None else
                f'La medición produjo {q.result}. La identidad permanece fija durante la mano.'}
    def public_view(self):
        data = {'names':self.names,'scores':self.scores,'mano':self.mano,'actor':self.actor,
                'phase':self.phase,'hand':self.hand_number,'stake':self.stake,
                'bazas':self.bazas,'table':self.table,'pending':self.pending,
                'envido':self.envido_result,'events':self.events,
                'actions':[{'id':a,'label':LABELS.get(a,a),'hint':self.action_hint(a)} for a in self.legal() if a not in ('choose','edit','play')],
                'winner':self.winner, 'privacy':self.privacy}
        if self.last_public_measurement and self.phase != 'measure':
            # The explicit public-play exception discloses circuit and preview, never tokens.
            data['public_measurement'] = {k:v for k,v in self.last_public_measurement.items() if k in ('player','original','linked','preview','result','record')}
        if self.phase == 'measure' and self.measure_context == 'play':
            p = self.play_intent[0]
            report = self.quantum_report(p)
            data['public_measurement'] = {k:v for k,v in report.items() if k in ('original','linked','preview','result')}
        if self.phase == 'match_end': data['history'] = self.history
        if self.phase in ('hand_end','match_end'): data['report'] = self.history[-1]
        return data
    def action_hint(self, action):
        if action == 'accept':
            if self.pending['kind'] == 'truco':
                return f"La mano pasa a valer {self.pending['level']} puntos. Después se sigue jugando."
            chain = self.pending['chain']
            stake = '15 menos el puntaje del perdedor' if chain[-1] == 'falta' else str(envido_value(chain))
            return f'El ganador suma {stake} puntos. Se miden las cartas cuánticas que aún no se midieron.'
        if action == 'reject':
            pending = self.pending
            points = refusal_value(pending['chain']) if pending['kind'] == 'envido' else pending['level']-1
            ending = 'La mano continúa.' if pending['kind'] == 'envido' else 'La mano termina.'
            if self.scores[pending['proposer']] + points >= 15: ending = 'Llega a 15 y gana la partida.'
            return f"{self.names[pending['proposer']]} suma {points} {'punto' if points == 1 else 'puntos'}. {ending}"
        if action == 'fold':
            return f"{self.names[1-self.actor]} suma {self.stake} {'punto' if self.stake == 1 else 'puntos'}. La mano termina."
        if action in ('truco','retruco','vale4'):
            points = {'truco':2,'retruco':3,'vale4':4}[action]
            return f'Si el rival acepta, la mano vale {points} puntos; si rechaza, ganás {points-1}.'
        if action in ('envido','real','falta'):
            chain = self.pending['chain'] + [action] if self.pending and self.pending['kind'] == 'envido' else [action]
            if action == 'falta': return 'Si acepta: 15 menos el puntaje del perdedor. Se define con los tantos.'
            return f'Si acepta: {envido_value(chain)} puntos por los tantos, aparte de la mano.'
        return {'reassert':'El rival debe responder al Truco que quedó pendiente.',
                'next':'Se reparten tres cartas nuevas y cambia el jugador mano.'}.get(action, '')
    def private_view(self):
        if self.phase not in ('prepare','play','respond','reassert'): return {}
        p = self.actor
        data = {'player':p,'quantum':self.quantum_report(p)}
        if self.phase in ('prepare','play','respond','reassert'):
            data['cards'] = [{**self.effective_card(p,i).data(),'index':i,'played':i in self.played[p],
                              'quantum':self.q[p] is not None and self.q[p].index == i} for i in range(3)]
        if self.phase == 'prepare': data['tokens'] = self.tokens[p]
        return data
