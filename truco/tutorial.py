"""Tutorials, in Spanish and English.

1. Truco with Bot Q: one scripted match on the real engine. Hands 1-3 are classic
   Truco; hand 4 adds the quantum card. Each step is one of:
     - an explanation ('title'/'text'), advanced with «Siguiente»;
     - an explanation with 'expect': the only game action the player may take;
     - a 'bot' move, executed automatically by the session.
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

STEPS = (
    # ---------- Hand 1 ----------
    {'title': 'Bienvenido: qué es el Truco',
     'text': 'El Truco es un juego de naipes tradicional del Río de la Plata que se juega con la '
             'baraja española de 40 cartas (sin 8 ni 9). Combina tres ideas: ganar bazas con cartas '
             'fuertes, apostar con cantos (Envido y Truco) y leer al rival. Vamos a jugar cuatro '
             'manos: tres de Truco clásico y una con la carta cuántica. Tocá «Siguiente» para '
             'avanzar; cuando haya que jugar, te marco qué tocar.',
     'title_en': 'Welcome: what is Truco?',
     'text_en': 'Truco is a traditional card game from the Río de la Plata region, played with the '
                '40-card Spanish deck (no 8s or 9s). It combines three ideas: winning bazas (tricks) '
                'with strong cards, betting with calls (Envido and Truco) and reading your opponent. '
                'We will play four hands: three of classic Truco and one with the quantum card. Press '
                '“Next” to continue; when it is time to play, I will highlight what to touch.',
     'target': '.table-scene'},
    {'title': 'El marcador',
     'text': 'Acá se anotan los puntos. En esta variante para dos jugadores gana quien llega primero '
             'a 15; en la mesa tradicional se suele jugar a 30, en «malas» y «buenas». Los puntos '
             'salen de dos fuentes: ganar la mano y ganar los cantos.',
     'title_en': 'The scoreboard',
     'text_en': 'Points are recorded here. In this two-player variant the first to 15 wins; at a '
                'traditional table people often play to 30, split into “malas” and “buenas”. Points '
                'come from two sources: winning the hand and winning the calls.',
     'target': '.scoreboard'},
    {'title': 'Las cartas del rival',
     'text': 'Arriba están mis tres cartas boca abajo. Cada vez que juego una, sale de acá y aparece '
             'en el centro de la mesa.',
     'title_en': 'Your opponent’s cards',
     'text_en': 'My three cards are at the top, face down. Each time I play one, it leaves this spot '
                'and appears in the centre of the table.',
     'target': '.opponent-hand'},
    {'title': 'La fuerza de las cartas',
     'text': 'Tus cartas: 3 de espada, 5 de copa y 12 de basto. En el Truco la fuerza no sigue el '
             'número. De mayor a menor: 1 de espada, 1 de basto, 7 de espada y 7 de oro (las cuatro '
             '«bravas»); después todos los 3, todos los 2, el 1 de copa y el de oro, los 12, los 11, '
             'los 10, el 7 de copa y el de basto, los 6, los 5 y los 4. Por eso tu 3 vale más que tu '
             '12. El orden completo está en «Valores».',
     'title_en': 'Card strength',
     'text_en': 'Your cards: 3 of Swords, 5 of Cups and 12 of Clubs. In Truco strength does not follow '
                'the number. From strongest to weakest: 1 of Swords, 1 of Clubs, 7 of Swords and 7 of '
                'Coins (the four “bravas”); then all 3s, all 2s, the 1 of Cups and of Coins, the 12s, '
                'the 11s, the 10s, the 7 of Cups and of Clubs, the 6s, the 5s and the 4s. That is why '
                'your 3 beats your 12. The full ranking is under “Card values”.',
     'target': '.live-hand'},
    {'title': 'Las bazas',
     'text': 'Una mano se juega en hasta tres bazas. En cada baza los dos jugadores tiran una carta y '
             'gana la más fuerte; quien gana dos bazas gana la mano. Si las dos cartas tienen la misma '
             'fuerza, la baza es «parda» (empate).',
     'title_en': 'Bazas (tricks)',
     'text_en': 'A hand is played in up to three bazas. In each baza both players play one card and '
                'the stronger card wins; whoever wins two bazas wins the hand. If both cards have the '
                'same strength, the baza is “parda” (a tie).',
     'target': '.played-bazas'},
    {'title': 'Quién es mano y cuánto vale',
     'text': '«Mano» es el jugador que sale primero en la primera baza: rota en cada reparto y gana '
             'los empates de Envido. «Truco: 1» indica lo que vale ganar la mano mientras nadie cante '
             'Truco.',
     'title_en': 'Who is mano and what the hand is worth',
     'text_en': '“Mano” is the player who leads the first baza: it alternates every deal and wins '
                'Envido ties. “Truco: 1” is what winning the hand is worth while nobody calls Truco.',
     'target': '.table-status'},
    {'title': 'Los cantos',
     'text': 'Antes de jugar podés cantar. Envido, Real Envido y Falta Envido apuestan sobre los '
             '«tantos» de tus cartas; Truco apuesta sobre la mano; Irse al mazo es abandonarla. Cada '
             'botón explica qué ganás y qué arriesgás. En esta mano solo jugamos cartas.',
     'title_en': 'The calls',
     'text_en': 'Before playing you may make a call. Envido, Real Envido and Falta Envido bet on the '
                '“tantos” (envido points) of your cards; Truco bets on the hand; Irse al mazo means '
                'giving up the hand. Each button shows what you win and what you risk. This hand we '
                'only play cards.',
     'target': '.actions'},
    {'title': 'Jugá tu primera carta',
     'text': 'Tocá el 3 de espada (fuerza 10 de 14) o arrastralo al centro.',
     'title_en': 'Play your first card',
     'text_en': 'Tap the 3 of Swords (strength 10 of 14) or drag it to the centre.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'bot': ['play', 0]},
    {'title': 'Ganaste la primera baza',
     'text': 'Tu 3 (fuerza 10) supera a mi 2 de oro (fuerza 9). Después de cada baza aparece un aviso: '
             'avanzalo con «Continuar» o elegí un tiempo automático con ⏱. Quien gana una baza sale '
             'primero en la siguiente.',
     'title_en': 'You won the first baza',
     'text_en': 'Your 3 (strength 10) beats my 2 of Coins (strength 9). After each baza a notice '
                'appears: close it with “Continue” or choose an automatic time with ⏱. Whoever wins a '
                'baza leads the next one.',
     'target': '.played-bazas'},
    {'title': 'Segunda baza',
     'text': 'Jugá el 12 de basto (fuerza 7). Si ganás, tenés dos bazas y la mano es tuya.',
     'title_en': 'Second baza',
     'text_en': 'Play the 12 of Clubs (strength 7). If you win, you have two bazas and the hand.',
     'target': '[data-card="2"]', 'expect': ['play', 2]},
    {'bot': ['play', 2]},
    {'title': 'Ganaste la mano',
     'text': 'Tu 12 (7) le ganó a mi 11 (6): dos bazas, mano ganada. Sin cantos vale 1 punto. «Ver '
             'resumen» explica cada baza. Tocá «Nueva mano»: se reparten tres cartas y la mano pasa '
             'a mí.',
     'title_en': 'You won the hand',
     'text_en': 'Your 12 (7) beat my 11 (6): two bazas, hand won. With no calls it is worth 1 point. '
                '“See summary” explains each baza. Press “Next hand”: three new cards are dealt and I '
                'become mano.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 2 ----------
    {'bot': ['envido', None]},
    {'title': 'Canté Envido',
     'text': 'Ahora soy mano y, antes de tirar mi primera carta, canté Envido. El Envido es una '
             'apuesta paralela a la mano: compara los «tantos» de cada jugador. Solo se puede cantar '
             'antes de jugar tu primera carta.',
     'title_en': 'I called Envido',
     'text_en': 'Now I am mano and, before playing my first card, I called Envido. Envido is a side '
                'bet next to the hand: it compares each player’s envido points (“tantos”). It can only '
                'be called before you play your first card.',
     'target': '.table-status'},
    {'title': 'Cómo se cuentan los tantos',
     'text': 'Con dos cartas del mismo palo sumás 20 más sus valores: del 1 al 7 valen su número; el '
             '10, 11 y 12 valen 0. Sin palo repetido vale tu carta más alta. Tu 7 y 6 de oro suman '
             '20 + 7 + 6 = 33, el máximo posible.',
     'title_en': 'How envido points are counted',
     'text_en': 'With two cards of the same suit you add 20 plus their values: 1 to 7 are worth their '
                'number; 10, 11 and 12 are worth 0. With no matching suit your highest card counts. '
                'Your 7 and 6 of Coins make 20 + 7 + 6 = 33, the maximum possible.',
     'target': '.live-hand'},
    {'title': 'Respondé al Envido',
     'text': 'Tocá «Quiero»: se comparan los tantos y el ganador suma 2. Con «No quiero» yo sumaría 1 '
             'sin comparar. También podrías subir con Envido (4 en total), Real Envido o Falta Envido '
             '(lo que le falta al que va ganando para llegar a 15).',
     'title_en': 'Answer the Envido',
     'text_en': 'Press “Quiero” (I accept): both counts are compared and the winner scores 2. “No quiero” '
                '(I decline) would give me 1 without comparing. You could also raise with Envido (4 in '
                'total), Real Envido or Falta Envido (what the leader needs to reach 15).',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Ganaste el Envido',
     'text': 'Cantamos los tantos: tus 33 contra mis 30. Sumaste 2 en el marcador. Si hubiéramos '
             'empatado, ganaba el mano: yo. Los puntos del Envido no deciden la mano, que sigue: ya '
             'tiré mi 3 de copa.',
     'title_en': 'You won the Envido',
     'text_en': 'We announced our counts: your 33 against my 30. You scored 2. In a tie the mano — me — '
                'would have won. Envido points do not decide the hand, which continues: I have already '
                'played my 3 of Cups.',
     'target': '.scoreboard'},
    {'title': 'Ganale a mi 3',
     'text': 'Mi 3 de copa tiene fuerza 10. Tu 7 de oro es una de las cuatro bravas (fuerza 11): '
             'jugalo.',
     'title_en': 'Beat my 3',
     'text_en': 'My 3 of Cups has strength 10. Your 7 of Coins is one of the four bravas (strength 11): '
                'play it.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'title': 'Salís vos',
     'text': 'Ganaste la baza, así que abrís la segunda. Jugá tu 6 de oro.',
     'title_en': 'You lead',
     'text_en': 'You won the baza, so you lead the second one. Play your 6 of Coins.',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': 'Baza parda',
     'text': 'Los dos 6 tienen la misma fuerza: baza parda. Reglas de pardas: si la primera tiene '
             'ganador y la segunda es parda, gana quien ganó la primera; si la primera es parda, '
             'decide la segunda; si las tres son pardas, gana el mano. Sumás 1. Tocá «Nueva mano».',
     'title_en': 'A parda (tied baza)',
     'text_en': 'Both 6s have the same strength: the baza is parda. Tie rules: if the first baza has a '
                'winner and the second is parda, the winner of the first takes the hand; if the first '
                'is parda, the second decides; if all three are parda, the mano wins. You score 1. '
                'Press “Next hand”.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 3 ----------
    {'title': 'El ancho de espada',
     'text': 'Volvés a ser mano. Tenés el 1 de espada, el «ancho de espada»: la carta más fuerte del '
             'mazo. Con una mano así conviene cantar Truco.',
     'title_en': 'The ancho de espada',
     'text_en': 'You are mano again. You hold the 1 of Swords, the “ancho de espada”: the strongest '
                'card in the deck. With a hand like this, calling Truco pays off.',
     'target': '.live-hand'},
    {'title': 'Cantá Truco',
     'text': 'Truco sube el valor de la mano a 2 si lo quiero; si no lo quiero, ganás 1 y la mano '
             'termina. Es la apuesta central del juego y se puede cantar sin tener buenas cartas: '
             'mentir es parte del Truco.',
     'title_en': 'Call Truco',
     'text_en': 'Truco raises the hand to 2 points if I accept; if I decline, you win 1 and the hand '
                'ends. It is the central bet of the game and you may call it without good cards: '
                'bluffing is part of Truco.',
     'target': '[data-action="truco"]', 'expect': ['truco', None]},
    {'bot': ['accept', None]},
    {'title': 'Dije «Quiero»',
     'text': 'La mano vale 2 («Truco: 2»). Quien acepta queda con el derecho a subir: yo puedo cantar '
             'Retruco (3) y, si lo aceptás, vos Vale Cuatro (4). Una vez aceptado el Truco ya no se '
             'puede cantar Envido.',
     'title_en': 'I said “Quiero”',
     'text_en': 'The hand is worth 2 (“Truco: 2”). Whoever accepts gets the right to raise: I may call '
                'Retruco (3) and, if you accept, you may call Vale Cuatro (4). Once Truco is accepted, '
                'Envido can no longer be called.',
     'target': '.table-status'},
    {'title': 'Guardá las fuertes',
     'text': 'Empezá con tu carta más baja, el 5 de basto: guardar las fuertes para después es una '
             'estrategia básica.',
     'title_en': 'Keep your strong cards',
     'text_en': 'Lead with your lowest card, the 5 of Clubs: saving strong cards for later is a basic '
                'strategy.',
     'target': '[data-card="2"]', 'expect': ['play', 2]},
    {'bot': ['play', 2]},
    {'bot': ['retruco', None]},
    {'title': 'Perdiste una baza y canté Retruco',
     'text': 'Mi 10 de copa (fuerza 5) le ganó a tu 5 (fuerza 2), así que salgo yo en la segunda. '
             'Antes de jugar canté Retruco: si querés, la mano vale 3.',
     'title_en': 'You lost a baza and I called Retruco',
     'text_en': 'My 10 of Cups (strength 5) beat your 5 (strength 2), so I lead the second baza. Before '
                'playing I called Retruco: if you accept, the hand is worth 3.',
     'target': '.played-bazas'},
    {'title': 'Aceptá el Retruco',
     'text': 'Tocá «Quiero». Con «No quiero» yo sumaría los 2 puntos del Truco ya aceptado y la mano '
             'terminaría. Con Vale Cuatro subirías a 4.',
     'title_en': 'Accept the Retruco',
     'text_en': 'Press “Quiero”. “No quiero” would give me the 2 points of the accepted Truco and end '
                'the hand. Vale Cuatro would raise it to 4.',
     'target': '[data-action="accept"]', 'expect': ['accept', None]},
    {'bot': ['play', 0]},
    {'title': 'Jugá el ancho de espada',
     'text': 'Tiré el ancho de basto (fuerza 13). Solo lo supera tu ancho de espada (14): jugalo.',
     'title_en': 'Play the ancho de espada',
     'text_en': 'I played the ancho de basto (strength 13). Only your ancho de espada (14) beats it: '
                'play it.',
     'target': '[data-card="0"]', 'expect': ['play', 0]},
    {'title': 'Última baza',
     'text': 'Vamos una baza cada uno: decide la tercera. Jugá tu 3 de oro (fuerza 10).',
     'title_en': 'Last baza',
     'text_en': 'One baza each: the third decides. Play your 3 of Coins (strength 10).',
     'target': '[data-card="1"]', 'expect': ['play', 1]},
    {'bot': ['play', 1]},
    {'title': 'Ganaste el Retruco',
     'text': 'Tu 3 le ganó a mi 12: ganaste la mano con Retruco, 3 puntos. Ya conocés el Truco '
             'clásico. Tocá «Nueva mano»: ahora llega la parte cuántica.',
     'title_en': 'You won the Retruco',
     'text_en': 'Your 3 beat my 12: you won the hand with Retruco, 3 points. You now know classic Truco. '
                'Press “Next hand”: the quantum part comes next.',
     'target': '[data-action="next"]', 'expect': ['next', None]},

    # ---------- Hand 4 · the quantum card ----------
    {'bot': ['choose', 0]},
    {'bot': ['confirm', None]},
    {'title': 'La carta cuántica',
     'text': 'En Truco Cuántico, al empezar cada mano, cada jugador convierte una de sus cartas en un '
             'qubit. Esa carta tiene dos identidades posibles: la original |0⟩ y la «ligada» |1⟩, con '
             'el mismo número y el palo cambiado (espada ↔ copa, basto ↔ oro). Cuál de las dos es se '
             'decide recién al medirla. Yo ya preparé la mía.',
     'title_en': 'The quantum card',
     'text_en': 'In Quantum Truco, at the start of each hand, each player turns one card into a qubit. '
                'That card has two possible identities: the original |0⟩ and the “linked” |1⟩, with the '
                'same number and the other suit of its pair (Swords ↔ Cups, Clubs ↔ Coins). Which one '
                'it is gets decided only when it is measured. I have already prepared mine.',
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
             'carta cuántica. Seguí con «Compuertas y esfera de Bloch» para entender qué hace cada '
             'ficha.',
     'title_en': 'You finished the Truco tutorial!',
     'text_en': 'A parda: since you won the first baza, the hand is yours. You can now play Truco and use '
                'the quantum card. Continue with “Gates and the Bloch sphere” to learn what each token '
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
