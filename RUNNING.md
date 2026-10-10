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

## Ejecutar en Qollab

Elegí el tipo de proyecto **JS / Qiskit**. Subí `main.js`, `main.css`,
`index.html`, todos los módulos JavaScript y la carpeta `truco/` completa,
incluidos `__init__.py`, `service.py` y `gates.py`. Conservá también
`requirements.txt` y los recursos del proyecto. El archivo `main.py` es una
prueba de backend; no reemplaza el punto de entrada del juego en JavaScript.

`index.html` contiene únicamente el contenido del cuerpo, sin `<html>`,
`<head>`, `<body>` ni etiquetas para cargar `main.js` o `main.css`.
Qollab carga esos archivos automáticamente mediante su wrapper, que resuelve
`import * as engine from 'truco.service'` como un módulo Python.

El error `Failed to resolve module specifier 'truco.service'` indica que el
import fue tratado como JavaScript nativo. Revisá el tipo JS / Qiskit, la
presencia de la carpeta Python y que no se cargue `main.js` con un `<script>`
manual en `index.html`. No cambies ese import por `./local-engine.js`:
ese puente necesita el servidor HTTP local y no proporciona Python en Qollab.

Solo `serve.py` agrega el documento HTML, los recursos y el import map local.
Las pruebas de navegador locales verifican ese camino; la ejecución de esta
corrección dentro del runtime de Qollab queda por confirmar en la plataforma.
