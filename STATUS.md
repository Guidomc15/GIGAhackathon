# Estado de 0.2.3

La entrega de código es **0.2.3**, en `main`. El paquete para Qollab es `QOLLAB_0.2.3.zip`; publicar código en GitHub no actualiza una ejecución existente de Qollab.

Validación local: Python 3.13.16, Qiskit 2.5.2 y Chromium 138 (49 pruebas Python y 5 pruebas de navegador). El workflow de GitHub usa Python 3.12. [Pruebas y alcance](TESTING.md). El arranque de 0.2.2 dentro del wrapper de Qollab se comprueba en la plataforma.

La simulación local permite partidas completas en los dos niveles. El tutorial mide siempre con Qiskit local. El adaptador IonQ conserva el límite observado de un job por ejecución. La disponibilidad de voces depende del navegador.

`v0.2.1` (`c7ef21d`) conserva la versión anterior. [Recuperación](docs/ROLLBACK.md). Las partidas en memoria no sobreviven a reinicios.
