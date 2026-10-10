# Propuesta 0.2.0

Parte de GitHub 0.1.9 (`6576cce`). Integra los arreglos locales que todavía no estaban publicados.

- Compositor con original y ligada del mismo tamaño, nombres completos y probabilidades grandes.
- Opción «Jugar con privacidad», desactivada por defecto. Turnos con cartas boca abajo y giro de revelación en ambos modos.
- Globos de cantos y frases en `phrases.js`. Envido calculado y declarado automáticamente: aceptación y tantos reales, «son buenas», «son mejores» o desempate de mano.
- Cartas visibles al aceptar/rechazar/aumentar Truco o Envido; no jugables durante la respuesta.
- Mazo de 40 fichas: H×6, X×1, Z×3 y dos de cada RX/RY/RZ con π/2, π/6, −π/6, π/3 y π/67.
- Puntos animados para ambos jugadores, mayor incremento arriba. El marcador se limita a 15; si el premio lo supera, la animación muestra el incremento efectivo e informa el valor del canto.
- Medición pública con identidad definitiva antes del resultado. Victoria/derrota antes de «Ver resumen». Resumen público de ambos, tres cartas, circuito y detalles ampliables.
- Servidor local Qiskit, pruebas del motor/API/errores y pruebas reales en Chromium.
- Entrega plana `QOLLAB_0.2.0.zip` y motor `qollab_engine.py` para evitar que la lista Code omita la carpeta Python. Actualización de dos archivos documentada en `QOLLAB_UPDATE.md`.

Se usó 0.2.0 por el título «cambios para la 0.2.0». π/67 se conserva literalmente. Ambas aclaraciones fueron consultadas y todavía no recibieron respuesta. Las reglas de Falta Envido de esta variante (15 menos el puntaje del perdedor) se mantienen documentadas en Cómo jugar.

Validación: 37 pruebas Python, incluyendo el motor de la entrega sin carpeta `truco/`, partidas completas en Chromium con y sin privacidad, interfaz móvil a 320/390 píxeles, Bot Q, recuperación de errores y orden de animaciones con movimiento normal. No se enviaron jobs IonQ. El wrapper de Qollab no se ejecuta en las pruebas locales.

Estado: implementación y entrega para Qollab publicadas en la rama GitHub [`codex/0.2.0-polish`](https://github.com/Guidomc15/GIGAhackaton/tree/codex/0.2.0-polish). `main` sigue en 0.1.9 hasta integrar los cambios. La API de GitHub devuelve Forbidden al crear el PR; no se publicó en Qollab. [Abrir la propuesta de integración](https://github.com/Guidomc15/GIGAhackaton/pull/new/codex/0.2.0-polish). Publicar un entorno, subir una rama e integrar en main son pasos distintos.
