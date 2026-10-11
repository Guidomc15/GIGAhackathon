# Actualizar Qollab a 0.2.1

Esta versión cambia la interfaz, CSS, el motor y agrega módulos de audio y lectura. **No alcanza con reemplazar solamente `main.js`.** La actualización de dos archivos era para el arreglo de importación de 0.2.0.

1. Detené la ejecución de Qollab.
2. En GitHub, abrí `QOLLAB_0.2.2.zip` de la versión actual y usá **Download raw file**, con tu sesión iniciada. Si el enlace directo devuelve 404, accedé desde la página del archivo en GitHub. El ZIP general de «Code → Download ZIP» contiene también carpetas de desarrollo.
3. Descomprimí `QOLLAB_0.2.2.zip` en tu computadora. Todos los archivos están en una sola lista, sin carpetas.
4. En **Code**, reemplazá los archivos que tengan el mismo nombre y agregá los nuevos. Conservá un solo archivo de cada nombre. Si no podés reemplazar mediante carga, reemplazá todo su contenido desde el editor.
5. Elegí **JS / Qiskit** y ejecutá.
6. En Inicio revisá música, voces y el idioma. Para jugar con ruido, elegí simulación local con Qiskit al iniciar y dejá marcada la opción de ruido educativo.

Los nuevos módulos son `preferences.js`, `presentation.js`, `sound.js` y `learning.js`. También necesitás los demás JavaScript del ZIP, `main.css`, `index.html`, `qollab_engine.py` y los recursos incluidos. El video y la transcripción son evidencia histórica opcional; no explican la interfaz nueva.

`serve.py` es el servidor local. El juego de Qollab importa `qollab_engine.py`, que contiene el motor de `truco/` sin necesidad de subir esa carpeta. Su import en `main.js` es:

```js
import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';
```

`index.html` es solo el cuerpo. Qollab carga `main.js` y `main.css` con su wrapper. No agregues un `<script>` que cargue `main.js` manualmente ni cambies el import Python por `local-engine.js`, que requiere el servidor local.

El avance de los avisos empieza en manual. Usá **Skip · Continuar** o ⏱ para seleccionar 1, 3 o 7 segundos y luego volver a manual. Si el navegador conserva una elección anterior, el botón muestra ese valor.

La entrega se prueba sin la carpeta `truco/` y en Chromium local. Eso no ejecuta el wrapper de Qollab: el primer arranque de 0.2.1 en esa plataforma aún debe verificarse allí.

Para volver a la entrega anterior, descargá `QOLLAB_0.2.0.zip` desde el tag `v0.2.0` y reemplazá sus archivos después de detener la ejecución. [Recuperación](docs/ROLLBACK.md).
