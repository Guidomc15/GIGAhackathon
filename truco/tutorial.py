"""Beginner lessons; ideal circuits and explicit educational noise experiments."""
LESSONS = [{'title': 'Bienvenido a la mesa',
  'title_en': 'Welcome to the table',
  'text': 'Bot Q te acompaña a aprender. Una mano es un reparto de tres cartas; una baza es una '
          'carta de cada jugador. La partida termina cuando alguien llega a 15 puntos. Vas a '
          'convertir una carta en la representación de un qubit: un sistema que medimos con dos '
          'resultados posibles.',
  'text_en': 'Bot Q helps you learn. A hand is a deal of three cards; a trick (baza) is one card '
             'from each player. The first player to 15 points wins. You will turn a card into a '
             'representation of a qubit: a system measured with two possible results.',
  'example': 'Original |0⟩: 4 de oro. Ligada |1⟩: 4 de basto. Conserva el 4 y cambia el palo. '
             'Espada se liga con copa; basto, con oro.',
  'example_en': 'Original |0⟩: 4 of coins (oro). Linked |1⟩: 4 of clubs (basto). The rank stays 4; '
                'the suit changes. Swords pair with cups; clubs with coins.',
  'technical': '|0⟩ y |1⟩ son los estados de la base de medición. El dibujo de dos cartas muestra '
               'resultados posibles de un único qubit; no son dos qubits ni hay entrelazamiento.',
  'technical_en': '|0⟩ and |1⟩ form the measurement basis. The two card images show possible '
                  'outcomes of one qubit; they are not two qubits and are not entangled.',
  'circuits': [[]],
  'sample': False},
 {'title': '1 · X: cambiar de original a ligada',
  'title_en': '1 · X: from original to linked',
  'text': 'Una compuerta es una operación sobre el estado del qubit. X intercambia los papeles de '
          'original y ligada. Empezando en original, X prepara la ligada con 100 % de probabilidad '
          'en el modelo ideal. Medí para observar un resultado real.',
  'text_en': 'A gate is an operation on a qubit state. X exchanges the roles of original and '
             'linked. Starting at original, X prepares linked with 100% probability in the ideal '
             'model. Measure to observe a real outcome.',
  'example': 'Desde |0⟩, una X → ligada. Dos X → original. X no quiere decir “elegir siempre la '
             'ligada”: importa el estado que recibe.',
  'example_en': 'From |0⟩, one X → linked; two X gates → original. X does not mean “always choose '
                'linked”: its input state matters.',
  'technical': 'X(α|0⟩ + β|1⟩) = β|0⟩ + α|1⟩. Equivale a una rotación de π (180°) alrededor del '
               'eje X de la esfera, salvo fase global. La amplitud es el número que acompaña a '
               'cada estado; su magnitud al cuadrado es la probabilidad.',
  'technical_en': 'X(α|0⟩ + β|1⟩) = β|0⟩ + α|1⟩. Up to global phase, this is a π (180°) rotation '
                  'about the Bloch X axis. An amplitude is the coefficient of a basis state; its '
                  'squared magnitude is the probability.',
  'circuits': [['X']],
  'sample': True},
 {'title': '2 · H: dos posibilidades antes de medir',
  'title_en': '2 · H: two possibilities before measurement',
  'text': 'H desde original prepara una superposición: 50 % para original y 50 % para ligada. Esos '
          'porcentajes describen resultados posibles al medir, no una carta clásica escondida. '
          'Aceptar Envido mide las cartas Q pendientes para calcular los tantos; el resultado '
          'queda fijo.',
  'text_en': 'H from original prepares a superposition: 50% original and 50% linked. These '
             'percentages describe possible measurement outcomes, not a hidden classical card. '
             'Accepting Envido measures unresolved Q cards to calculate both totals; the result '
             'stays fixed.',
  'example': 'Un solo experimento da 0 o 1, nunca “media carta”. Si repetís muchos experimentos '
             'preparados igual, sus frecuencias se acercan a 50/50; diez repeticiones no tienen '
             'por qué dar cinco de cada uno.',
  'example_en': 'One experiment gives 0 or 1, never “half a card”. Over many identically prepared '
                'experiments, frequencies approach 50/50; ten trials need not give exactly five of '
                'each.',
  'technical': 'H|0⟩ = (|0⟩ + |1⟩)/√2. P(0)=|1/√2|²=1/2; P(1)=1/2. La regla de Born relaciona '
               'amplitudes y probabilidades. Se hace un único muestreo efectivo por carta y mano.',
  'technical_en': 'H|0⟩ = (|0⟩ + |1⟩)/√2. P(0)=|1/√2|²=1/2; P(1)=1/2. The Born rule relates '
                  'amplitudes to probabilities. Each card is sampled effectively once per hand.',
  'circuits': [['H']],
  'sample': True},
 {'title': '3 · Rotaciones: importan el eje y el ángulo',
  'title_en': '3 · Rotations: axis and angle matter',
  'text': 'RX, RY y RZ giran el estado alrededor de los ejes X, Y y Z de la esfera. Cada ficha '
          'tiene un ángulo fijo. La esfera es un mapa: norte es original, sur es ligada. La altura '
          'Z determina sus porcentajes; X e Y también describen información de fase y coherencia.',
  'text_en': 'RX, RY and RZ rotate the state about the Bloch X, Y and Z axes. Each token has a '
             'fixed angle. The sphere is a map: north is original, south linked. Height Z sets the '
             'measurement percentages; X and Y also encode phase and coherence.',
  'example': 'RY(π/6) desde original da 93,3 % / 6,7 %. Después de H, la misma RY da 25 % / 75 %. '
             'Una ficha no tiene un porcentaje fijo: opera sobre lo que dejó la anterior.',
  'example_en': 'RY(π/6) from original gives 93.3% / 6.7%. After H, the same RY gives 25% / 75%. A '
                'gate does not have a fixed percentage: it acts on the previous state.',
  'technical': 'π radianes = 180°; π/2 = 90°; π/6 = 30°; −π/6 = −30°. RY(θ)|0⟩ = cos(θ/2)|0⟩ + '
               'sin(θ/2)|1⟩. RZ cambia fase sin cambiar inmediatamente los porcentajes al medir en '
               'Z. Girar la cámara no aplica ninguna compuerta.',
  'technical_en': 'π radians = 180°; π/2 = 90°; π/6 = 30°; −π/6 = −30°. RY(θ)|0⟩ = cos(θ/2)|0⟩ + '
                  'sin(θ/2)|1⟩. RZ changes phase without immediately changing Z-measurement '
                  'percentages. Rotating the camera applies no gate.',
  'circuits': [['H', 'RY:pi/6'],
               ['H', 'RY:-pi/6'],
               ['RY:pi/6'],
               ['RX:pi/2'],
               ['H', 'RZ:pi/2', 'H']],
  'sample': True},
 {'title': '4 · Fase e interferencia: el orden importa',
  'title_en': '4 · Phase and interference: order matters',
  'text': 'Pensá en ondas que pueden reforzarse o cancelarse. Las amplitudes cuánticas se combinan '
          'de esa manera. La fase indica cómo se alinean: dos estados pueden mostrar iguales '
          'porcentajes ahora y dar resultados distintos después de otra compuerta.',
  'text_en': 'Think of waves reinforcing or cancelling each other. Quantum amplitudes combine that '
             'way. Phase describes how they align: two states can show the same percentages now '
             'and behave differently after another gate.',
  'example': 'H → H vuelve a original. H → Z → H termina en ligada. Z no cambió los porcentajes '
             'inmediatamente, pero cambió cómo la última H combinó las amplitudes. No medimos '
             'entre esas operaciones.',
  'example_en': 'H → H returns to original. H → Z → H ends in linked. Z did not immediately change '
                'the percentages, but changed how the last H combined amplitudes. We do not '
                'measure between these operations.',
  'technical': 'H(α|0⟩ + β|1⟩) = ((α+β)|0⟩ + (α−β)|1⟩)/√2. Z cambia β por −β. El signo afecta la '
               'interferencia, no produce probabilidades negativas. Una fase global común a ambas '
               'amplitudes no cambia resultados observables.',
  'technical_en': 'H(α|0⟩ + β|1⟩) = ((α+β)|0⟩ + (α−β)|1⟩)/√2. Z changes β to −β. The sign affects '
                  'interference, not the non-negativity of probabilities. A global phase shared by '
                  'both amplitudes changes no observable outcome.',
  'circuits': [['H', 'X'], ['X', 'H'], ['H', 'Z', 'H']],
  'sample': True},
 {'title': 'Mano guiada con Bot Q',
  'title_en': 'A guided hand with Bot Q',
  'text': 'Elegí una carta y hasta tres fichas. Bot Q cantará Truco: probá “Envido va primero”. '
          'Respondé al Truco después de resolver los tantos y jugá las bazas. Bot Q solo aparece '
          'en esta mano. Al terminar podés pasar a la explicación final del ruido.',
  'text_en': 'Choose a card and up to three tokens. Bot Q will call Truco: try “Envido goes '
             'first”. After the totals are resolved, answer Truco and play the tricks. Bot Q '
             'appears only in this hand. At the end, continue to the final noise lesson.',
  'example': 'Confirmar bloquea tu circuito, pero no mide. La carta Q se mide al jugarla o aceptar '
             'Envido. Con privacidad, solo la persona que tiene el turno debe mirar su mano.',
  'example_en': 'Confirming locks your circuit, without measuring. The Q card is measured when '
                'played or Envido accepted. With privacy enabled, only the player whose turn it is '
                'should look at their hand.',
  'circuits': [],
  'sample': False,
  'guided': True},
 {'title': '5 · Ruido: un qubit también cambia al esperar',
  'title_en': '5 · Noise: waiting can change a qubit',
  'text': 'Un qubit real interactúa con su entorno. Puede perder energía y la coherencia que '
          'permite interferir. En el juego simulamos ambas cosas: después de confirmar, el reloj '
          'corre mientras pensás un turno visible. No corre durante avisos, privacidad, menú ni '
          'pestañas ocultas. Una carta ya medida queda fija.',
  'text_en': 'A real qubit interacts with its environment. It can lose energy and the coherence '
             'that enables interference. This game simulates both: after confirmation, the clock '
             'runs during your visible decision time. Notices, privacy, menus and hidden tabs '
             'pause it. A measured card stays fixed.',
  'example': 'Con H empezás en 50/50. Esperar acerca la distribución a original en este modelo. El '
             'ruido no siempre acerca todo a 50/50: depende del canal y del estado. Los segundos '
             'se ampliaron para enseñar; no son tiempos de un dispositivo IonQ.',
  'example_en': 'H starts at 50/50. Waiting moves the distribution toward original in this model. '
                'Noise does not always move everything toward 50/50: it depends on the channel and '
                'state. Times are scaled for teaching, not calibrated to an IonQ device.',
  'technical': 'El programa evoluciona una matriz de densidad ρ con operadores de Kraus de '
               'relajación y desfasaje. Los porcentajes mostrados son las diagonales de esa misma '
               'matriz que se usa para muestrear con Qiskit. Es ruido físico modelado, no un '
               'porcentaje aleatorio decorativo.',
  'technical_en': 'The program evolves a density matrix ρ using amplitude-damping and dephasing '
                  'Kraus operators. Displayed percentages are the diagonal entries of the same '
                  'matrix sampled by Qiskit. This is a physical noise model, not decorative random '
                  'percentages.',
  'circuits': [['H']],
  'sample': True,
  'noise': True}]
