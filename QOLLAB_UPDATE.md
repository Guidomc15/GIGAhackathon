# Actualizar desde la lista Code de Qollab

El servidor local `serve.py` y el motor `truco/service.py` son archivos
distintos. Subir únicamente los archivos sueltos de un ZIP de GitHub omite
las carpetas, incluido el motor Python. Eso puede dejar el import
`truco.service` sin resolver antes de que arranque el juego.

La entrega actual usa **qollab_engine.py**, un único archivo Python en la raíz
que contiene los mismos módulos del juego. `main.js` lo importa con nombres
explícitos. Las carpetas `truco/` y `tests/` siguen siendo las fuentes de desarrollo;
no hacen falta para esta subida del juego a Qollab.

1. Detené la ejecución actual de Qollab.
2. Para actualizar la versión que ya tiene la interfaz, reemplazá el contenido
   del archivo **main.js** desde el editor de Code con el `main.js` actualizado.
   No agregues un segundo archivo con el mismo nombre.
3. Agregá un archivo **qollab_engine.py** en esa misma lista de Code y cargá su
   contenido desde la entrega. Debe estar al mismo nivel que `main.js` y
   `index.html`, con ese nombre exacto.
4. Conservá los demás archivos del juego. No borres nuevamente el proyecto.
5. Ejecutá como **JS / Qiskit**. La primera importación Python ahora debe ser
   `import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';`.

Si subís el juego completo, descomprimí el ZIP plano generado por
`python build_qollab.py --zip QOLLAB_0.2.0.zip` y seleccioná sus archivos.
Todos están en la raíz: no hay carpetas que el selector de archivos pueda omitir.
`index.html` contiene solamente el cuerpo; Qollab carga `main.js` y `main.css`.

Esta entrega se prueba con Python sin la carpeta `truco/`, y con Chromium local.
Las pruebas locales no ejecutan el wrapper de Qollab. El primer arranque en
esa plataforma todavía requiere confirmación del usuario.
