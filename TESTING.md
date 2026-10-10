# Validación de 0.2.1

Entorno usado: Python 3.12.14, Qiskit 2.5.2 y Chromium local. La suite tiene **46 pruebas Python**:

```sh
.venv/bin/python -m unittest discover -s tests -v
python build_qollab.py --check --verify-zip QOLLAB_0.2.1.zip
```

Las pruebas verifican reglas, jerarquía, pardas, cadenas de cantos, conservación del mazo, privacidad, medición única y atómica, sesiones HTTP, recuperación de errores remotos con dobles de prueba y el motor de Qollab aislado sin carpeta `truco/`.

El ruido se contrasta con la solución exponencial analítica para diferentes estados y tiempos: probabilidades normalizadas, matriz positiva, Bloch dentro de la esfera y trayectoria consistente. Se comprueba que la medición use la distribución mostrada, que el tiempo no cambie cartas medidas, que los ticks no afecten al rival, que se rechacen turnos/intervalos inválidos y que nunca se envíe el canal local a IonQ. Se completan partidas con ruido hasta 15. El tutorial final ejecuta un muestreo real desde DensityMatrix.

Con `serve.py` ejecutándose:

```sh
node tests/browser_interface.cjs
node tests/browser_full_match.cjs
TRUCO_PRIVACY=1 node tests/browser_full_match.cjs
node tests/browser_animations.cjs
node tests/browser_0.2.1.cjs
```

Instalá Playwright para ejecutar las pruebas de navegador. `PLAYWRIGHT_MODULE` permite una instalación externa; `CHROMIUM_EXECUTABLE_PATH` elige Chromium del sistema. `TRUCO_URL` cambia el destino y `ARTIFACT_DIR` la carpeta de capturas.

Las pruebas largas usan el botón Skip real para avanzar. La prueba `browser_0.2.1.cjs` conserva el control manual: comprueba que los avisos no desaparezcan al reducir movimiento, el ciclo 1/3/7/manual, el cierre a 1 segundo, ruido en vivo y pausa durante avisos y ayudas, posición del scroll, tipografía, cartas jugadas, reglas/experimentos EN/ES y controles de audio. Activa un AudioContext real para la música. Las solicitudes de voz se interceptan para verificar texto, volumen y silencio; escuchar una voz instalada requiere un dispositivo que la tenga.

El workflow de GitHub reproduce Python, verificación de entrega y navegador. Su resultado remoto se informa separadamente del resultado local.

Estas pruebas no ejecutan el wrapper de Qollab ni prueban una nueva partida IonQ, disponibilidad de voces en cada sistema, multijugador por red o hosting público. [Registros históricos](docs/history/TESTING_0.2.0.md).
