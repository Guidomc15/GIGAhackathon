# Qriollo — Truco Cuántico

**Quantum Playground**

Truco Cuántico is a gamified introduction to constructing, evolving and measuring single-qubit circuits, built around the Argentine card game Truco. Two people share a device, prepare private circuits and compete to 15 points.

This effort is supported by Qollab & IonQ.

## Educational problem and solution

Beginners often confuse probabilities with a hidden classical value, or treat quantum gates as fixed random powers. Here a gate's effect depends on the state and every earlier operation. A selected card and its same-number partner encode |0⟩ and |1⟩. Phase, gate order and interference change strategically relevant identities; the circuit is essential to the game, rather than a decorative random-number generator.

## Start and play

Run this project as a JS / Qiskit wrapper. Choose a **remote IonQ simulator**, not quantum hardware. Open “Tutorial con Bot Q” to explore X, H, RY, order and H→Z→H. Click “Empezar Partida” in the opening menu to enter two human names. Pass the device before the two-step private reveal. Choose one card, arrange up to three of four gate tokens, confirm, then use contextual cantos and play controls.

**Current limitation:** the owner's project completed an application tutorial X measurement and a separate real H circuit on IonQ Aria 1 simulator (`shots=1`). A second job in the same run was rejected by Qollab's one-job limit. Consequently the required full match with successive IonQ measurements is not yet possible. A clearly labeled checkbox enables **local Qiskit development mode** for complete matches and all lessons. It never activates automatically and is not represented as an IonQ execution. This is a partial implementation, not a completed hackathon MVP.

## Interpret results

North is |0⟩, south |1⟩. The current Bloch vector, numbered prefix states and trajectory are calculated with Qiskit. Percentages are ideal Born probabilities before measuring, not repeated measurements. The technical view exposes complex amplitudes and relative phase. A dashed collapse segment represents measurement, not unitary rotation. The identity is fixed after one effective sample, and never measured twice during a hand.

Accepting Envido measures only cards still unmeasured and reveals each result privately, followed by public totals. Playing an unmeasured quantum card shows a public preview and resolves it once. Hands ending without needing a card leave that card unmeasured. The final report reveals both players' circuits and logs. Current remote simulators use noise models, so returned shots may differ from an ideal deterministic prediction; outcomes are never secretly forced.

## Architecture and replication

Python modules separate classic rules, Qiskit evolution, state machine, measurement adapter, tutorial and session API. Original HTML/CSS/JavaScript handles rendering and accessible controls. There is no database, multiplayer service or hidden backend integration.

To replicate locally: create a Python environment, install requirements-dev.txt, run `python serve.py`, and open the displayed loopback address. Run pytest for the rule, quantum, state-machine and adapter tests. The repository contains compatibility probes, testing evidence, notices and demo instructions. Upload the project archive to fork the Qollab build. A full IonQ game requires a verified organizer-approved environment supporting successive jobs without violating measurement timing.

## Licensing, dependencies and AI

Original game source code and composer UI: MIT; reused sphere portions are disclosed separately, not relicensed. Owner-supplied menu, table and deck artwork have separate rights, described below. Qiskit: Apache-2.0. NumPy/SciPy: BSD licenses with distribution notices. The runtime uses Qollab's injected IonQ provider and requests no keys. THIRD_PARTY_NOTICES.md lists versions, transitive packages, tools and notices. OpenAI Codex assisted implementation, documentation and tests. The opening menu and table designs were supplied by the owner; the menu is unchanged, while built-in imagegen removed baked example cards and score from the table so live state can be drawn over it; its license is separate from the original MIT code, as detailed in THIRD_PARTY_NOTICES.md. The project teaches one qubit only, without claims of entanglement or quantum advantage.

Source delivery is a MIT archive; the owner declined GitHub publication. The 56-second captioned evidence video and equivalent transcript are bundled under artifacts/ and accessible from Créditos in the application. Full code, execution instructions and current limitations accompany the source archive. The repository-link criterion remains unmet.

### Cartas y compositor actualizado

Las 40 cartas y el dorso usan el diseño aportado por el autor. Al activar una carta cuántica se abre una carta translúcida agrandada: circuito de tres posiciones arriba, identidades original/ligada y esfera de Bloch calculada en el centro, cuatro fichas reales a la derecha. Se pueden agregar, quitar y ordenar compuertas, deshacer, reiniciar y confirmar en privado. En Valores se puede consultar el mazo completo. Las imágenes aportadas tienen sus derechos separados del código MIT; ver THIRD_PARTY_NOTICES.md. La actualización visual no cambia el bloqueo comprobado de un job IonQ por ejecución.

