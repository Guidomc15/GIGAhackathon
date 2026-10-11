# Pruebas de 0.2.4

Entorno verificado: Python 3.13 con Qiskit 2.5.2 y Chromium 138. GitHub Actions corre lo mismo con Python 3.12 en cada push a `main`.

## Python (49 pruebas)

```sh
.venv/bin/python -m unittest discover -s tests -v
python build_qollab.py --check --verify-zip QOLLAB_0.2.4.zip
```

| Archivo | Qué verifica |
| --- | --- |
| `test_game.py` | Reglas, jerarquía, pardas, cadenas de cantos, Envido sin flor, conservación del mazo, privacidad y la práctica con Bot Q en español e inglés (desafíos que no juegan una jugada incorrecta, preguntas que piden la respuesta correcta, marcador final 8–0) |
| `test_quantum.py` | Mazo de 41 fichas (8 H, 8 Z, 8 RX, 8 RY, 8 RZ y 1 X), probabilidades y trayectorias de cada compuerta con Qiskit |
| `test_modes.py` | Niveles Aprendizaje y Difícil (2 retiros por jugador y por mano; reordenar no cuenta), Falta Envido a 15, Envido después del Truco y partidas completas en los dos niveles |
| `test_remote.py` | Adaptador IonQ con dobles de prueba: nunca duplica un envío incierto, retoma el mismo job tras un timeout, reutiliza el resultado, rechaza hardware real y bloquea el cambio de modo con un job pendiente |
| `test_local_server.py` | Servidor local: sesiones HTTP, orígenes y pedidos inválidos |
| `test_qollab_bundle.py` | `qollab_engine.py` actualizado y ejecutable sin la carpeta `truco/`; el ZIP tiene exactamente los archivos que importa la interfaz |

## Navegador (Playwright)

Con `serve.py` en marcha:

```sh
node tests/browser_interface.cjs
node tests/browser_full_match.cjs
TRUCO_PRIVACY=1 node tests/browser_full_match.cjs
node tests/browser_animations.cjs
node tests/browser_settings.cjs
node tests/browser_slides.cjs
node tests/browser_tutorial.cjs
TRUCO_LANG=en node tests/browser_tutorial.cjs
```

Variables de entorno:
- `PLAYWRIGHT_MODULE` usa una instalación externa de Playwright;
- `CHROMIUM_EXECUTABLE_PATH` elige el Chromium del sistema;
- `TRUCO_URL` cambia el servidor;
- `ARTIFACT_DIR` es la carpeta de capturas.

| Archivo | Qué verifica |
| --- | --- |
| `browser_interface.cjs` | Celular y escritorio sin desbordes, Ayuda rápida con la escala de 40 cartas, compositor, teclado, modo con privacidad, recuperación de errores, pistas de cantos, resumen y la práctica completa en celular |
| `browser_full_match.cjs` | Una partida completa hasta 15 puntos, con y sin privacidad, sin errores en el navegador |
| `browser_animations.cjs` | Cantos, tantos de Envido, puntos, giro de cartas y medición pública antes del turno siguiente |
| `browser_settings.cjs` | Inglés por defecto en un navegador en inglés, cambio de idioma en cualquier pantalla, nivel Difícil, botón Confirmar, colores de los ejes, sin música, temporizadores, scroll y voces |
| `browser_slides.cjs` | Las 17 diapositivas en español (escritorio) e inglés (celular): glosario, palos, escala, duelo, ejemplos de bazas, Truco bloqueado hasta cantarlo, respuestas del rival, Envido (valores, cálculos 2/29/32/20, duelo 29 contra 31, respuestas, Falta Envido), carta cuántica (100/0, 50/50, 0/100 y medición) y palos ligados. En escritorio, ninguna diapositiva tiene scroll |
| `browser_tutorial.cjs` | Los 33 pasos de la práctica. En cada desafío y pregunta prueba primero las respuestas incorrectas: tienen que dejar una pista sin avanzar. En los pasos guiados queda un solo control activo. También verifica: textos en segunda persona, «Ver resumen» solo al final, las dos mediciones en la consola con su registro de Qiskit, el resumen desplazable hasta el registro y las 9 lecciones de compuertas |

## Lo que no cubren

- No ejecutan el wrapper de Qollab ni un job IonQ real.
- No comprueban las voces instaladas en cada sistema.
- `browser_full_match.cjs` puede tardar más de 12 s en abrir «Ver resumen» en Chromium sin aceleración por hardware, porque dibuja una esfera por mano.
