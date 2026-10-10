# Qriollo — Truco Cuántico

**Quantum Playground**

Truco Cuántico is a gamified introduction to constructing, evolving and measuring single-qubit circuits, built around the Argentine card game Truco. Two people share a device, prepare private circuits and compete to 15 points.

This effort is supported by Qollab & IonQ.

## Educational problem and solution

Beginners often confuse probabilities with a hidden classical value, or treat quantum gates as fixed random powers. Here a gate's effect depends on the state and every earlier operation. A selected card and its same-number partner encode |0⟩ and |1⟩. Phase, gate order and interference change strategically relevant identities; the circuit is essential to the game, rather than a decorative random-number generator.

## Start and play

Run this project as a JS / Qiskit wrapper. Choose a **remote IonQ simulator**, not quantum hardware. Open “Tutorial con Bot Q” to explore X, H, RY, order and H→Z→H. Click “Empezar Partida” in the opening menu to enter two human names. Optionally enable “Jugar con privacidad” to hide hands when passing the device; by default turns switch directly with a card-flip animation. Choose one card, arrange up to three of four gate tokens, confirm, then use contextual cantos and play controls.

**Current limitation:** the owner's project completed an application tutorial X measurement and a separate real H circuit on IonQ Aria 1 simulator (`shots=1`). A second job in the same run was rejected by Qollab's one-job limit. Consequently the required full match with successive IonQ measurements is not yet possible. A clearly labeled checkbox enables **local Qiskit development mode** for complete matches and all lessons. It never activates automatically and is not represented as an IonQ execution. This is a partial implementation, not a completed hackathon MVP.

## Interpret results

North is |0⟩, south |1⟩. The current Bloch vector, numbered prefix states and trajectory are calculated with Qiskit. Percentages are ideal Born probabilities before measuring, not repeated measurements. The technical view exposes complex amplitudes and relative phase. A dashed collapse segment represents measurement, not unitary rotation. The identity is fixed after one effective sample, and never measured twice during a hand.

Accepting Envido measures only cards still unmeasured, then automatically announces both actual totals and awards points. Opponent cards remain hidden until the hand ends. Playing an unmeasured quantum card shows a public preview and resolves it once. Hands ending without needing a card leave that card unmeasured. The final report reveals both players' circuits and logs. Current remote simulators use noise models, so returned shots may differ from an ideal deterministic prediction; outcomes are never secretly forced.

## Architecture and replication

Python modules separate classic rules, Qiskit evolution, state machine, measurement adapter, tutorial and session API. Original HTML/CSS/JavaScript handles rendering and accessible controls. There is no database, multiplayer service or hidden backend integration.

To replicate locally: create a Python environment, install requirements.txt, and run `python serve.py`. The local server connects the original interface to Python with Qiskit Statevector, without IonQ or API keys. See RUNNING.md for commands. Run `python -m unittest discover -s tests -v` for the rules, quantum, session, HTTP, standalone upload and adapter regression checks; the historical 95-test engine suite referenced in TESTING.md is not included in this checkout. For Qollab, unzip `QOLLAB_0.2.0.zip` and upload its root files as JS / Qiskit. The generated `qollab_engine.py` contains the canonical Python modules without requiring folder uploads. See [QOLLAB_UPDATE.md](QOLLAB_UPDATE.md) to update an existing project. A full IonQ game requires a verified organizer-approved environment supporting successive jobs without violating measurement timing.

## Licensing, dependencies and AI

Original game source code and composer UI: MIT; reused sphere portions are disclosed separately, not relicensed. Owner-supplied menu, table and deck artwork have separate rights, described below. Qiskit: Apache-2.0. NumPy/SciPy: BSD licenses with distribution notices. The runtime uses Qollab's injected IonQ provider and requests no keys. THIRD_PARTY_NOTICES.md lists versions, transitive packages, tools and notices. OpenAI Codex assisted implementation, documentation and tests. The opening menu and table designs were supplied by the owner; the menu is unchanged, while built-in imagegen removed baked example cards and score from the table so live state can be drawn over it; its license is separate from the original MIT code, as detailed in THIRD_PARTY_NOTICES.md. The project teaches one qubit only, without claims of entanglement or quantum advantage.

