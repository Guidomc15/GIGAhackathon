# Cambios

## 0.2.4

Al terminar una mano, la mesa queda a la vista con las cartas de cada baza: la ganadora de cada baza se marca en dorado, la perdedora se atenúa y la última carta jugada cae sobre la mesa con una animación. El compositor de circuitos es más ancho en escritorio y las compuertas del circuito se ven más grandes (nombre y ángulo en dos líneas). En el inicio, la placa grande es «Partida personalizada» y «Partida rápida» pasa al enlace de abajo. Cartas retocadas: el 2 de espada tiene dos espadas y el rey del 12 de espada sostiene una espada en lugar del cetro. El botón «Repositorio» lleva al repositorio público.

README bilingüe pensado como Project Card de Qollab: primero en inglés y después en español, responde qué es, por qué importa y para quién, cómo funciona la parte cuántica, cómo ejecutarlo y qué resultados esperar. El README se incluye en `QOLLAB_0.2.4.zip`. Reemplaza a `docs/README.en.md`, `QOLLAB_SUBMISSION.md` y `JUDGING_SUMMARY.md`.

El juego no tiene música: se quitó el tema de 0.2.2 (`music-data.js`) porque no tenía licencia para redistribuirse. El menú 🔊 Voces conserva las voces de los cantos con su volumen.

Limpieza de la entrega: se quitaron archivos de versiones anteriores (`main.py` y `qollab_smoke/`, la prueba de backend de 0.1.9; `docs/history/`, `docs/ROLLBACK.md`, `STATUS.md` y `RUNNING.md`, cuyo contenido vigente pasó al README), estilos de pantallas que ya no existen (menú anterior, galería de cartas, tablas de rangos, animaciones de medición en desuso) y los alias de compuertas `RY+`/`RY-`. `browser_0.2.2.cjs` pasa a llamarse `browser_settings.cjs`. Las versiones anteriores siguen disponibles en sus tags.

## 0.2.3

Inicio nuevo según el boceto del equipo: logo de Qriollo, lema bilingüe, placas Tutorial, Partida rápida, Ayuda rápida y Créditos, y la carta Q con la esfera de Bloch; ocupa toda la ventana y en celulares se apila.

Diecisiete diapositivas antes de la partida, con glosario tocable: reglas, palos, escala por niveles, un duelo para practicar qué carta gana, dos manos de ejemplo jugadas baza por baza, cantos Truco/Retruco/Vale Cuatro, cantar Truco, responder como rival, cómo termina la mano y cinco de Envido (valores, cuatro ejemplos de cálculo con tres cartas del mismo palo sin flor, Envido del rival, respuestas con Real y Falta Envido, y Falta Envido desde un marcador 12–9) y dos de la carta cuántica: qué es (un qubit con la carta original |0⟩ y la ligada |1⟩, con probabilidades para sin fichas, H y X y un botón para medir) y los palos ligados (basto ↔ oro, copa ↔ espada) con la fila de la escala de cada carta.

La partida con Bot Q pasa a ser una práctica de cuatro manos y 33 pasos: 6 desafíos (quedan habilitadas todas las jugadas válidas; una incorrecta no se hace y Bot Q da una pista) y 6 preguntas rápidas (bazas, tantos, pardas, quién puede subir, cuánto vale no querer y cuánto se suma), y una cuarta mano guiada con la carta cuántica. Bot Q le habla al jugador en segunda persona («Ganaste la baza», «Tu turno», «Sos mano», «Tu carta se midió», «Te toca responder», «Ampliar tus detalles», «Sumaste +1»). «Ver resumen» aparece recién en el paso final.

Ayuda rápida: «Valores de las cartas» muestra la escala ilustrada de las diapositivas con las 40 cartas. El resumen de la mano se puede recorrer con rueda, trackpad, teclado o toque (sin barra visible) hasta el registro de cada medición. Cada medición se escribe en la consola del navegador como «[Qriollo] Medición», con el registro crudo de Qiskit o IonQ; la versión se ve en el pie de página y en la consola.

