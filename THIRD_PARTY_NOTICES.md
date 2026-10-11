# Autoría, dependencias y recursos

## Código y recursos propios

El código original del juego, reglas, compositor, música procedural, explicaciones y pruebas se distribuyen bajo MIT; ver [LICENSE](LICENSE). La música se genera con osciladores del navegador: no incorpora una grabación, una canción externa ni descargas de audio.

El autor aportó los diseños del menú, mesa y cartas, incluidos en `menu-art.js`, `table-data-*.js` y `cards-art.js`. Sus derechos están separados del código MIT. El fondo de mesa fue preparado con la herramienta de imágenes de OpenAI a partir del diseño aportado. No se atribuye al proyecto propiedad sobre todo recurso visual aportado.

## Esfera interactiva de Qollab

`bloch.js` adapta la visualización de [Interactive Bloch Sphere, de qollab](https://qollab.xyz/u/qollab/interactive-bloch-sphere), a partir de un export aportado anteriormente por el autor.

Se reutilizaron proyección de cámara, anillos/ejes con profundidad, flecha, guía al ecuador, giro y arrastre. Se agregaron integración con estados Qiskit, trayectorias unitarias por compuerta, marcadores, teclado, reducción de movimiento, gestión del canvas, colores por eje y animación en bucle para las lecciones. No se reutilizó su selección de compuertas ni muestreo. La atribución permanece visible en la aplicación y el código.

El export original y sus directorios de procedencia no están incluidos en este checkout. El registro anterior no incluía licencia explícita del ejemplo. El MIT del código propio no se aplica automáticamente a esas partes adaptadas.

## Dependencias

- Qiskit 2.5.2: Apache-2.0. Usado para circuitos, Statevector y mediciones.
- NumPy: BSD-3-Clause, con los avisos de sus distribuciones. Qiskit incorpora otras dependencias con sus propias licencias.
- Python y su biblioteca estándar: licencia de Python Software Foundation; no se redistribuye el intérprete.
- Playwright 1.57.0: Apache-2.0, utilizado para pruebas; Chromium conserva sus licencias. No forman parte del juego subido a Qollab.
- Las voces son proporcionadas por el navegador o sistema operativo bajo sus condiciones. No se incluye un modelo de voz ni se solicita una clave de un servicio de voz.

Los binarios de estas dependencias no se redistribuyen en el ZIP del juego. Deben conservarse los avisos de cada distribución al generar otro tipo de paquete.

Qollab e IonQ proporcionan su runtime y backend según sus términos. El proyecto no incluye credenciales; el modo local no utiliza IonQ.

## Asistencia y evidencias

OpenAI Codex asistió en código, documentación, pruebas y revisión hasta 0.2.1. En 0.2.2, Claude (Anthropic) asistió en el código, las traducciones, los tutoriales, las pruebas y la documentación. La herramienta de imágenes de OpenAI preparó el fondo mencionado. El video bajo `artifacts/` y su transcripción documentan una versión anterior; no representan una ejecución de 0.2.1.

Los avisos anteriores se conservan como [registro histórico](docs/history/THIRD_PARTY_NOTICES_0.2.0.md); no implican que los archivos o herramientas que citan estén presentes aquí.

This effort is supported by Qollab & IonQ.

## Música (0.2.2)

`music-data.js` contiene un tema de 66 segundos aportado por el equipo de Qriollo (archivo MP3 recodificado a 112 kbps y embebido en base64 para la entrega plana de Qollab). El origen y la licencia del tema los declara el equipo; reemplazá esta línea con el autor y la licencia antes de publicar.