### Reconocimiento: esfera interactiva de Qollab

La esfera adapta código de [Interactive Bloch Sphere, por qollab](https://qollab.xyz/u/qollab/interactive-bloch-sphere), aportado por el autor del juego. Reutilizamos su proyección, anillos/ejes con profundidad, flecha, guía al ecuador, giro suave y arrastre de la cámara. Conservamos nuestro compositor y sus fichas; no importamos la interfaz de compuertas ni el muestreo del ejemplo. La animación recibe la trayectoria unitaria calculada con Qiskit y añade estados intermedios, colapso identificado, teclado y reducción de movimiento. Girar la cámara no modifica el qubit. Hay reconocimiento visible debajo de cada esfera y en Créditos. Fuentes, cambios y estado de licencia en THIRD_PARTY_NOTICES.md; el export no incluía licencia explícita y no lo presentamos como código propio ni lo relicenciamos bajo MIT.

### Consistencia visual de circuitos

La flecha de estado ahora es roja para mejorar su visibilidad. El tutorial y los informes al terminar cada mano usan el mismo marco translúcido y circuito de tres posiciones de las cartas. Los informes muestran ambas identidades dentro de ese marco. Las posiciones en informes/tutorial son de lectura; la edición sigue disponible durante la preparación de las cartas.

### Colores por compuerta

H naranja, X verde, Z celeste, RY+ violeta y RY− amarillo: cada ficha y posición del circuito comparte el color del tramo que produce en la esfera. La leyenda indica el orden; estilos sólido, discontinuo y punteado ayudan a distinguir tramos superpuestos. La flecha del estado sigue roja. Si la compuerta no mueve el vector, no se inventa un recorrido.

## Explicaciones paso a paso

El informe privado de cada mano y el historial final explican cada compuerta usando el estado real que recibió y dejó según Qiskit. Incluyen fórmula, probabilidades antes/después y una esfera por paso: los recorridos anteriores se atenúan, el actual se destaca y se puede repetir su animación. El tutorial ofrece la misma explicación desplegable. H desde |0⟩ muestra H|0⟩ = (|0⟩ + |1⟩)/√2 y P = (1/√2)² = 1/2; una H posterior explica suma/resta e interferencia, sin afirmar que siempre da 50/50. Z distingue fase de probabilidad; RY conserva su ángulo real ±π/6. No se realizan mediciones entre los pasos. La trayectoria es una visualización equivalente calculada, no telemetría de IonQ. Fórmulas contrastadas con la biblioteca de Qiskit/IBM Quantum.

## Medición sin interrumpir la mano

Durante el juego, medir muestra una transición de brillo y fundido de 720 ms hacia la identidad confirmada. Al jugar ocurre en el lugar de la carta sobre la mesa y continúa con el siguiente turno; en el Envido ocurre solamente después de la revelación privada del dueño. No se muestran fórmulas, esferas, fichas ni registros al recibir el resultado. Los análisis se reservan para el informe de fin de mano y el historial final. El tutorial conserva sus explicaciones voluntarias. Reducir animaciones evita la transición y su espera. El efecto no mide nuevamente, no predice el resultado y no modifica la lógica de la partida ni las entregas privadas.

## Carta única con onda adaptable

La carta cuántica de la mano y del compositor fusiona sus dos identidades en una única superficie del mazo original. La identidad |0⟩ ocupa arriba la proporción P(0); |1⟩ ocupa abajo P(1). Una onda luminosa deformable indica la separación, centrada en 50/50 y desplazada con otras probabilidades. Al editar, su posición sigue P(0) = (1 + Z)/2 a lo largo de la trayectoria real calculada con Qiskit; su color sigue la compuerta del tramo. Los recorridos y la fase permanecen en la esfera. La división es una leyenda visual de probabilidades, no una división espacial del qubit ni una forma de leer una carta clásica escondida. El compositor muestra una sola carta fusionada, con el circuito y la esfera sobre la mesa, sin panel comparativo ni marco añadido alrededor de la demostración.

Cuando existe un resultado validado, la onda se desplaza y desaparece durante la transición de 720 ms, dejando la identidad íntegra. Ese fundido ilustra el colapso; no simula estados intermedios medidos. Un pequeño Bloch muestra el estado final; las explicaciones siguen reservadas para el cierre de la mano. El modo de reducción de movimiento mantiene la proporción estática y evita la animación.
