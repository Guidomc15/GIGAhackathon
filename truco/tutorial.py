"""Tutorials, in Spanish and English.

1. Truco with Bot Q: one scripted match on the real engine. Hands 1-3 are classic
   Truco; hand 4 adds the quantum card. Each step is one of:
     - an explanation ('title'/'text'), advanced with «Siguiente»;
     - an explanation with 'expect': the only game action the player may take;
     - a 'bot' move, executed automatically by the session;
     - a 'challenge' or a 'quiz' (hands 1-3 practise what the slides taught).
   'target' is a CSS selector the interface highlights. [X], [Y], [Z] are painted
   with the colour of that Bloch-sphere axis.
2. Gates and the Bloch sphere: lessons with Qiskit previews of each circuit.

Sources used for the explanations: the Argentine Truco rulebook published by
folkloretradiciones.com.ar, IBM Quantum Learning ("Bits, gates and circuits") and
the Quantum Education Modules page "Common quantum gates".
"""

NAMES = {'es': ('Vos', 'Bot Q'), 'en': ('You', 'Bot Q')}
MANO = 0  # The player is mano in the first hand.

# Fixed deals: [player cards, Bot Q cards]. Card indices in 'expect' and 'bot'
# refer to these positions.
DEALS = (
    # Hand 1 · reading the table, card strength, bazas.
    {'cards': (((3, 'espada'), (5, 'copa'), (12, 'basto')),
               ((2, 'oro'), (4, 'copa'), (11, 'espada')))},
    # Hand 2 · Bot Q is mano and calls Envido (player 33, Bot Q 30); parda.
    {'cards': (((7, 'oro'), (6, 'oro'), (4, 'basto')),
               ((3, 'copa'), (6, 'espada'), (4, 'espada')))},
    # Hand 3 · Truco and Retruco.
    {'cards': (((1, 'espada'), (3, 'oro'), (5, 'basto')),
               ((1, 'basto'), (12, 'oro'), (10, 'copa')))},
    # Hand 4 · the quantum card. X turns the weak 7 of cups into the 7 of swords.
    {'cards': (((7, 'copa'), (4, 'oro'), (5, 'basto')),
               ((3, 'espada'), (6, 'copa'), (4, 'basto'))),
     'quantum': True, 'tokens': (('X', 'H', 'Z', 'RY:pi/2'), ('H', 'H', 'Z', 'Z'))},
)

# Hands 1-3 are a practice of what the slides taught. Besides the step types above:
#   - 'challenge': every legal game action stays enabled; a wrong one is not played and
#     the player gets the hint for that action ('hints', keyed 'action:value' or
#     'action'), or the step's default 'hint'.
#   - 'quiz': a question answered in Bot Q's panel; 'answer' is the right option.
# 'ok' is shown after a right answer.
CALL_HINT = ('Acá no hace falta cantar: el desafío es elegir la carta.',
             'No call is needed here: the challenge is choosing the card.')
FOLD_HINT = ('Irse al mazo le regala la mano al rival. Seguí jugando.',
             'Going to the deck (fold) hands the hand to your opponent. Keep playing.')
CALLS = {k: CALL_HINT for k in ('envido', 'real', 'falta', 'truco', 'retruco', 'vale4')}

