# Cambios

## 0.2.2

Interfaz completa en español e inglés, con selector 🌐 en el inicio y en el encabezado de todas las pantallas; el idioma inicial sigue al navegador. El motor devuelve pistas, etiquetas y errores en el idioma elegido. Los cantos conservan su nombre.

Tutorial en dos partes. Antes de la partida, diez diapositivas (reglas, palos, escala por niveles, un duelo para practicar qué carta gana, dos manos de ejemplo jugadas baza por baza, cantos Truco/Retruco/Vale Cuatro, cantar Truco, responder como rival, cómo termina la mano y cinco de Envido: valores, cuatro ejemplos de cálculo con tres cartas del mismo palo sin flor, Envido del rival, respuestas con Real y Falta Envido, y Falta Envido desde un marcador 12–9) con glosario tocable de términos del Truco. Práctica con Bot Q: cuatro manos y 33 pasos que ponen en práctica las diapositivas, con 6 desafíos (quedan habilitadas todas las jugadas válidas; una incorrecta no se hace y Bot Q da una pista) y 6 preguntas rápidas (bazas, tantos, pardas, quién puede subir, cuánto vale no querer y cuánto se suma), y una cuarta mano guiada con la carta cuántica; mide siempre con Qiskit local. Compuertas y esfera de Bloch: nueve lecciones con esfera animada en bucle, analogías del juego y porcentajes de Qiskit. Reglas paginadas por secciones, con introducción y fuentes.

Niveles Aprendizaje y Difícil (2 retiros de compuertas por jugador y por mano). Botón único «Confirmar». Ejes de la esfera con color (X coral, Y violeta, Z celeste) y letras de las explicaciones con el mismo color. Pantallas de escritorio ajustadas a la ventana, sin barra de desplazamiento: mesa a la izquierda, guía y cantos a la derecha. Música nueva aportada por el equipo. Menú en inglés con placas propias.

Inicio nuevo según el boceto del equipo: logo de Qriollo, lema bilingüe, placas Tutorial, Partida rápida, Ayuda rápida y Créditos, y la carta Q con la esfera de Bloch; ocupa toda la ventana y en celulares se apila.

Ayuda rápida: «Valores de las cartas» muestra la misma escala ilustrada de las diapositivas, de la más alta a la más baja, con las 40 cartas. Textos en segunda persona para el jugador «Vos»/«You» de la práctica (por ejemplo «Ganaste la baza», «Tu carta se midió», «Te toca responder»). En la práctica, «Ver resumen» aparece recién en el paso final, después de la mano cuántica. Mazo de fichas rebalanceado a 41: H, Z, RX, RY y RZ con 8 fichas cada una (cerca de 20 % cada familia) y una sola X (2,4 %).

Se quitaron el ruido cuántico educativo, su lección y su documento, y la rotación π/67 (el mazo de fichas pasa de 40 a 34). Pruebas nuevas: `test_modes.py`, `browser_0.2.2.cjs` y `browser_tutorial.cjs`. Entrega plana `QOLLAB_0.2.2.zip`.

## 0.2.1

Avisos de cantos, bazas, mediciones y puntos con avance manual inicial, Skip y temporizador 1/3/7 s. Reducir movimiento conserva el tiempo de lectura. Los turnos conservan la posición del scroll, sin reemplazar la mesa por un bloque pequeño.

Tipografía, valores de Bloch, identificación de mano y cartas jugadas más grandes. Identidades de la carta Q con nombres y porcentajes blancos fuera del recorte de las figuras.

Música original procedural y voces de cantos/respuestas, con silencio y volumen independientes en el menú. Preferencias guardadas cuando el navegador lo permite; audio después de una interacción.

Ruido educativo mediante Qiskit DensityMatrix y operadores de Kraus de relajación y desfasaje. El tiempo visible de decisión cambia la misma distribución usada para medir. Pausa durante avisos, privacidad, ayudas, menú y pestañas ocultas. No se aplica a cartas medidas ni se envía a IonQ. Nueva lección final con experimentos 0/15/30/60 s y referencias oficiales.

Reglas y lecciones en español e inglés, con ejemplos y detalle técnico opcional. Envido solo se propone antes de jugar la primera carta propia; Falta Envido usa la distancia del líder a 15 en esta variante. Las partidas conservan las reglas de pardas y la prioridad del Envido ante un Truco pendiente.

README y guía Qollab actuales; documentos anteriores en `docs/history/`. Generador con verificación del ZIP, pruebas de ruido y navegador, y workflow de CI. Entrega plana `QOLLAB_0.2.1.zip`. Respaldo anterior en tag `v0.2.0`.

## 0.2.0

Compositor con dos identidades del mismo tamaño, privacidad opcional, giro de cartas, cantos/Envido automáticos, premios para ambos jugadores y medición antes del resultado y resumen público. Mazo con pocas X y rotaciones fijas. Servidor local y motor plano para Qollab.

[Registro completo anterior](docs/history/RELEASE_0.2.0.md).
