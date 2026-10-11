# Qriollo · Truco Cuántico 0.2.3

**Una forma bien argenta de aprender computación cuántica.** Qriollo es el Truco argentino con una carta cuántica: cada jugador convierte una de sus cartas en un qubit, la transforma con compuertas y la mide al jugarla. Qiskit calcula los estados, las trayectorias en la esfera de Bloch y las mediciones.

La interfaz está completa en **español e inglés** (🌐 en cualquier pantalla). Truco, Envido, Quiero y los demás cantos conservan su nombre.

**[English overview](docs/README.en.md)** · [Cargar en Qollab](QOLLAB_UPDATE.md) · [Pruebas](TESTING.md) · [Cambios](CHANGELOG.md) · [Avisos y licencias](THIRD_PARTY_NOTICES.md)

This effort is supported by Qollab & IonQ.

## Qué se puede hacer

| Desde el inicio | Qué es |
| --- | --- |
| **Tutorial** | 17 diapositivas interactivas con las reglas y la carta cuántica, una práctica de cuatro manos contra Bot Q y nueve lecciones de compuertas y esfera de Bloch. |
| **Partida rápida** | Dos personas en un mismo dispositivo, nombres por defecto, nivel Aprendizaje y simulación local con Qiskit. |
| **Partida personalizada** | Nombres, nivel (Aprendizaje o Difícil) y modo con privacidad, que oculta la mano al pasar el dispositivo. |
| **Ayuda rápida** | La escala ilustrada de las 40 cartas, cómo se cuentan los tantos y cómo cuenta la carta cuántica. |
| **Cómo jugar** y **Créditos** | Reglas completas por secciones, autores, recursos y avisos. |

## El juego

Variante para **dos jugadores, a 15 puntos y sin Flor**. Se juega con la baraja española de 40 cartas. Cada mano se gana con dos de tres bazas y vale 1 punto, o 2, 3 o 4 con Truco, Retruco y Vale Cuatro. El Envido se juega aparte con los tantos: Envido 2, Real Envido 3 y Falta Envido, que vale lo que le falta a quien va adelante para llegar a 15. Se reparten seis parejas de cartas distintas, así ningún cambio de palo produce cartas repetidas.

### La carta cuántica

1. Al empezar cada mano, cada jugador elige una de sus tres cartas: pasa a ser un **qubit**.
2. La carta tiene dos identidades: la **original** (estado |0⟩) y la **ligada** (estado |1⟩), con el mismo número y el palo pareja: **basto ↔ oro** y **copa ↔ espada**. Así, un 7 de copa débil puede convertirse en el 7 de espada, una brava.
3. Con hasta **tres fichas** de compuertas, en el orden que quieras, cambiás las probabilidades. En el nivel Difícil solo se pueden sacar compuertas dos veces por mano.
4. Al tocar **Confirmar**, el circuito queda fijo. La carta se **mide una sola vez**, al jugarla o al aceptar un Envido, y desde ahí su identidad, su fuerza y sus tantos no cambian.

Cada jugador recibe 4 fichas por mano de un mazo de 41: **H, Z, RX, RY y RZ** con 8 fichas cada una (cerca de 20 % por familia; las rotaciones tienen ángulos fijos de 30°, −30°, 60° y 90°) y una sola **X** (2,4 %). No hay entrelazamiento ni ventaja cuántica: son dos qubits independientes, uno por jugador.

### Ver la medición

- **Resumen de la mano** → «Ampliar tus detalles» → «Registro de la medición»: muestra el backend, las compuertas, el resultado y el método. Por ejemplo, `Qiskit Statevector.sample_memory(1)` en local; en IonQ incluye el `job_id` y la distribución devuelta.
- **Consola del navegador**: cada medición aparece como `[Qriollo] Medición · mano 4 · Vos: |1⟩ → 7 de espada`, con el mismo registro. Al arrancar, la consola también muestra la versión.

En local y en el tutorial, Qiskit simula la medición con la regla de Born. En Qollab, el adaptador IonQ envía el circuito con 1 shot; el límite observado es un job por ejecución, por eso las partidas completas usan simulación local explícita.

## Tutorial

1. **Diapositivas (17).** Reglas, palos, escala por niveles, un duelo de bazas, dos manos de ejemplo, Truco/Retruco/Vale Cuatro (cantar y responder), cómo termina la mano, cinco de Envido y dos de la carta cuántica (qué es y los palos ligados). Tienen glosario tocable y partes interactivas.
2. **Práctica con Bot Q** (cuatro manos, 33 pasos).
   - 6 desafíos: quedan habilitadas todas las jugadas válidas; una incorrecta no se hace y Bot Q da una pista.
   - 6 preguntas rápidas.
   - La cuarta mano, con la carta cuántica, es guiada.
   - Bot Q le habla al jugador en segunda persona; el tutorial siempre mide con Qiskit local.