La esfera de Bloch rotula los seis polos: |0⟩ y |1⟩ en Z, |+⟩ y |−⟩ en X, |+i⟩ y |−i⟩ en Y, con el color de cada eje. Mazo de fichas rebalanceado a 41: H, Z, RX, RY y RZ con 8 fichas cada una (cerca de 20 % cada familia) y una sola X (2,4 %). Entrega plana `QOLLAB_0.2.3.zip`; los módulos nuevos son `slides.js` y `home-art.js`, y `menu-art.js` ya no se usa.

## 0.2.2

Interfaz completa en español e inglés, con selector 🌐 en el inicio y en el encabezado de todas las pantallas; el idioma inicial sigue al navegador. El motor devuelve pistas, etiquetas y errores en el idioma elegido. Los cantos conservan su nombre.

Tutorial en dos partes. Truco con Bot Q: partida guiada de cuatro manos y 38 pasos, con explicaciones de nivel académico (baraja, jerarquía, bazas, mano, Envido y tantos, pardas, Truco y Retruco) y una cuarta mano con la carta cuántica; mide siempre con Qiskit local. Compuertas y esfera de Bloch: nueve lecciones con esfera animada en bucle, analogías del juego y porcentajes de Qiskit. Reglas paginadas por secciones, con introducción y fuentes.

Niveles Aprendizaje y Difícil (2 retiros de compuertas por jugador y por mano). Botón único «Confirmar». Ejes de la esfera con color (X coral, Y violeta, Z celeste) y letras de las explicaciones con el mismo color. Pantallas de escritorio ajustadas a la ventana, sin barra de desplazamiento: mesa a la izquierda, guía y cantos a la derecha. Música nueva aportada por el equipo. Menú en inglés con placas propias.

Se quitaron el ruido cuántico educativo, su lección y su documento, y la rotación π/67 (el mazo de fichas pasa de 40 a 34). Pruebas nuevas: `test_modes.py`, `browser_0.2.2.cjs` y `browser_tutorial.cjs`. Entrega plana `QOLLAB_0.2.2.zip`.

## 0.2.1

Avisos de cantos, bazas, mediciones y puntos con avance manual inicial, Skip y temporizador 1/3/7 s. Reducir movimiento conserva el tiempo de lectura. Los turnos conservan la posición del scroll, sin reemplazar la mesa por un bloque pequeño.

Tipografía, valores de Bloch, identificación de mano y cartas jugadas más grandes. Identidades de la carta Q con nombres y porcentajes blancos fuera del recorte de las figuras.

Música original procedural y voces de cantos/respuestas, con silencio y volumen independientes en el menú. Preferencias guardadas cuando el navegador lo permite; audio después de una interacción.

Ruido educativo mediante Qiskit DensityMatrix y operadores de Kraus de relajación y desfasaje. El tiempo visible de decisión cambia la misma distribución usada para medir. Pausa durante avisos, privacidad, ayudas, menú y pestañas ocultas. No se aplica a cartas medidas ni se envía a IonQ. Nueva lección final con experimentos 0/15/30/60 s y referencias oficiales.

Reglas y lecciones en español e inglés, con ejemplos y detalle técnico opcional. Envido solo se propone antes de jugar la primera carta propia; Falta Envido usa la distancia del líder a 15 en esta variante. Las partidas conservan las reglas de pardas y la prioridad del Envido ante un Truco pendiente.

README y guía Qollab actuales. Generador con verificación del ZIP, pruebas de ruido y navegador, y workflow de CI. Entrega plana `QOLLAB_0.2.1.zip`. Respaldo anterior en tag `v0.2.0`.

## 0.2.0

Compositor con dos identidades del mismo tamaño, privacidad opcional, giro de cartas, cantos/Envido automáticos, premios para ambos jugadores y medición antes del resultado y resumen público. Mazo con pocas X y rotaciones fijas. Servidor local y motor plano para Qollab.

El registro completo de 0.2.0 y anteriores está en el tag `v0.2.0`.
