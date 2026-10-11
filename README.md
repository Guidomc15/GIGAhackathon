# Qriollo · Truco Cuántico 0.2.2

Un juego para aprender computación cuántica jugando al Truco argentino. Dos personas comparten un dispositivo, preparan una carta cuántica y compiten hasta 15 puntos. El tutorial es una partida guiada de Truco contra Bot Q que explica cada parte de la pantalla; la carta cuántica se suma al tutorial en una próxima etapa.

**[English overview](docs/README.en.md)** · [Ejecutar localmente](RUNNING.md) · [Subir o actualizar Qollab](QOLLAB_UPDATE.md) · [Pruebas](TESTING.md) · [Cambios 0.2.1](CHANGELOG.md)

This effort is supported by Qollab & IonQ.

## Jugar

Con Python 3.12, desde la raíz del repositorio:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Abrí el puerto 8000 en el navegador de tu máquina. En Windows usá `.venv\Scripts\python.exe` en lugar de `.venv/bin/python`. No se necesitan claves ni base de datos. El servidor local usa Qiskit y permite partidas completas. [Más detalles](RUNNING.md).

Para Qollab, descomprimí **[QOLLAB_0.2.2.zip](QOLLAB_0.2.2.zip)** y cargá sus archivos como **JS / Qiskit**. Es una entrega sin carpetas, distinta del ZIP de todo el repositorio. **Esta actualización incluye varios módulos nuevos (`i18n.js`, `music-data.js`) y CSS: cambiar solamente `main.js` no alcanza.** [Instrucciones exactas](QOLLAB_UPDATE.md).

## Qué cambia en 0.2.2 (en curso)

- Interfaz completa en español e inglés. El idioma inicial sigue al navegador y se cambia en cualquier pantalla con 🌐. Truco, Envido, Quiero y los demás cantos conservan su nombre.
- Nivel **Aprendizaje** (compuertas ilimitadas) y nivel **Difícil** (solo 2 retiros de compuertas por jugador y por mano).
- El compositor se cierra con un único botón **Confirmar**.
- Los ejes de la esfera de Bloch tienen color propio (X coral, Y violeta, Z celeste) y las letras X, Y, Z de las explicaciones usan ese mismo color.
- Música nueva: tema aportado por el equipo, en bucle.
- Se quitaron el ruido cuántico educativo y la rotación π/67.
- Tutorial de Truco contra Bot Q, en partida guiada.

## Variante de Truco

Dos jugadores, a 15 puntos y sin Flor. El Envido compara los tantos; el Truco aumenta el valor de ganar la mano. Falta Envido vale **15 menos el puntaje de quien va adelante**; por ejemplo, 9–6 concede 6 puntos a quien gane. Se reparten seis parejas de cartas distintas para evitar duplicados después de un cambio de palo. Original y ligada siempre conservan el número. Las reglas completas y los empates se explican dentro del juego.

## Código y entrega

| Archivo o carpeta | Función |
| --- | --- |
| `truco/` | Reglas, estado de partida, Qiskit, niveles, textos en inglés del motor, guion del tutorial y API de sesión |
| `main.js`, `ui.js`, `main.css` | Interfaz y controles |
| `presentation.js`, `preferences.js`, `sound.js`, `music-data.js` | Avisos, ajustes, música y voces |
| `learning.js`, `i18n.js` | Reglas bilingües, idioma de la interfaz y colores de los ejes |
| `serve.py`, `local-engine.js` | Servidor y puente HTTP de desarrollo local |
| `qollab_engine.py` | Motor generado en un archivo para Qollab; no editar a mano |
| `build_qollab.py` | Regenera el motor y el ZIP plano; verifica que coincidan con las fuentes |
| `tests/`, `.github/workflows/` | Pruebas reproducibles y validación continua |
| `docs/history/` | Registros anteriores; no describen la versión actual |

Tras modificar `truco/*.py` o archivos incluidos en la entrega:

```sh
python build_qollab.py --zip QOLLAB_0.2.2.zip
python build_qollab.py --check --verify-zip QOLLAB_0.2.2.zip
.venv/bin/python -m unittest discover -s tests -v
```

## Versiones y recuperación

**`v0.2.0`** conserva el código y ZIP anteriores, en el commit `5a96b4f`. La versión nueva es **`v0.2.1`**. [Cómo volver a la versión anterior sin borrar el historial](docs/ROLLBACK.md).

**`v0.1.9`** conserva el contenido anterior de `main`, en `6576cce`. `main` incorpora ahora los cambios de 0.2.0 y 0.2.1; las ramas y tags anteriores siguen disponibles.

La partida y preferencias viven en memoria o en el navegador. La partida se pierde al detener el servidor o la ejecución de Qollab. El proyecto no tiene multijugador por red.

La versión se valida con Qiskit y Chromium locales. Su arranque dentro del wrapper de Qollab se comprueba allí. El adaptador remoto conserva el límite observado de un job IonQ por ejecución, por lo que las partidas completas usan simulación local explícita. No se cambia de backend automáticamente.

Código original MIT; arte, esfera adaptada, dependencias y asistencia de IA declarados en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Colaboradores: Guido Miniero Cocco, Alejo Dellape y Gaspar Osterrieth