STEPS = (
    # ---------- Hand 1 · strength and bazas ----------
    {'title': 'Práctica con Bot Q',
     'text': 'Ya viste las reglas; ahora las ponemos en práctica en cuatro manos: tres de Truco '
             'clásico y una con la carta cuántica. En los desafíos elegís vos: si te equivocás, la '
             'jugada no se hace y te doy una pista. El marcador está arriba: gana el primero que '
             'llega a 15.',
     'title_en': 'Practice with Bot Q',
     'text_en': 'You have seen the rules; now let’s practise them over four hands: three of classic '
                'Truco and one with the quantum card. In the challenges you choose: if you get it '
                'wrong, the move is not played and I give you a hint. The scoreboard is at the top: '
                'the first to reach 15 wins.',
     'target': '.scoreboard'},
    {'title': 'Desafío: ganá la primera baza',
     'text': 'Salís vos. Tenés el 3 de espada, el 5 de copa y el 12 de basto. Abrí con la carta que '
             'tiene más chances de ganar.',
     'title_en': 'Challenge: win the first baza',
     'text_en': 'You lead. You hold the 3 of Swords, the 5 of Cups and the 12 of Clubs. Open with the '
                'card most likely to win.',
     'target': '.live-hand', 'expect': ['play', 0], 'challenge': True,
     'hint': ('Mirá la escala: ¿cuál de tus tres cartas está más arriba?',
              'Check the ladder: which of your three cards is highest?'),
     'hints': {**CALLS, 'fold': FOLD_HINT,
               'play:1': ('El 5 está casi al fondo de la escala: solo le gana a los 4.',
                          'The 5 is near the bottom of the ladder: it only beats the 4s.'),
               'play:2': ('El 12 es bueno, pero los 3 están más arriba en la escala.',
                          'The 12 is decent, but the 3s are higher on the ladder.')},
     'ok': ('¡Bien! Los 3 están justo debajo de las cuatro bravas.',
            'Well done! The 3s sit right below the four bravas.')},
    {'bot': ['play', 0]},
    {'title': 'Ganaste la primera baza',
     'text': 'Tu 3 le ganó a mi 2 de oro. Después de cada baza aparece un aviso: cerralo con '
             '«Continuar» o elegí un tiempo automático con ⏱. Quien gana una baza sale primero en la '
             'siguiente.',
     'title_en': 'You won the first baza',
     'text_en': 'Your 3 beat my 2 of Coins. After each baza a notice appears: close it with “Continue” '
                'or choose an automatic time with ⏱. Whoever wins a baza leads the next one.',
     'target': '.played-bazas'},
    {'title': 'Pregunta rápida',
     'text': '¿Cuántas bazas más necesitás para ganar esta mano?',
     'title_en': 'Quick question',
     'text_en': 'How many more bazas do you need to win this hand?',
     'target': '.played-bazas',
     'quiz': {'options': (('1', '1'), ('2', '2'), ('3', '3')), 'answer': 0},
     'hint': ('La mano se gana con dos de las tres bazas, y ya tenés una.',
              'The hand is won with two of the three bazas, and you already have one.'),
     'ok': ('Una más: con dos bazas la mano es tuya.', 'One more: with two bazas the hand is yours.')},
    {'title': 'Desafío: cerrá la mano',
     'text': 'Te quedan el 5 de copa y el 12 de basto. Jugá la que tiene más chances de ganar.',
     'title_en': 'Challenge: close the hand',
     'text_en': 'You have the 5 of Cups and the 12 of Clubs left. Play the one more likely to win.',
     'target': '.live-hand', 'expect': ['play', 2], 'challenge': True,
     'hint': ('Compará las dos en la escala.', 'Compare both on the ladder.'),
     'hints': {**CALLS, 'fold': FOLD_HINT,
               'play:1': ('El 5 está casi al fondo de la escala; el 12 está bastante más arriba.',
                          'The 5 is near the bottom of the ladder; the 12 is well above it.')}},
    {'bot': ['play', 2]},
    {'title': 'Ganaste la mano',
     'text': 'Tu 12 le ganó a mi 11: dos bazas, y como nadie cantó, sumás 1 punto. Tocá «Nueva '
             'mano»: ahora soy mano yo.',
     'title_en': 'You won the hand',
     'text_en': 'Your 12 beat my 11: two bazas, and since nobody called, you score 1 point. Press “Next '
                'hand”: now I am mano.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 2 · Envido and parda ----------
    {'bot': ['envido', None]},
    {'title': 'Te canté Envido',
     'text': 'Soy mano y canté Envido antes de tirar. Antes de responder, contá tus tantos: tenés '
             '7 de oro, 6 de oro y 4 de basto. ¿Cuántos son?',
     'title_en': 'I called Envido',
     'text_en': 'I am mano and called Envido before playing. Before you answer, count your tantos: '
                'you hold the 7 of Coins, the 6 of Coins and the 4 of Clubs. How many are they?',
     'target': '.live-hand',
     'quiz': {'options': (('13', '13'), ('17', '17'), ('33', '33')), 'answer': 2},
     'hint': ('Tenés dos cartas de oro: sumá sus valores y agregá 20.',
              'You hold two Coins: add their values plus 20.'),
     'ok': ('¡Bien! 7 + 6 + 20 = 33, el máximo posible.', 'Right! 7 + 6 + 20 = 33, the highest possible.')},
    {'title': 'Aceptá el Envido',
     'text': 'Con 33 no podés perder. Podrías subir con Envido, Real Envido o Falta Envido, pero '
             'esta vez tocá «Quiero»: se comparan los tantos y el ganador suma 2.',
     'title_en': 'Accept the Envido',
     'text_en': 'With 33 you cannot lose. You could raise with Envido, Real Envido or Falta Envido, '
                'but this time press “Quiero”: the counts are compared and the winner scores 2.',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Ganaste el Envido',
     'text': 'Tus 33 contra mis 30: sumaste 2. Los puntos del Envido van aparte y la mano sigue: ya '
             'tiré mi 3 de copa.',
     'title_en': 'You won the Envido',
     'text_en': 'Your 33 against my 30: you scored 2. Envido points are separate and the hand goes '
                'on: I have already played my 3 of Cups.',
     'target': '.scoreboard'},
    {'title': 'Desafío: ganale a mi 3',
     'text': 'Mi 3 de copa está alto en la escala. Solo una de tus cartas le gana.',
     'title_en': 'Challenge: beat my 3',
     'text_en': 'My 3 of Cups is high on the ladder. Only one of your cards beats it.',
     'target': '.live-hand', 'expect': ['play', 0], 'challenge': True,
     'hint': ('Buscá una de las cuatro bravas.', 'Look for one of the four bravas.'),
     'hints': {**CALLS, 'fold': FOLD_HINT,
               'play:1': ('El 6 está por debajo del 3: perderías la baza.',
                          'The 6 is below the 3: you would lose the baza.'),
               'play:2': ('El 4 es de las cartas más bajas del juego.',
                          'The 4 is among the lowest cards in the game.')},
     'ok': ('¡Eso! El 7 de oro es una brava.', 'That’s it! The 7 of Coins is a brava.')},
    {'title': 'Salís vos',
     'text': 'Ganaste la baza, así que abrís la segunda. Jugá tu 6 de oro.',
     'title_en': 'You lead',
     'text_en': 'You won the baza, so you lead the second one. Play your 6 of Coins.',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': 'Baza parda',
     'text': 'Mi 6 de espada y tu 6 de oro tienen la misma fuerza: la segunda baza es parda. '
             '¿Quién gana la mano?',
     'title_en': 'A parda (tied baza)',
     'text_en': 'My 6 of Swords and your 6 of Coins have the same strength: the second baza is a '
                'parda. Who wins the hand?',
     'target': '.outcome',
     'quiz': {'options': (('Yo, porque gané la primera', 'Me, because I won the first one'),
                          ('Bot Q, porque es mano', 'Bot Q, because it is mano'),
                          ('Hay que jugar la tercera', 'The third baza must be played')),
              'answer': 0},
     'hint': ('Si una baza es parda, decide la otra que ya tiene ganador.',
              'When a baza is a parda, the other baza that has a winner decides.'),
     'ok': ('Correcto: si la primera tiene ganador y la segunda es parda, gana quien ganó la primera.',
            'Correct: if the first baza has a winner and the second is a parda, the winner of the first takes the hand.')},
    {'title': 'Otro punto',
     'text': 'Ganaste la mano: 1 punto más. Si las tres bazas fueran pardas, ganaría el mano. Tocá '
             '«Nueva mano».',
     'title_en': 'Another point',
     'text_en': 'You won the hand: 1 more point. If all three bazas were pardas, the mano would win. '
                'Press “Next hand”.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 3 · Truco and Retruco ----------
    {'title': 'Desafío: es tu momento',
     'text': 'Sos mano y tenés el ancho de espada, la mejor carta del juego, con el 3 de oro y el '
             '5 de basto. Hacé la apuesta que sube lo que vale la mano.',
     'title_en': 'Challenge: your moment',
     'text_en': 'You are mano and hold the ancho de espada, the best card in the game, with the 3 of '
                'Coins and the 5 of Clubs. Make the bet that raises what the hand is worth.',
     'target': '.live-hand', 'expect': ['truco', None], 'challenge': True,
     'hint': ('La apuesta sobre la mano es el Truco.', 'The bet on the hand is the Truco.'),
     'hints': {'fold': ('¿Irte al mazo con el ancho de espada? Tenés la mejor carta del juego.',
                        'Fold with the ancho de espada? You hold the best card in the game.'),
               'play': ('Antes de tirar, aprovechá tu mano fuerte para apostar.',
                        'Before playing, use your strong hand to bet.'),
               **{k: ('Tus tantos son 5: no tenés dos cartas del mismo palo. Tu fuerza está en las cartas, no en el Envido.',
                      'Your tantos are 5: no two cards share a suit. Your strength is in the cards, not the Envido.')
                  for k in ('envido', 'real', 'falta')}}},
    {'bot': ['accept', None]},
    {'title': 'Dije «Quiero»',
     'text': 'Acepté el Truco: la mano vale 2. ¿Quién puede cantar Retruco ahora?',
     'title_en': 'I said “Quiero”',
     'text_en': 'I accepted the Truco: the hand is worth 2. Who may call Retruco now?',
     'target': '.table-status',
     'quiz': {'options': (('Yo, porque canté Truco', 'Me, because I called Truco'),
                          ('Bot Q, porque aceptó', 'Bot Q, because it accepted'),
                          ('Cualquiera de los dos', 'Either player')),
              'answer': 1},
     'hint': ('Solo puede subir la apuesta quien acaba de aceptar.', 'Only the player who has just accepted may raise.'),
     'ok': ('Exacto: subir es derecho de quien aceptó. Y una vez aceptado el Truco, ya no se puede cantar Envido.',
            'Exactly: raising belongs to whoever accepted. And once Truco is accepted, Envido can no longer be called.')},
    {'title': 'Desafío: guardá las fuertes',
     'text': 'La mano vale 2. Abrí sin gastar tus cartas fuertes: las vas a necesitar después.',
     'title_en': 'Challenge: keep your strong cards',
     'text_en': 'The hand is worth 2. Lead without spending your strong cards: you will need them later.',
     'target': '.live-hand', 'expect': ['play', 2], 'challenge': True,
     'hint': ('Abrí con tu carta más baja.', 'Lead with your lowest card.'),
     'hints': {**CALLS, 'fold': FOLD_HINT,
               'play:0': ('Es tu mejor carta: guardala para cuando la necesites.',
                          'It is your best card: keep it for when you need it.'),
               'play:1': ('El 3 es fuerte; abrí con la más baja.', 'The 3 is strong; lead with the lowest.')}},
    {'bot': ['play', 2]},
    {'bot': ['retruco', None]},
    {'title': 'Canté Retruco',
     'text': 'Mi 10 de copa le ganó a tu 5, y ahora canté Retruco. Si decís «No quiero», ¿cuántos '
             'puntos me llevo?',
     'title_en': 'I called Retruco',
     'text_en': 'My 10 of Cups beat your 5, and now I called Retruco. If you say “No quiero”, how many '
                'points do I take?',
     'target': '.table-status',
     'quiz': {'options': (('1', '1'), ('2', '2'), ('3', '3')), 'answer': 1},
     'hint': ('Si rechazás, me llevo lo que ya estaba aceptado: el Truco.',
              'If you decline, I take what was already accepted: the Truco.'),
     'ok': ('Exacto: 2, los del Truco aceptado.', 'Exactly: 2, from the accepted Truco.')},
    {'title': 'Aceptá el Retruco',
     'text': 'Te quedan el ancho de espada y el 3 de oro: tocá «Quiero» y la mano pasa a valer 3.',
     'title_en': 'Accept the Retruco',
     'text_en': 'You still hold the ancho de espada and the 3 of Coins: press “Quiero” and the hand '
                'becomes worth 3.',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Desafío: ganale al ancho de basto',
     'text': 'Tiré el ancho de basto, la segunda carta más fuerte del juego. Solo una carta le gana.',
     'title_en': 'Challenge: beat the ancho de basto',
     'text_en': 'I played the ancho de basto, the second strongest card in the game. Only one card beats it.',
     'target': '.live-hand', 'expect': ['play', 0], 'challenge': True,
     'hint': ('Solo la carta número 1 de la escala le gana.', 'Only the top card of the ladder beats it.'),
     'hints': {**CALLS, 'fold': FOLD_HINT,
               'vale4': ('Podrías subir a Vale Cuatro, pero primero ganá esta baza.',
                         'You could raise to Vale Cuatro, but win this baza first.'),
               'play:1': ('El 3 de oro está muy por debajo del ancho de basto.',
                          'The 3 of Coins is far below the ancho de basto.')}},
    {'title': 'Última baza',
     'text': 'Una baza cada uno: decide la tercera. Jugá tu 3 de oro.',
     'title_en': 'Last baza',
     'text_en': 'One baza each: the third one decides. Play your 3 of Coins.',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': 'Ganaste la mano',
     'text': 'Tu 3 le ganó a mi 12. ¿Cuántos puntos sumaste?',
     'title_en': 'You won the hand',
     'text_en': 'Your 3 beat my 12. How many points did you score?',
     'target': '.outcome',
     'quiz': {'options': (('1', '1'), ('2', '2'), ('3', '3')), 'answer': 2},
     'hint': ('La mano vale lo último que se aceptó: el Retruco.', 'The hand is worth the last accepted call: the Retruco.'),
     'ok': ('3 puntos: el Retruco aceptado.', '3 points: the accepted Retruco.')},
    {'title': 'Ahora, la carta cuántica',
     'text': 'Ya practicaste el Truco clásico. Tocá «Nueva mano»: llega la parte cuántica, que te '
             'explico paso a paso.',
     'title_en': 'Now, the quantum card',
     'text_en': 'You have practised classic Truco. Press “Next hand”: the quantum part comes next, and '
                'I will explain it step by step.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 4 · the quantum card ----------
    {'bot': ['choose', 0]},
    {'bot': ['confirm', None]},
    {'title': 'La carta cuántica',
     'text': 'Ahora jugamos con la carta cuántica que viste en las diapositivas: elegí una carta, '
             'armá su circuito y al jugarla se mide. Recordá los palos ligados: basto ↔ oro y copa ↔ '
             'espada. Yo ya preparé la mía.',
     'title_en': 'The quantum card',
     'text_en': 'Now we play with the quantum card you saw in the slides: pick a card, build its circuit '
                'and it is measured when played. Remember the linked suits: clubs ↔ coins and cups ↔ '
                'swords. I have already prepared mine.',
     'target': '.live-hand'},
    {'title': 'Elegí tu carta cuántica',
     'text': 'Tu 7 de copa es débil (fuerza 4), pero su ligada es el 7 de espada, una brava (fuerza '
             '12). Tocalo para elegirlo como carta cuántica.',
     'title_en': 'Choose your quantum card',
     'text_en': 'Your 7 of Cups is weak (strength 4), but its linked card is the 7 of Swords, a brava '
                '(strength 12). Tap it to make it your quantum card.',
     'target': '[data-card="0"]', 'expect': ['choose', 0]},
    {'title': 'Agregá la compuerta X',
     'text': 'Tocá «Activar cuántico» para abrir el compositor y agregá la ficha X. X da media vuelta '
             'alrededor del eje [X]: lleva la carta de la original a la ligada con 100 % de '
             'probabilidad.',
     'title_en': 'Add the X gate',
     'text_en': 'Press “Activate quantum” to open the composer and add the X token. X makes a half turn '
                'around the [X] axis: it moves the card from original to linked with 100% probability.',
     'target': '[data-token="0"]', 'expect': ['edit', [0]]},
    {'title': 'Probabilidades y esfera',
     'text': 'Arriba ves las dos identidades: ahora 0 % original y 100 % ligada. En la esfera de Bloch '
             'el norte es la original y el sur la ligada; la flecha bajó al sur girando alrededor del '
             'eje [X]. La altura sobre el eje [Z] da los porcentajes.',
     'title_en': 'Probabilities and the sphere',
     'text_en': 'At the top you see both identities: now 0% original and 100% linked. On the Bloch '
                'sphere north is the original and south the linked card; the arrow moved south by '
                'turning around the [X] axis. The height along the [Z] axis gives the percentages.',
     'target': '.quantum-options'},
    {'title': 'Tus fichas',
     'text': 'Cada mano recibís cuatro fichas y podés usar hasta tres, en el orden que quieras: el '
             'orden cambia el resultado. En el nivel Difícil solo podés sacar compuertas dos veces por '
             'mano. El tutorial de compuertas explica qué hace cada una.',
     'title_en': 'Your tokens',
     'text_en': 'Each hand you get four tokens and may use up to three, in any order: the order changes '
                'the result. On the Hard level you may remove gates only twice per hand. The gates '
                'tutorial explains what each one does.',
     'target': '.gate-rack'},
    {'title': 'Confirmá',
     'text': 'Tocá «Confirmar». El circuito queda fijo durante toda la mano.',
     'title_en': 'Confirm',
     'text_en': 'Press “Confirm”. The circuit stays fixed for the whole hand.',
     'target': '#lock-circuit', 'expect': ['confirm', None]},
    {'bot': ['play', 0]},
    {'title': 'Se midió mi carta',
     'text': 'Jugué mi carta cuántica sin compuertas, así que al medirla salió la original: el 3 de '
             'espada (fuerza 10). Una carta cuántica se mide cuando se juega o cuando se acepta un '
             'Envido, y desde ese momento su identidad ya no cambia.',
     'title_en': 'My card was measured',
     'text_en': 'I played my quantum card with no gates, so measuring it gave the original: the 3 of '
                'Swords (strength 10). A quantum card is measured when it is played or when an Envido is '
                'accepted, and from then on its identity no longer changes.',
     'target': '.played-bazas'},
    {'title': 'Jugá tu carta cuántica',
     'text': 'Jugala: al medirse, la X garantiza el 7 de espada.',
     'title_en': 'Play your quantum card',
     'text_en': 'Play it: when it is measured, the X guarantees the 7 of Swords.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'title': '¡Salió el 7 de espada!',
     'text': 'Tu carta se midió como 7 de espada (fuerza 12) y le ganó a mi 3. Con H en lugar de X '
             'habría sido 50 % y 50 %: esa es la apuesta cuántica. Ahora jugá el 5 de basto.',
     'title_en': 'It came out as the 7 of Swords!',
     'text_en': 'Your card was measured as the 7 of Swords (strength 12) and beat my 3. With H instead '
                'of X it would have been 50% and 50%: that is the quantum bet. Now play the 5 of Clubs.',
     'target': '[data-card="2"]', 'expect': ['play', 2]},
    {'bot': ['play', 1]},
    {'bot': ['play', 2]},
    {'title': 'Una baza cada uno',
     'text': 'Mi 6 de copa ganó la segunda y ya tiré el 4 de basto. Jugá tu 4 de oro.',
     'title_en': 'One baza each',
     'text_en': 'My 6 of Cups won the second baza and I have already played the 4 of Clubs. Play your '
                '4 of Coins.',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'title': '¡Terminaste el tutorial de Truco!',
     'text': 'Baza parda: como ganaste la primera, la mano es tuya. Ya sabés jugar al Truco y usar la '
             'carta cuántica. Con «Ver resumen» repasás esta mano: cada baza y cómo se midieron las '
             'cartas cuánticas. Después seguí con «Compuertas y esfera de Bloch» para entender qué '
             'hace cada ficha.',
     'title_en': 'You finished the Truco tutorial!',
     'text_en': 'A parda: since you won the first baza, the hand is yours. You can now play Truco and use '
                'the quantum card. “See summary” goes over this hand: each baza and how the quantum cards '
                'were measured. Then continue with “Gates and the Bloch sphere” to learn what each token '
                'does.',
     'target': '.outcome', 'final': True},
)

# ---------- Gates and the Bloch sphere ----------
# Each lesson shows one or more circuits; the interface animates each path on a Bloch
# sphere. Percentages are computed by Qiskit at runtime, never typed by hand.
GATE_LESSONS = (
    {'title': 'La esfera de Bloch: el mapa de tu carta',
     'title_en': 'The Bloch sphere: a map of your card',
     'text': 'Un qubit se puede dibujar como una flecha dentro de una esfera. El polo norte es |0⟩, tu '
             'carta original; el polo sur es |1⟩, la carta ligada. La altura de la flecha sobre el eje '
             '[Z] decide las probabilidades al medir: P(original) = (1 + [Z]) / 2. En el ecuador '
             'la carta está 50 % y 50 %. Los ejes [X] e [Y] marcan hacia dónde apunta la flecha en el '
             'ecuador: eso es la «fase», que no cambia los porcentajes pero sí lo que hagan las '
             'compuertas siguientes.',
     'text_en': 'A qubit can be drawn as an arrow inside a sphere. The north pole is |0⟩, your original '
                'card; the south pole is |1⟩, the linked card. The arrow’s height along the [Z] axis '
                'sets the measurement odds: P(original) = (1 + [Z]) / 2. On the equator the card is '
                '50% and 50%. The [X] and [Y] axes say where the arrow points around the equator: that '
                'is the “phase”, which does not change the odds but does change what later gates do.',
     'analogy': 'Pensalo como una brújula de la carta: la latitud dice qué tan probable es cada palo; '
                'la longitud es una marca invisible que solo se nota cuando otra compuerta la usa.',
     'analogy_en': 'Think of it as the card’s compass: latitude tells how likely each suit is; longitude '
                   'is an invisible mark that only shows when another gate uses it.',
     'circuits': (((), 'Sin compuertas: la flecha está en el norte. 100 % original.',
                   'No gates: the arrow is at the north pole. 100% original.'),
                  (('X',), 'En el sur: 100 % ligada.', 'At the south pole: 100% linked.'),
                  (('H',), 'En el ecuador: 50 % y 50 %.', 'On the equator: 50% and 50%.'))},
    {'title': 'X: cambiar de palo',
     'title_en': 'X: switch the suit',
     'text': 'X da media vuelta (180°) alrededor del eje [X]. Intercambia los papeles de |0⟩ y |1⟩: '
             'desde la original lleva a la ligada con 100 %. Es el equivalente cuántico del NOT de la '
             'computación clásica. Dos X seguidas se cancelan.',
     'text_en': 'X makes a half turn (180°) around the [X] axis. It swaps the roles of |0⟩ and |1⟩: from '
                'the original it reaches the linked card with 100%. It is the quantum version of the '
                'classical NOT. Two X gates in a row cancel out.',
     'analogy': 'Es dar vuelta la carta a su pareja: el 7 de copa pasa a ser el 7 de espada, seguro.',
     'analogy_en': 'It is like flipping the card to its partner: the 7 of Cups becomes the 7 of Swords, '
                   'for sure.',
     'circuits': ((('X',), 'X: del norte al sur. 100 % ligada.', 'X: north to south. 100% linked.'),
                  (('X', 'X'), 'X·X: ida y vuelta. Vuelve a la original.', 'X·X: there and back. Back to the original.'))},
    {'title': 'H: la superposición',
     'title_en': 'H: superposition',
     'text': 'H (Hadamard) da media vuelta alrededor del eje diagonal entre [X] y [Z]. Desde el norte '
             'deja la flecha en el ecuador: 50 % original y 50 % ligada. No es una carta escondida: la '
             'identidad recién existe al medir. Y no es como mezclar: dos H seguidas vuelven exactamente '
             'a la original, porque las amplitudes interfieren y se cancelan.',
     'text_en': 'H (Hadamard) makes a half turn around the diagonal axis between [X] and [Z]. From the '
                'north it leaves the arrow on the equator: 50% original and 50% linked. It is not a '
                'hidden card: the identity only exists once measured. And it is not like shuffling: two '
                'H gates in a row return exactly to the original, because the amplitudes interfere and '
                'cancel.',
     'analogy': 'Una H es como tirar la carta al aire: mientras gira no es ni una ni la otra. Pero si '
                'la «girás» dos veces con H, cae siempre igual que al principio.',
     'analogy_en': 'An H is like tossing the card in the air: while spinning it is neither one nor the '
                   'other. But “spin” it twice with H and it always lands as it started.',
     'circuits': ((('H',), 'H: al ecuador. 50 % / 50 %.', 'H: to the equator. 50% / 50%.'),
                  (('H', 'H'), 'H·H: vuelve al norte. 100 % original (interferencia).', 'H·H: back to the north. 100% original (interference).'))},
    {'title': 'Z: la marca invisible (fase)',
     'title_en': 'Z: the invisible mark (phase)',
     'text': 'Z da media vuelta alrededor del eje [Z]. Si la flecha está en un polo, no se mueve: Z '
             'sola no cambia nada que se pueda medir. Si está en el ecuador, la lleva al lado opuesto '
             '(de +[X] a −[X]): los porcentajes siguen 50/50, pero cambió la fase. Una H posterior '
             'convierte esa diferencia en un resultado distinto: H·Z·H equivale a X.',
     'text_en': 'Z makes a half turn around the [Z] axis. If the arrow is at a pole it does not move: Z '
                'alone changes nothing you can measure. On the equator it moves the arrow to the '
                'opposite side (from +[X] to −[X]): the odds stay 50/50, but the phase changed. A later '
                'H turns that difference into a different result: H·Z·H is the same as X.',
     'analogy': 'Es una marca en el dorso de la carta: si la mirás de frente no la ves, pero cambia '
                'hacia dónde cae cuando la volvés a «girar» con H.',
     'analogy_en': 'It is a mark on the back of the card: looking at the face you cannot see it, but it '
                   'changes how it lands when you “spin” it again with H.',
     'circuits': ((('Z',), 'Z desde el norte: no se mueve. 100 % original.', 'Z from the north: no movement. 100% original.'),
                  (('H', 'Z'), 'H·Z: sigue 50/50, pero ahora apunta a −[X].', 'H·Z: still 50/50, but it now points to −[X].'),
                  (('H', 'Z', 'H'), 'H·Z·H: la fase se vuelve resultado. 100 % ligada.', 'H·Z·H: the phase becomes a result. 100% linked.'))},
    {'title': 'RX: girar de a poco alrededor de X',
     'title_en': 'RX: small turns around X',
     'text': 'RX gira un ángulo fijo alrededor del eje [X]. En el juego hay 30°, 60°, 90° y −30°. Cuanto '
             'más gira desde el norte, más probabilidad pasa a la ligada: P(ligada) = sen²(θ/2). Con '
             '180° sería una X completa.',
     'text_en': 'RX turns a fixed angle around the [X] axis. The game has 30°, 60°, 90° and −30°. The '
                'more it turns from the north, the more probability moves to the linked card: P(linked) '
                '= sin²(θ/2). At 180° it would be a full X.',
     'analogy': 'Es empujar la carta hacia su pareja sin darla vuelta del todo: un empujón chico, un '
                'cambio chico de probabilidad.',
     'analogy_en': 'It is nudging the card towards its partner without flipping it completely: a small '
                   'nudge, a small change in the odds.',
     'circuits': ((('RX:pi/6',), 'RX 30°: un poco de ligada.', 'RX 30°: a little linked.'),
                  (('RX:pi/3',), 'RX 60°: un cuarto ligada.', 'RX 60°: one quarter linked.'),
                  (('RX:pi/2',), 'RX 90°: al ecuador, 50/50.', 'RX 90°: to the equator, 50/50.'))},
    {'title': 'RY: girar alrededor de Y',
     'title_en': 'RY: turns around Y',
     'text': 'RY gira alrededor del eje [Y]. Desde el norte mueve la probabilidad igual que RX, pero la '
             'flecha llega a otro punto del ecuador. Por eso, después de una H, RY(30°) y RY(−30°) dan '
             'resultados opuestos: el sentido del giro importa.',
     'text_en': 'RY turns around the [Y] axis. From the north it moves probability just like RX, but the '
                'arrow reaches a different point on the equator. That is why, after an H, RY(30°) and '
                'RY(−30°) give opposite results: the direction of the turn matters.',
     'analogy': 'Si H deja la carta «en el aire», RY la inclina hacia uno u otro palo según el sentido '
                'del giro.',
     'analogy_en': 'If H leaves the card “in the air”, RY tilts it towards one suit or the other '
                   'depending on the direction of the turn.',
     'circuits': ((('RY:pi/2',), 'RY 90°: al ecuador, sobre +[X].', 'RY 90°: to the equator, on +[X].'),
                  (('H', 'RY:pi/6'), 'H y RY 30°: se inclina a la ligada.', 'H then RY 30°: tilts towards the linked card.'),
                  (('H', 'RY:-pi/6'), 'H y RY −30°: se inclina a la original.', 'H then RY −30°: tilts towards the original.'))},
    {'title': 'RZ: girar la fase de a poco',
     'title_en': 'RZ: small phase turns',
     'text': 'RZ gira alrededor del eje [Z]. Como Z, no cambia los porcentajes de medir ahora: mueve la '
             'flecha por el ecuador (cambia la fase). Su efecto aparece cuando una H posterior '
             'transforma esa fase en probabilidad.',
     'text_en': 'RZ turns around the [Z] axis. Like Z, it does not change today’s odds: it moves the '
                'arrow along the equator (it changes the phase). Its effect appears when a later H turns '
                'that phase into probability.',
     'analogy': 'Es girar la marca invisible del dorso un cuarto de vuelta: no se ve hasta la próxima H.',
     'analogy_en': 'It is turning the invisible mark on the back a quarter turn: it does not show until '
                   'the next H.',
     'circuits': ((('RZ:pi/2',), 'RZ 90° desde el norte: nada cambia.', 'RZ 90° from the north: nothing changes.'),
                  (('H', 'RZ:pi/2'), 'H y RZ 90°: la flecha va de +[X] a +[Y].', 'H then RZ 90°: the arrow goes from +[X] to +[Y].'),
                  (('H', 'RZ:pi/2', 'H'), 'H·RZ 90°·H: ahora la fase cambia el resultado frente a H·H.', 'H·RZ 90°·H: now the phase changes the result compared with H·H.'))},
    {'title': 'Combinaciones clave',
     'title_en': 'Key combinations',
     'text': 'Las compuertas se aplican en orden, de izquierda a derecha, y cada una actúa sobre lo que '
             'dejó la anterior. Por eso el orden importa. Combinaciones para recordar: H·H = nada '
             '(vuelve a la original); X·X = nada; H·Z·H = X (100 % ligada); H·X = H (X no mueve una '
             'flecha que ya está sobre +[X]); RY(30°)·H y H·RY(30°) dan resultados opuestos.',
     'text_en': 'Gates are applied in order, left to right, and each acts on what the previous one left. '
                'That is why order matters. Combinations to remember: H·H = nothing (back to the '
                'original); X·X = nothing; H·Z·H = X (100% linked); H·X = H (X does not move an arrow '
                'already on +[X]); RY(30°)·H and H·RY(30°) give opposite results.',
     'analogy': 'Como en el Truco, no alcanza con tener buenas cartas: importa en qué orden las jugás.',
     'analogy_en': 'As in Truco, good cards are not enough: the order you play them in matters.',
     'circuits': ((('H', 'Z', 'H'), 'H·Z·H = X: 100 % ligada.', 'H·Z·H = X: 100% linked.'),
                  (('H', 'X'), 'H·X: X no cambia nada acá.', 'H·X: X changes nothing here.'),
                  (('RY:pi/6', 'H'), 'RY 30° y después H.', 'RY 30° then H.'),
                  (('H', 'RY:pi/6'), 'H y después RY 30°: resultado opuesto.', 'H then RY 30°: the opposite result.'))},
    {'title': 'La medición',
     'title_en': 'Measurement',
     'text': 'Medir da una sola respuesta: original o ligada. Los porcentajes dicen con qué frecuencia '
             'saldría cada una si repitiéramos el mismo circuito muchas veces; un 50 % no garantiza que '
             'salga una vez cada una. En el juego tu carta se mide una sola vez, al jugarla o al '
             'aceptar un Envido, y desde ahí su identidad queda fija hasta el final de la mano.',
     'text_en': 'Measuring gives a single answer: original or linked. The percentages say how often each '
                'would come out if we repeated the same circuit many times; 50% does not guarantee one '
                'of each. In the game your card is measured only once, when it is played or when an '
                'Envido is accepted, and from then on its identity is fixed until the end of the hand.',
     'analogy': 'Es como dar vuelta la carta sobre la mesa: una vez que se ve el palo, ya no cambia.',
     'analogy_en': 'It is like turning the card face up on the table: once the suit is shown, it stays.',
     'circuits': ((('H',), 'Antes de medir: 50/50. Al medir, una sola carta.', 'Before measuring: 50/50. Measuring gives one card.'),
                  (('RX:pi/3',), '75/25: la ligada sale una de cada cuatro veces, en promedio.', '75/25: the linked card comes out one time in four, on average.'))},
)
