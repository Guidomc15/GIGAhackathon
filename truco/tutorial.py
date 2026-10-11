"""Interactive Truco tutorial: one scripted match against Bot Q.

The match uses the real game engine in classic mode (no quantum card yet).
Each step is one of:
  - an explanation ('title'/'text'), advanced with the «Siguiente» button;
  - an explanation with 'expect': the only game action the player may take;
  - a 'bot' move, executed automatically by the session.
'target' is a CSS selector the interface highlights.
"""

NAMES = ('Vos', 'Bot Q')
MANO = 0  # The player starts as mano in the first hand.

# Fixed deals: [player cards, Bot Q cards]. Card indices in 'expect' and 'bot'
# refer to these positions.
DEALS = (
    # Hand 1 · bazas and card strength. Envido is not used.
    (((3, 'espada'), (5, 'copa'), (12, 'basto')),
     ((2, 'oro'), (4, 'copa'), (11, 'espada'))),
    # Hand 2 · Bot Q is mano and calls Envido (player 33, Bot Q 30); parda.
    (((7, 'oro'), (6, 'oro'), (4, 'basto')),
     ((3, 'copa'), (6, 'espada'), (4, 'espada'))),
    # Hand 3 · Truco and Retruco.
    (((1, 'espada'), (3, 'oro'), (5, 'basto')),
     ((1, 'basto'), (12, 'oro'), (10, 'copa'))),
)

