"""Session API shared by local HTTP and Qollab Python imports."""
import json
import platform
import qiskit
from .game import Game
from .quantum import LocalSampler, preview
from .remote import RemoteMeasurement
from .tutorial import LESSONS

class Session:
    def __init__(self, local=False):
        self.local = local
        self.host_local = local
        self.game = None
        self.remote = None
        self.tutorial_index = 0
        self.tutorial_result = None
        self.tutorial_pending = None
        self.guided = False
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
        lesson = LESSONS[self.tutorial_index]
        result['tutorial'] = {**lesson,'index':self.tutorial_index,'total':len(LESSONS),
                              'previews':[preview(c) for c in lesson['circuits']],
                              'result':self.tutorial_result, 'pending':self.tutorial_pending is not None}
        return result
    def bot(self):
        if not self.guided or not self.game: return
        g = self.game
        for _ in range(10):
            if g.actor != 1: break
            if g.phase == 'prepare':
                g.dispatch('choose',0); g.dispatch('confirm')
                g.dispatch('truco'); break
            if g.phase == 'respond': g.dispatch('accept')
            elif g.phase == 'reassert': g.dispatch('reassert')
            elif g.phase == 'play': g.dispatch('play', next(i for i in range(3) if i not in g.played[1]))
            else: break
    def action(self, payload):
        self.error = None
        action = payload['action']; value = payload.get('value')
        if self.tutorial_pending is not None and action not in ('public','reveal','dev_mode'):
            raise ValueError('El tutorial tiene una medición pendiente. Consultá su resultado antes de continuar.')
        if action in ('new','guided','tutorial') and self.needs_measurement():
            raise ValueError('Hay una medición pendiente. Completala o consultá su resultado antes de cambiar de partida o lección.')
        if action == 'dev_mode':
            if type(value) is not bool: raise ValueError('Modo inválido')
            if self.host_local and not value: raise ValueError('El servidor local solo admite modo de desarrollo')
            if value != self.local and self.remote and self.remote.started is not None:
                raise ValueError('Consultá el resultado IonQ pendiente antes de cambiar el modo de medición.')
            self.local = value
        elif action == 'new':
            game = Game(value.get('names'), privacy=value.get('privacy', False)) if isinstance(value, dict) else Game(value)
            self.guided = False
            self.game = game
        elif action == 'guided':
            game = Game([value or 'Vos','Bot Q'])
            self.guided = True
            self.game = game
            self.game.mano = 1; self.game.actor = self.game.turn = 0
            self.game.events[0]['mano'] = 1
        elif action == 'tutorial':
            if type(value) is not int or not 0 <= value < len(LESSONS): raise ValueError('Lección inválida')
            self.tutorial_index = value; self.tutorial_result = None
        elif action == 'tutorial_sample':
            if self.game is not None and self.game.phase == 'measure':
                raise ValueError('Primero completá la medición pendiente de la partida.')
            if self.tutorial_pending is not None: raise ValueError('Ya hay una medición pendiente')
            circuits = LESSONS[self.tutorial_index]['circuits']
            if not LESSONS[self.tutorial_index]['sample']: raise ValueError('Esta lección no mide')
            if type(value) is not int or not 0 <= value < len(circuits): raise ValueError('Circuito inválido')
            self.tutorial_pending = circuits[value]
        elif action == 'reveal': return self.output(private=True)
        elif action == 'public': return self.output()
        else:
            if self.game is None: raise ValueError('Iniciá una partida')
            self.game.dispatch(action,value)
            self.bot()
        return self.output(private=action in ('choose','edit'))
    def needs_measurement(self):
        return self.tutorial_pending is not None or (self.game is not None and self.game.phase=='measure')
    def sequences(self):
        if self.tutorial_pending is not None: return [self.tutorial_pending]
        return [self.game.q[p].gates for p in self.game.measure_requests]
    def accept_measurements(self, measurements):
        if self.tutorial_pending is not None:
            bit, record = measurements[0]
            self.tutorial_result = {'bit':bit,'record':record,
                'text':f'El resultado fue {bit}: '+('original |0⟩.' if bit==0 else 'ligada |1⟩.')+' Ahora permanece fijo. Repetir es un experimento nuevo.'}
            self.tutorial_pending = None
        else:
            self.game.complete_measure(measurements)
            self.bot()
    def start(self, backend=None):
        if not self.needs_measurement(): return self.output()
        if self.local:
            sampler = LocalSampler()
            self.accept_measurements([sampler.sample(gates) for gates in self.sequences()])
            return self.output()
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
    try:
        with open("artifacts/truco-cuantico-demo.mp4", "rb") as f:
            data = base64.b64encode(f.read()).decode("ascii")
        with open("artifacts/DEMO_TRANSCRIPT.txt", encoding="utf8") as f:
            transcript = f.read()
        return json.dumps({'data':data,'transcript':transcript})
    except OSError:
        return json.dumps({'error':'Video no disponible en este paquete. Consultá DEMO_SCRIPT.md.'})