The source repository is [Guidomc15/GIGAhackaton](https://github.com/Guidomc15/GIGAhackaton). The 56-second captioned historical evidence video and transcript remain bundled under artifacts/; they show an earlier Qollab release. Publication of a cloud environment does not commit or deploy this source to GitHub or Qollab.

### Cartas y compositor actualizado

Las 40 cartas y el dorso usan el diseño aportado por el autor. Al activar una carta cuántica se abre un compositor con dos cartas del mismo tamaño, sus nombres y probabilidades grandes, un circuito de tres posiciones, la esfera de Bloch calculada y cuatro fichas reales. Se pueden agregar, quitar y ordenar compuertas, deshacer, reiniciar y confirmar en privado. En Valores se puede consultar el mazo completo. Las imágenes aportadas tienen sus derechos separados del código MIT; ver THIRD_PARTY_NOTICES.md. La actualización visual no cambia el bloqueo comprobado de un job IonQ por ejecución.

### Reconocimiento: esfera interactiva de Qollab

La esfera adapta código de [Interactive Bloch Sphere, por qollab](https://qollab.xyz/u/qollab/interactive-bloch-sphere), aportado por el autor del juego. Reutilizamos su proyección, anillos/ejes con profundidad, flecha, guía al ecuador, giro suave y arrastre de la cámara. Conservamos nuestro compositor y sus fichas; no importamos la interfaz de compuertas ni el muestreo del ejemplo. La animación recibe la trayectoria unitaria calculada con Qiskit y añade estados intermedios, colapso identificado, teclado y reducción de movimiento. Girar la cámara no modifica el qubit. Hay reconocimiento visible debajo de cada esfera y en Créditos. Fuentes, cambios y estado de licencia en THIRD_PARTY_NOTICES.md; el export no incluía licencia explícita y no lo presentamos como código propio ni lo relicenciamos bajo MIT.

### Consistencia visual de circuitos

La flecha de estado ahora es roja para mejorar su visibilidad. El tutorial y los informes al terminar cada mano usan el mismo circuito de tres posiciones y la comparación de ambas identidades. Los informes muestran ambas identidades dentro de ese marco. Las posiciones en informes/tutorial son de lectura; la edición sigue disponible durante la preparación de las cartas.

### Colores por compuerta

H naranja, X verde, Z y RZ celeste, RX coral y RY violeta: cada ficha y posición del circuito comparte el color del tramo que produce en la esfera. La leyenda indica el orden; estilos sólido, discontinuo y punteado ayudan a distinguir tramos superpuestos. La flecha del estado sigue roja. Si la compuerta no mueve el vector, no se inventa un recorrido.

## Explicaciones paso a paso

El resumen público de cada mano y el historial final explican cada compuerta usando el estado real que recibió y dejó según Qiskit. Incluyen fórmula, probabilidades antes/después y una esfera por paso: los recorridos anteriores se atenúan, el actual se destaca y se puede repetir su animación. El tutorial ofrece la misma explicación desplegable. H desde |0⟩ muestra H|0⟩ = (|0⟩ + |1⟩)/√2 y P = (1/√2)² = 1/2; una H posterior explica suma/resta e interferencia, sin afirmar que siempre da 50/50. Z distingue fase de probabilidad; RX, RY y RZ conservan el ángulo fijo indicado en cada ficha. No se realizan mediciones entre los pasos. La trayectoria es una visualización equivalente calculada, no telemetría de IonQ. Fórmulas contrastadas con la biblioteca de Qiskit/IBM Quantum.

## Turnos, mediciones y resumen (0.2.0)

Los cantos aparecen en globos de diálogo; las frases se editan en `phrases.js`. El Envido anuncia automáticamente los tantos calculados después de la medición y resuelve los empates a favor de mano. Las cartas siguen visibles al aceptar, rechazar o aumentar un canto, pero no pueden jugarse hasta que se resuelva la respuesta.

Cada premio muestra el incremento de ambos jugadores, ordenado por quien sumó más, incluyendo +0 para el otro. Al jugar una carta cuántica sin medir, la transición muestra primero su identidad definitiva. Después llega el resultado de victoria/derrota y el botón **Ver resumen**. El resumen de ambos jugadores es público, con sus cartas y circuito resumidos y **Ampliar detalles** por jugador; nunca exige pases privados de dispositivo.

En la mano se conserva la carta fusionada introducida en 0.1.9. En el compositor ambas identidades tienen el mismo protagonismo. Sus porcentajes son probabilidades ideales; no representan una carta clásica escondida. Reducir animaciones conserva el resultado y omite las esperas de presentación.

El mazo tiene 40 fichas: 6 H, 1 X, 3 Z y dos de cada rotación RX, RY y RZ con ángulos π/2, π/6, −π/6, π/3 y π/67. El último ángulo conserva literalmente el pedido; su aclaración está pendiente. `truco/gates.py` define el catálogo del motor y `gates.js` sus etiquetas en la interfaz.
