# Autoría, dependencias y recursos

## Código propio

El código original del juego, las reglas, el compositor de circuitos, los tutoriales, las explicaciones y las pruebas se distribuyen bajo MIT; ver [LICENSE](LICENSE).

## Recursos aportados por el equipo

Los derechos de estos recursos están separados del código MIT:

- **Mesa y cartas:** el equipo aportó los diseños que están en `table-data-*.js` y `cards-art.js`. En el 2 de espada se agregó la segunda espada y en el 12 de espada el rey sostiene una espada en lugar del cetro. El fondo de la mesa se preparó con la herramienta de imágenes de OpenAI a partir del diseño aportado.
- **Inicio:** `home-art.js` contiene el logo de Qriollo (WebP con fondo transparente) y la carta Q, recortada del arte de menú aportado.

## Esfera interactiva de Qollab

`bloch.js` adapta la visualización de [Interactive Bloch Sphere, de Qollab](https://qollab.xyz/u/qollab/interactive-bloch-sphere), a partir de un export aportado por el equipo.

- **Reutilizado:** la proyección de cámara, los anillos y ejes con profundidad, la flecha, la guía al ecuador, el giro y el arrastre.
- **Agregado:** integración con estados de Qiskit, trayectorias por compuerta, marcadores, teclado, reducción de movimiento, colores por eje, los seis polos rotulados y la animación en bucle de las lecciones.
- **No reutilizado:** su selección de compuertas ni su muestreo.

La atribución está visible en la aplicación y en el código. El ejemplo original no incluía una licencia explícita, así que el MIT del código propio no se aplica automáticamente a las partes adaptadas.

## Dependencias

- Qiskit 2.5.2: Apache-2.0. Se usa para los circuitos, Statevector y las mediciones.
- NumPy: BSD-3-Clause. Qiskit incorpora otras dependencias con sus propias licencias.
- Python y su biblioteca estándar: licencia de la Python Software Foundation. No se redistribuye el intérprete.
- Playwright 1.57.0: Apache-2.0. Solo se usa en las pruebas; Chromium conserva sus licencias. Ninguno de los dos forma parte del juego subido a Qollab.
- Las voces de los cantos las proporciona el navegador o el sistema operativo, bajo sus propias condiciones. No se incluye un modelo de voz ni se pide una clave de un servicio de voz.

Los binarios de estas dependencias no se redistribuyen en el ZIP del juego.

Qollab e IonQ proporcionan su runtime y su backend según sus propios términos. El proyecto no incluye credenciales, y el modo local no usa IonQ.

## Asistencia de IA y video

OpenAI Codex asistió en el código, la documentación, las pruebas y la revisión hasta 0.2.1. Desde 0.2.2, Claude (Anthropic) asistió en el código, las traducciones, los tutoriales, las pruebas y la documentación.

El video de `artifacts/` y su transcripción documentan una versión anterior del juego.

This effort is supported by Qollab & IonQ.