3. **Compuertas y esfera de Bloch.** Nueve lecciones con esfera animada, analogías del juego y porcentajes calculados por Qiskit. La esfera rotula sus seis polos (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩) y cada eje tiene su color: X coral, Y violeta, Z celeste.

## Ejecutar localmente

Con Python 3.12 o posterior, desde la raíz del repositorio:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Abrí `http://127.0.0.1:8000`. En Windows usá `.venv\Scripts\python.exe`; para otro puerto, `serve.py --port 8001`.

- **Configuración:** no se necesitan claves ni base de datos.
- **Sesiones:** cada navegador guarda su sesión en una cookie, y las partidas viven en memoria hasta detener el servidor.
- **Red:** el servidor escucha solo en la propia computadora.
- **Servidor necesario:** un servidor de archivos estáticos no alcanza, porque el motor es Python.

## Cargar en Qollab

Usá **[QOLLAB_0.2.3.zip](QOLLAB_0.2.3.zip)**, una entrega plana para un proyecto **JS / Qiskit**.

1. Descomprimilo en tu computadora.
2. Cargá **todos sus archivos** en Code → Files, reemplazando los que tengan el mismo nombre.
3. Ejecutá el proyecto.
4. Comprobá que el pie de página diga **v0.2.3**.

Los pasos completos y cómo detectar archivos viejos están en [QOLLAB_UPDATE.md](QOLLAB_UPDATE.md).

## Código

| Archivo o carpeta | Función |
| --- | --- |
| `truco/` | Motor en Python: reglas (`classic.py`, `game.py`), carta cuántica con Qiskit (`quantum.py`, `gates.py`), adaptador IonQ (`remote.py`), sesión y API (`service.py`), guion del tutorial y lecciones (`tutorial.py`), textos en inglés (`i18n.py`) |
| `main.js`, `ui.js`, `main.css`, `index.html` | Interfaz, pantallas y estilos |
| `slides.js` | Diapositivas del tutorial y escala de la Ayuda rápida |
| `learning.js`, `i18n.js`, `phrases.js` | Reglas bilingües, idioma, colores de los ejes y cantos |
| `bloch.js`, `card-effects.js`, `gates.js`, `gate-colors.js` | Esfera de Bloch, efectos de cartas y fichas |
| `presentation.js`, `preferences.js`, `sound.js` | Avisos animados, ajustes y voces de los cantos |
| `config.js` | Versión y enlace al repositorio |
| `*-art.js`, `table-data-*.js` | Arte, mesa y cartas embebidos |
| `serve.py`, `local-engine.js` | Servidor y puente HTTP de desarrollo local |
| `qollab_engine.py` | Motor generado en un solo archivo para Qollab; no se edita a mano |
| `build_qollab.py` | Regenera `qollab_engine.py` y el ZIP, y verifica que coincidan con las fuentes |
| `tests/`, `.github/workflows/` | Pruebas Python y de navegador, e integración continua |
| `artifacts/` | Video histórico de una versión anterior, enlazado desde Créditos |

Después de cambiar `truco/*.py` o cualquier archivo de la entrega:

```sh
python build_qollab.py --zip QOLLAB_0.2.3.zip
python build_qollab.py --check --verify-zip QOLLAB_0.2.3.zip
```

## Pruebas

```sh
.venv/bin/python -m unittest discover -s tests -v   # 49 pruebas
```

Con `serve.py` en marcha y Playwright instalado, seis pruebas de navegador recorren:
- la interfaz, en celular y escritorio;
- partidas completas, con y sin privacidad;
- las animaciones, los idiomas y los niveles;
- las 17 diapositivas;
- la práctica completa en los dos idiomas.

El detalle y los comandos están en [TESTING.md](TESTING.md). El mismo conjunto corre en GitHub Actions.

## Versiones

Cada entrega tiene su tag. `v0.2.1` y anteriores ya están publicados, y `v0.2.2` y `v0.2.3` marcan las dos últimas. Para revisar una versión anterior:

```sh
git fetch origin --tags
git switch --detach v0.2.1
```

## Límites conocidos

- **Sin red:** no hay multijugador por red; las dos personas comparten el dispositivo.
- **Sin guardado:** las partidas no se guardan entre reinicios del servidor ni entre ejecuciones de Qollab.
- **IonQ:** en Qollab, el adaptador IonQ admite un solo job por ejecución.
- **Voces:** las voces de los cantos dependen del navegador.

## Créditos

Guido Miniero Cocco, Alejo Dellape y Gaspar Osterrieth.

- **Licencia:** el código original es MIT ([LICENSE](LICENSE)).
- **Recursos aportados:** el arte y el logo los aportó el equipo. El juego no tiene música; los cantos se leen con las voces del navegador.
- **Esfera de Bloch:** adapta [Interactive Bloch Sphere](https://qollab.xyz/u/qollab/interactive-bloch-sphere) de Qollab.
- **Asistencia de IA:** el código y la documentación tuvieron asistencia de OpenAI Codex y Claude (Anthropic).

El detalle está en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
