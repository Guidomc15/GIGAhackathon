"""Session API shared by local HTTP and Qollab Python imports."""
import json
import platform
import qiskit
from .game import Game
from .quantum import LocalSampler
from .remote import RemoteMeasurement
from . import tutorial

class Session:
    def __init__(self, local=False):
        self.local = local
        self.host_local = local
        self.game = None
        self.remote = None
        self.guided = False  # True while the scripted tutorial match is active.
        self.coach = 0  # Index of the current tutorial step.
        self.error = None
        self.errors = []
    def output(self, private=False):
        result = {'mode':LocalSampler.name if self.local else 'Qollab · IonQ injected backend · one-job limit',
                  'development_mode':self.local, 'host_local':self.host_local,
                  'versions':{'python':platform.python_version(),'qiskit':qiskit.__version__},
                  'error':self.error,'guided':self.guided, 'remote_info':self.remote.info() if self.remote else None,
                  'remote_error':self.remote.last_error if self.remote else None}
        if self.game:
            result['game'] = self.game.public_view()
            if private: result['private'] = self.game.private_view()
        if self.guided: result['coach'] = self.coach_view()
        return result
    def coach_view(self):
        explained = [i for i, s in enumerate(tutorial.STEPS) if 'bot' not in s]
        step = tutorial.STEPS[self.coach]
        return {'title':step['title'], 'text':step['text'], 'target':step.get('target'),
                'expect':step.get('expect'), 'final':step.get('final', False),
                'step':explained.index(self.coach)+1, 'total':len(explained)}
    def advance(self):
        """Move past the current step and play Bot Q's scripted moves."""
        self.coach += 1
        while self.coach < len(tutorial.STEPS) and 'bot' in tutorial.STEPS[self.coach]:
            action, value = tutorial.STEPS[self.coach]['bot']
            if self.game.actor != 1: raise RuntimeError('Guion del tutorial desincronizado')
            self.game.dispatch(action, value)
            self.coach += 1
    def tutorial_action(self, action, value):
        step = tutorial.STEPS[self.coach]
        if action == 'coach_next':
            if step.get('expect') or step.get('final'): raise ValueError('Seguí la indicación de Bot Q para continuar.')
            self.advance()
            return
        if step.get('expect') != [action, value]:
            raise ValueError('En el tutorial, seguí la indicación de Bot Q: ' + step['title'] + '.')
        self.game.dispatch(action, value)
        self.advance()
    def action(self, payload):
        self.error = None
        action = payload['action']; value = payload.get('value')
        if action in ('new','tutorial') and self.needs_measurement():
            raise ValueError('Hay una medición pendiente. Completala o consultá su resultado antes de cambiar de partida o lección.')
        if action == 'dev_mode':
            if type(value) is not bool: raise ValueError('Modo inválido')
            if self.host_local and not value: raise ValueError('El servidor local solo admite modo de desarrollo')
            if value != self.local and self.remote and self.remote.started is not None:
                raise ValueError('Consultá el resultado IonQ pendiente antes de cambiar el modo de medición.')
            self.local = value
        elif action == 'new':
            if isinstance(value,dict) and value.get('noise',False) and not self.local:
                raise ValueError('El ruido educativo requiere simulación local con Qiskit; no se agrega a IonQ.')
            game = Game(value.get('names'), privacy=value.get('privacy', False), noise=value.get('noise',False)) if isinstance(value, dict) else Game(value)
            self.guided = False
            self.game = game
        elif action == 'tutorial':
            # Classic Truco against scripted Bot Q; the quantum card is not used yet.
            self.game = Game(list(tutorial.NAMES), quantum=False, deals=tutorial.DEALS, mano=tutorial.MANO)
            self.guided = True
            self.coach = -1
            self.advance()
        elif action == 'noise_tick':
            if not self.local or not self.game or not self.game.noise:
                raise ValueError('El ruido educativo no está activo')
            g=self.game
            if not isinstance(value,dict) or type(value.get('hand')) is not int or type(value.get('player')) is not int or value.get('hand') != g.hand_number or value.get('player') != g.actor or g.phase not in ('play','respond','reassert'):
                raise ValueError('El turno del ruido cambió')
            g.q[g.actor].age(value.get('seconds'))
            return self.output(private=True)
        elif action == 'reveal': return self.output(private=True)
        elif action == 'public': return self.output()
        else:
            if self.game is None: raise ValueError('Iniciá una partida')
            if self.guided: self.tutorial_action(action, value)
            else: self.game.dispatch(action,value)
        return self.output(private=action in ('choose','edit'))
    def needs_measurement(self):
        return self.game is not None and self.game.phase=='measure'
    def sequences(self):
        return [self.game.q[p].gates for p in self.game.measure_requests]
    def accept_measurements(self, measurements):
        self.game.complete_measure(measurements)
    def start(self, backend=None):
        if not self.needs_measurement(): return self.output()
        if self.local:
            sampler = LocalSampler()
            times = [self.game.q[p].noise_seconds if self.game.noise else None for p in self.game.measure_requests]
            self.accept_measurements([sampler.sample(gates, seconds) for gates,seconds in zip(self.sequences(),times)])
            return self.output()
        if self.game.noise:
            raise ValueError('Esta partida usa ruido educativo local. Elegí simulación local para medirla; no se envía a IonQ.')
        if self.remote is None: self.remote = RemoteMeasurement(backend)
        self.remote.start(self.sequences())
        return self.output()
    def poll(self):
        if self.local: return {'done':True,'view':self.output()}
        response = self.remote.poll()
        if response['done']:
            self.accept_measurements(response['measurements'])
            self.remote.release()
        return {'done':response['done'],'view':self.output()}
    def safe(self, fn):
        self.error = None
        try: return fn()
        except (ValueError,RuntimeError,TimeoutError) as exc:
            self.error = str(exc)
            self.errors.append({'type':type(exc).__name__,'message':self.error})
            return self.output()
        except Exception as exc:
            # Do not return arbitrary provider errors which can contain credentials.
            self.error = f'Falló la operación ({type(exc).__name__}). No se generó un resultado.'
            self.errors.append({'type':type(exc).__name__})
            return self.output()

# In Qollab the Python module is imported once per run; all state stays in memory.
_session = Session()

def dispatch_json(payload):
    return json.dumps(_session.safe(lambda:_session.action(json.loads(payload))))

def start_json(backend):
    return json.dumps(_session.safe(lambda:_session.start(backend)))

def poll_json():
    return json.dumps(_session.safe(_session.poll))


def demo_json():
    import base64
    # Source checkouts keep artifacts/; Qollab's flat upload keeps root files.
    for prefix in ('artifacts/', ''):
        try:
            with open(prefix + 'truco-cuantico-demo.mp4', 'rb') as f:
                data = base64.b64encode(f.read()).decode('ascii')
            with open(prefix + 'DEMO_TRANSCRIPT.txt', encoding='utf8') as f:
                transcript = f.read()
            return json.dumps({'data':data,'transcript':transcript})
        except OSError:
            continue
    return json.dumps({'error':'Video no disponible en este paquete. Consultá DEMO_SCRIPT.md.'})