STEPS = (
    # ---------- Hand 1 ----------
    {'title': 'Bienvenido a la mesa',
     'text': 'Soy Bot Q. Vamos a jugar tres manos de Truco y te voy a explicar cada parte de '
             'la pantalla. Leé cada mensaje y tocá «Siguiente». Cuando haya que jugar, te voy '
             'a marcar qué tocar.',
     'target': '.table-scene'},
    {'title': 'El marcador',
     'text': 'Acá se anotan los puntos de cada jugador: «0 / 15» quiere decir 0 puntos de los '
             '15 necesarios. Gana la partida quien llega primero a 15.',
     'target': '.scoreboard'},
    {'title': 'Las cartas del rival',
     'text': 'Arriba están mis tres cartas, boca abajo: no las podés ver. Cada vez que juego '
             'una, desaparece de acá y aparece en el centro de la mesa.',
     'target': '.opponent-hand'},
    {'title': 'Tu mano',
     'text': 'Abajo están tus tres cartas: 3 de espada, 5 de copa y 12 de basto. En el Truco '
             'la fuerza no es el número: el 3 le gana al 12. El orden completo está en «Valores» '
             'del menú de inicio.',
     'target': '.live-hand'},
    {'title': 'Las bazas',
     'text': 'El centro tiene tres columnas, una por baza. Una baza es una carta de cada '
             'jugador: gana la carta más fuerte. Quien gana dos bazas gana la mano.',
     'target': '.played-bazas'},
    {'title': 'Quién es mano y cuánto vale',
     'text': '«Mano: Vos» quiere decir que jugás primero y que ganás los empates de Envido. '
             'Cambia en cada mano. «Truco: 1» es lo que vale ganar esta mano: 1 punto, hasta '
             'que alguien cante Truco.',
     'target': '.table-status'},
    {'title': 'Tus opciones',
     'text': 'Estos botones son los cantos: Envido, Real Envido, Falta Envido, Truco e Irse al '
             'mazo. Debajo de cada uno dice qué pasa si lo elegís. En esta mano no cantamos: '
             'solo jugamos cartas.',
     'target': '.actions'},
    {'title': 'Jugá tu primera carta',
     'text': 'Tocá tu 3 de espada (o arrastralo al centro). Su fuerza es 10 de 14.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'bot': ['play', 0]},
    {'title': 'Ganaste la primera baza',
     'text': 'Yo jugué un 2 de oro (fuerza 9) y tu 3 (fuerza 10) es más fuerte. Cada vez que '
             'termina una baza aparece un aviso: avanzalo con «Skip · Continuar» o elegí un '
             'tiempo con ⏱. Quien gana la baza empieza la siguiente.',
     'target': '.played-bazas'},
    {'title': 'Segunda baza',
     'text': 'Jugá tu 12 de basto (fuerza 7). Si ganás esta baza, ya tenés dos de tres.',
     'target': '[data-card="2"]', 'expect': ['play', 2]},
    {'bot': ['play', 2]},
    {'title': 'Ganaste la mano',
     'text': 'Tu 12 le ganó a mi 11. Con dos bazas ganadas la mano es tuya y, sin cantos, vale '
             '1 punto. «Ver resumen» muestra por qué se ganó cada baza. Tocá «Nueva mano» para '
             'repartir otra vez.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 2 ----------
    {'bot': ['envido', None]},
    {'title': 'Ahora soy mano',
     'text': 'En cada mano cambia quién es mano: ahora juego primero yo. Antes de tirar mi '
             'carta canté Envido. El Envido solo se puede cantar antes de jugar tu primera carta.',
     'target': '.table-status'},
    {'title': 'Cómo se cuentan los tantos',
     'text': 'Si tenés dos cartas del mismo palo, sumás 20 más el valor de cada una. Del 1 al 7 '
             'valen su número; el 10, 11 y 12 valen 0. Tu 7 y 6 de oro dan 20 + 7 + 6 = 33. '
             'Son muy buenos tantos.',
     'target': '.live-hand'},
    {'title': 'Respondé al Envido',
     'text': 'Tocá «Quiero»: comparamos tantos y el que tiene más suma 2 puntos. «No quiero» me '
             'daría 1 punto sin comparar. Real Envido y Falta Envido suben la apuesta.',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Ganaste el Envido',
     'text': 'Tus 33 le ganan a mis 30: sumaste 2 puntos en el marcador. Los puntos del Envido '
             'son aparte de la mano, que se sigue jugando. Después tiré mi 3 de copa.',
     'target': '.scoreboard'},
    {'title': 'Ganale a mi 3',
     'text': 'Mi 3 de copa tiene fuerza 10. Tu 7 de oro es la cuarta carta más fuerte del juego '
             '(fuerza 11). Jugalo.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'title': 'Empezás vos',
     'text': 'Ganaste la baza, así que abrís la segunda. Jugá tu 6 de oro.',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': 'Baza parda',
     'text': 'Los dos jugamos un 6: misma fuerza, la baza es «parda» (empate). Si la primera '
             'baza tiene ganador y la segunda es parda, gana la mano quien ganó la primera. '
             'Sumás 1 punto más. Tocá «Nueva mano».',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 3 ----------
    {'title': 'Tercera mano: el Truco',
     'text': 'Volvés a ser mano. Tenés el 1 de espada, el «ancho de espada»: la carta más '
             'fuerte del juego (fuerza 14). Con buenas cartas conviene cantar Truco.',
     'target': '.live-hand'},
    {'title': 'Cantá Truco',
     'text': 'Tocá «Truco». Si quiero, la mano pasa a valer 2 puntos. Si no quiero, ganás 1 '
             'punto y la mano termina.',
     'target': '[data-action="truco"]', 'expect': ['truco', None]},
    {'bot': ['accept', None]},
    {'title': 'Dije «Quiero»',
     'text': 'Ahora la mano vale 2: mirá «Truco: 2». Quien acepta un canto gana el derecho a '
             'subirlo: yo puedo cantar Retruco (3) y vos, después, Vale Cuatro (4).',
     'target': '.table-status'},
    {'title': 'Guardá las cartas fuertes',
     'text': 'Empezá con tu carta más baja, el 5 de basto. Así guardás el ancho y el 3 para las '
             'bazas siguientes.',
     'target': '[data-card="2"]', 'expect': ['play', 2]},
    {'bot': ['play', 2]},
    {'bot': ['retruco', None]},
    {'title': 'Perdiste una baza y canté Retruco',
     'text': 'Mi 10 de copa (fuerza 5) le ganó a tu 5 (fuerza 2), así que abro la segunda baza. '
             'Antes de jugar canté Retruco: si querés, la mano vale 3.',
     'target': '.played-bazas'},
    {'title': 'Aceptá el Retruco',
     'text': 'Tocá «Quiero». «No quiero» me daría los 2 puntos del Truco ya aceptado y '
             'terminaría la mano. «Vale Cuatro» subiría la apuesta a 4.',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Jugá el ancho de espada',
     'text': 'Tiré el 1 de basto, el «ancho de basto» (fuerza 13). Solo pierde contra tu 1 de '
             'espada. Jugalo.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'title': 'Última baza',
     'text': 'Vamos una baza cada uno. Jugá tu 3 de oro (fuerza 10).',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': '¡Terminaste el tutorial!',
     'text': 'Tu 3 le ganó a mi 12 y te llevaste la mano con Retruco: 3 puntos. Ya sabés leer '
             'la mesa, jugar bazas, cantar y responder Envido y Truco. Una partida real sigue '
             'hasta 15 puntos. Lo próximo: la carta cuántica.',
     'target': '.outcome', 'final': True},
)
