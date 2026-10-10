# Desarrollo local

Con Python 3.12, desde la raíz del repositorio:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Abrí el navegador en el puerto local 8000. Para cambiarlo, usá `serve.py --port 8001`.
El servidor usa Qiskit Statevector y muestra explícitamente el modo de desarrollo
local, sin IonQ. Permite el tutorial, Bot Q y partidas de dos personas compartiendo
el dispositivo. No necesita claves ni base de datos.

Cada navegador conserva su sesión en una cookie; las pestañas del mismo navegador
comparten la partida. Las sesiones viven en memoria y se pierden al detener el
servidor con Ctrl+C. Para una partida independiente, usá otro perfil del navegador.

El servidor escucha solamente en loopback. Serví los archivos con `serve.py`:
un servidor de archivos estáticos no proporciona el motor Python.

Para verificar reglas, partidas, Qiskit, sesiones HTTP y recuperación de errores:

```sh
.venv/bin/python -m unittest discover -s tests -v
```

La versión Qollab conserva su importación `truco.service` y su backend inyectado.
Solo el servidor local agrega un import map que conecta esa importación con
`local-engine.js`. No se realizan trabajos IonQ en el servidor local.
