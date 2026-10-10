# Estado de 0.2.1

La entrega de código es **0.2.1**, en `main`, el tag `v0.2.1` y la rama de trabajo `codex/0.2.1`. El paquete para Qollab es `QOLLAB_0.2.1.zip`; publicar código en GitHub no actualiza una ejecución existente de Qollab.

El motor y la interfaz se validan localmente con Python 3.12.14, Qiskit 2.5.2 y Chromium. [Pruebas y alcance](TESTING.md). El arranque de 0.2.1 dentro del wrapper de Qollab no se ha verificado desde este entorno. No se enviaron mediciones IonQ durante esta actualización.

La simulación local permite partidas completas, Bot Q y ruido educativo. El adaptador IonQ conserva el límite previamente observado de un job por ejecución y no recibe el ruido didáctico local. La disponibilidad de voces depende del navegador y sus voces instaladas.

`v0.2.0` protege la entrega plana anterior en `5a96b4f`; `v0.1.9` protege el contenido que tenía `main` en `6576cce`. [Recuperación](docs/ROLLBACK.md). Las partidas en memoria no sobreviven a reinicios.

Los registros de publicaciones y pruebas anteriores se conservan en [docs/history/](docs/history/); sus cifras y capturas no acreditan pruebas de 0.2.1.
