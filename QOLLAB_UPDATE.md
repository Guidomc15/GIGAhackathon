# Cargar Qriollo 0.2.4 en Qollab

`QOLLAB_0.2.4.zip` es una entrega plana: todos los archivos están en la raíz, sin carpetas. El proyecto de Qollab tiene que ser de tipo **JS / Qiskit**.

1. Detené la ejecución en Qollab.
2. Descargá `QOLLAB_0.2.4.zip` desde GitHub. Abrí el archivo y usá **Download raw file**, con tu sesión iniciada; el «Code → Download ZIP» general trae también las carpetas de desarrollo.
3. Descomprimilo en tu computadora. Qollab necesita los archivos sueltos, no el ZIP.
4. En **Code → Files**, cargá todos los archivos y reemplazá los que tengan el mismo nombre. Si alguno no se reemplaza al cargarlo, pegá su contenido desde el editor. Conservá un solo archivo de cada nombre.
5. Ejecutá el proyecto.
6. Comprobá la versión:
   - el pie de página dice **v0.2.4** y la consola del navegador muestra `[Qriollo] versión 0.2.4`;
   - en Files están `slides.js` y `home-art.js`, y `main.js` tiene unas 470 líneas.

   Si ves `menu-art.js` y un `main.js` de 406 líneas, Qollab sigue con archivos de una versión anterior. `menu-art.js`, `music-data.js` y `main.py` ya no se usan: borralos (`music-data.js` tenía una música sin licencia para redistribuir).

## Qué contiene

| Archivos | Para qué |
| --- | --- |
| `index.html`, `main.js`, `main.css` | Punto de entrada. `index.html` es solo el cuerpo: Qollab carga `main.js` y `main.css` con su wrapper |
| Los demás `.js` | Módulos de la interfaz, el arte, la mesa y las cartas |
| `qollab_engine.py` | El motor Python completo en un solo archivo. `main.js` lo importa con `import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';` |
| `requirements.txt` | Qiskit |
| `README.md` | Texto del proyecto, en inglés y en español: Qollab lo muestra como Project Card |
| `LICENSE`, `THIRD_PARTY_NOTICES.md`, `DEMO_SCRIPT.md`, este archivo | Licencia, avisos y guion de demostración |
| `truco-cuantico-demo.mp4`, `DEMO_TRANSCRIPT.txt` | Video histórico de una versión anterior, enlazado desde Créditos |

Errores frecuentes:
- **Error que menciona `truco.service`:** se está ejecutando un `main.js` viejo. Reemplazalo y comprobá que el import diga `qollab_engine`.
- **Import cambiado por `./local-engine.js`:** no lo cambies. Ese puente solo funciona con el servidor local.

## Medición en Qollab

El adaptador IonQ admite un job por ejecución, así que las partidas completas usan simulación local con Qiskit, indicada en la pantalla. El tutorial siempre mide con Qiskit local. Cada medición queda en el resumen de la mano y en la consola como `[Qriollo] Medición`.

El avance de los avisos empieza en manual. **Continuar** avanza un aviso, y ⏱ elige un avance automático de 1, 3 o 7 segundos.

## Volver a una versión anterior

Descargá el ZIP del tag correspondiente (por ejemplo, `QOLLAB_0.2.1.zip` desde `v0.2.1`) y reemplazá los archivos con los mismos pasos.
