# Validación de 0.2.2

Entorno local: Python 3.13.16, Qiskit 2.5.2 y Chromium 138. La suite tiene **48 pruebas Python**:

```sh
.venv/bin/python -m unittest discover -s tests -v
python build_qollab.py --check --verify-zip QOLLAB_0.2.2.zip
```

Verifican reglas, jerarquía, pardas, cadenas de cantos, conservación del mazo, privacidad, medición única y atómica, niveles Aprendizaje y Difícil (2 retiros por jugador y por mano, reordenar no cuenta, cambiar de carta con compuertas sí), partidas completas en los dos niveles, el tutorial completo en español e inglés (también con sesión IonQ, que igual mide en local), las 9 lecciones de compuertas, sesiones HTTP, recuperación de errores remotos con dobles de prueba y el motor de Qollab aislado sin carpeta `truco/`.

Con `serve.py` ejecutándose:

```sh
node tests/browser_interface.cjs
node tests/browser_full_match.cjs
TRUCO_PRIVACY=1 node tests/browser_full_match.cjs
node tests/browser_animations.cjs
node tests/browser_0.2.2.cjs
node tests/browser_tutorial.cjs
TRUCO_LANG=en node tests/browser_tutorial.cjs
```

Instalá Playwright para ejecutar las pruebas de navegador. `PLAYWRIGHT_MODULE` permite una instalación externa; `CHROMIUM_EXECUTABLE_PATH` elige Chromium del sistema. `TRUCO_URL` cambia el destino y `ARTIFACT_DIR` la carpeta de capturas.

- `browser_0.2.2.cjs`: inglés por defecto en un navegador en inglés, cambio de idioma en cualquier pantalla y en plena partida, error del motor traducido, nivel Difícil desde la interfaz, botón Confirmar, colores de los ejes, música desde el MP3 (bucle, volumen, silencio), temporizadores 1/3/7/manual, posición del scroll y voces.
- `browser_tutorial.cjs`: juega los 38 pasos tocando solo el control que resalta Bot Q, comprueba que el resto quede bloqueado y recorre las 9 lecciones.

`browser_full_match.cjs` termina la partida completa; en Chromium sin aceleración por hardware abrir «Ver resumen» al final puede tardar más de 12 s porque dibuja una esfera por mano jugada.

Estas pruebas no ejecutan el wrapper de Qollab ni una partida IonQ nueva, ni comprueban voces instaladas en cada sistema. [Registros anteriores](docs/history/TESTING_0.2.0.md).
