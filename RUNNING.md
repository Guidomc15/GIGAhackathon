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

Elegí el tipo de proyecto **JS / Qiskit**. Usá la entrega plana
`QOLLAB_0.2.1.zip`: descomprimila y cargá sus archivos en la lista Code.
Incluye la interfaz, los módulos JavaScript, `qollab_engine.py`, requisitos,
avisos de licencia y el video histórico. Todos están en la raíz.
Para actualizar, reemplazá los archivos incluidos y agregá los nuevos módulos.
No alcanza con cambiar solo `main.js` en 0.2.1. Pasos en
[QOLLAB_UPDATE.md](QOLLAB_UPDATE.md).

`serve.py` es el servidor local, distinto del módulo Python `truco/service.py`.
Subir solamente los archivos sueltos del ZIP de GitHub puede omitir la carpeta
`truco/` y dejar `truco.service` sin resolver. Ahora `main.js` importa funciones
explícitas desde `qollab_engine`, un archivo generado que contiene los mismos
módulos Python. No necesita subir carpetas. `main.py` es una prueba de backend;
no reemplaza el punto de entrada del juego en JavaScript.

`index.html` contiene únicamente el contenido del cuerpo, sin `<html>`,
`<head>`, `<body>` ni etiquetas para cargar `main.js` o `main.css`.
Qollab carga esos archivos automáticamente mediante su wrapper. El import
Python del juego es `import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';`.

Si todavía aparece un error que menciona `truco.service`, se está ejecutando
un `main.js` anterior. Detené la ejecución, reemplazá ese archivo y comprobá
que el import diga `qollab_engine`. No cambies ese import por `./local-engine.js`:
ese puente necesita el servidor HTTP local y no proporciona Python en Qollab.

Solo `serve.py` agrega el documento HTML, los recursos y el import map local.
Las pruebas comprueban el archivo Python aislado, sin la carpeta `truco/`, y
la interfaz en Chromium local. La ejecución dentro del wrapper de Qollab
queda por confirmar en la plataforma.

Después de editar el motor en `truco/*.py`, regenerá la entrega:

```sh
python build_qollab.py --zip QOLLAB_0.2.1.zip
python build_qollab.py --check --verify-zip QOLLAB_0.2.1.zip
```
