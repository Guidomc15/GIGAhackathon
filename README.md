# Qriollo · Quantum Truco 0.2.4

**A truly Argentine way to learn quantum computing.**

*Versión en español más abajo.*

This effort is supported by Qollab & IonQ.

## What is it?

Qriollo is **Truco**, the most popular card game in Argentina, with one extra card: a **quantum card**. At the start of every hand, each player turns one of their three cards into a **qubit**, transforms it with quantum gates and measures it when the card is played. The measurement decides which card it really is, and that changes who wins the trick and the hand.

It runs in the browser, in English and Spanish, for two people sharing one device. It includes:
- **A full tutorial** with three parts:
  - 17 interactive slides on the rules and the quantum card;
  - a four-hand practice against **Bot Q**;
  - nine lessons on gates and the Bloch sphere.
- **Quick and custom games**: two levels (Learning and Hard) and an optional privacy mode that hides your hand when the device is passed.
- **Quick help** with the illustrated strength ladder of all 40 cards.

## Why does it matter, and who is it for?

Quantum computing is usually taught with abstract notation, before anyone has a reason to care about it. Qriollo turns the core ideas into **decisions with consequences inside a game people already know**:

- **Superposition:** your card is 50 % the 7 of cups and 50 % the 7 of swords.
- **Gates as rotations:** H, X, Z, RX, RY and RZ move an arrow on the Bloch sphere.
- **Phase:** Z changes nothing today, but it changes what a later H does.
- **Measurement and collapse:** once measured, the card stays fixed.

You learn them because they decide whether you win the hand.

It is aimed at:
- **secondary and university students** taking their first steps in quantum computing;
- **teachers** who want a hands-on classroom activity;
- **anyone in Latin America and Spain** who already plays Truco or wants to learn it.

No prior physics or programming is needed: the tutorial starts from the card rules and builds up to gates, phase and measurement.

## How does the quantum part work?

1. **One qubit per player.** At the start of each hand, each player picks one card. That card becomes a qubit with two possible identities:
   - **|0⟩**: the original card;
   - **|1⟩**: its **linked** card, which keeps the number and swaps to the partner suit: **clubs ↔ coins** and **cups ↔ swords**.

   For example, a weak 7 of cups (row 11 of 14 on the ladder) can become the 7 of swords (row 3).
2. **Gates.** Each player receives 4 gate tokens per hand from a 41-token deck: **H, Z, RX, RY and RZ**, 8 tokens each, and a single rare **X**. Rotations have fixed angles of 30°, −30°, 60° and 90°. Players place up to three tokens, in any order, and press **Confirm**. On the Hard level each player may remove a gate only twice per hand.
3. **Qiskit.** For each circuit, Qiskit builds a one-qubit `QuantumCircuit` and computes the `Statevector` after every gate. The game shows:
   - the exact probabilities of both identities;
   - the path of the state on an interactive Bloch sphere. The sphere labels its six poles (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩), and each axis has its own colour.
4. **Measurement.** The card is measured **once**, when it is played or when an Envido bet is accepted. It collapses to |0⟩ or |1⟩ with the Born-rule probabilities and keeps that identity, strength and envido points for the rest of the hand.
   - **Where it is measured:** in the tutorial and in Quick game, Qiskit samples the final `Statevector` with `sample_memory(1)`, both locally and in Qollab's Python runtime. A custom game can instead send the circuit, with 1 shot, to the backend selected in Qollab (the free built-in simulator by default). Qollab allows one such job per run, so full games use the local sampler.
   - **Where to check it:** each measurement record (backend, gates, result and method) appears in the hand summary and in the browser console as `[Qriollo] Medición`.

The two qubits are independent: there is no entanglement and no claim of quantum advantage. The point is to make one qubit tangible.

## How do I run it?

### On Qollab

1. Open the Qriollo project on Qollab and press **Run**. The project runs as **JS / Qiskit** on Qollab's free built-in simulator, with no key or account setup.
2. On the home screen, pick a language with 🌐.
3. Start with **Tutorial → Truco with Bot Q**, or go straight to **Quick game**.

The footer shows the running version (**v0.2.4**).

### Locally

You need Python 3.12 or later. From the repository root:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Then open `http://127.0.0.1:8000`.
- **Windows:** use `.venv\Scripts\python.exe`.
- **Another port:** use `serve.py --port 8001`.
- No keys or database are needed.

## What results to expect

- **Slides:**
  - you play out tricks and count envido points;
  - on the quantum card slide you press **H** and see 50 % / 50 %, then press **Measure** and watch the card collapse;
  - with **X** the linked card comes out 100 % of the time.
- **Practice with Bot Q:**
  - challenges where a wrong move is not played and Bot Q explains why;
  - quick questions;
  - a final quantum hand where X turns your weak 7 of cups into the 7 of swords and wins the trick.
- **Gate lessons:** each gate animates on the Bloch sphere with its Qiskit probabilities. For example, H·Z·H gives the linked card with 100 %, because Z's phase becomes visible after the second H.
- **A full game:** two players race to 15 points. Each hand ends with a summary of every trick and every measurement record, and the console logs each collapse.

## Rules variant

Two players, 15 points, no Flor, Spanish 40-card deck.
- **Tricks:** a hand is won with two of three tricks (bazas).
- **Truco:** the hand is worth 1 point, or 2, 3 or 4 with Truco, Retruco and Vale Cuatro.
- **Envido:** a separate bet on card points:
  - Envido 2;
  - Real Envido 3;
  - Falta Envido, worth what the leader needs to reach 15.
- **Call names:** Truco, Envido, Quiero and the other calls keep their Spanish names in both languages.

## Project structure

| Path | Purpose |
| --- | --- |
| `truco/` | Python engine: rules, quantum card with Qiskit, IonQ adapter, session API, tutorial script and English engine texts |
| `main.js`, `ui.js`, `slides.js`, `main.css`, `index.html` | Interface, tutorial slides and styles |
| `bloch.js` | Interactive Bloch sphere, adapted from Qollab's Interactive Bloch Sphere |
| `qollab_engine.py` | The whole engine in one file for Qollab, generated by `build_qollab.py` |
| `serve.py`, `local-engine.js` | Local development server |
| `tests/` | 49 Python tests and six Playwright browser suites, also run on GitHub Actions |

## Credits and licence

By **Guido Miniero Cocco, Alejo Dellape and Gaspar Osterrieth**.

- **Licence:** the original code is released under the **MIT licence** (see `LICENSE`).
- **Contributed assets:** the table, cards and logo artwork were contributed by the team.
- **Bloch sphere:** adapted from Qollab's [Interactive Bloch Sphere](https://qollab.xyz/u/qollab/interactive-bloch-sphere).
- **AI assistance:** development was assisted by OpenAI Codex and Claude (Anthropic).
- **Sound:** the game has no music. Calls are read aloud with the voices available in the browser.

Full notices are in `THIRD_PARTY_NOTICES.md`.

---

# Qriollo · Truco Cuántico 0.2.4 (español)

**Una forma bien argenta de aprender computación cuántica.**

## ¿Qué es?

Qriollo es el **Truco** argentino con una carta más: la **carta cuántica**. Al empezar cada mano, cada jugador convierte una de sus tres cartas en un **qubit**, la transforma con compuertas cuánticas y la mide al jugarla. La medición decide qué carta es en realidad, y eso cambia quién gana la baza y la mano.

Se juega en el navegador, en español e inglés, entre dos personas que comparten un dispositivo. Incluye:
- **Un tutorial completo** en tres partes:
  - 17 diapositivas interactivas con las reglas y la carta cuántica;
  - una práctica de cuatro manos contra **Bot Q**;
  - nueve lecciones de compuertas y esfera de Bloch.
- **Partidas rápidas y personalizadas:** dos niveles (Aprendizaje y Difícil) y un modo con privacidad opcional, que oculta tu mano al pasar el dispositivo.
- **Ayuda rápida** con la escala ilustrada de las 40 cartas.

## ¿Por qué es importante y para quién es?

La computación cuántica suele enseñarse con notación abstracta, antes de que haya una razón para que importe. Qriollo convierte las ideas centrales en **decisiones con consecuencias dentro de un juego que la gente ya conoce**:

- **Superposición:** tu carta es 50 % el 7 de copa y 50 % el 7 de espada.
- **Compuertas como rotaciones:** H, X, Z, RX, RY y RZ mueven una flecha en la esfera de Bloch.
- **Fase:** Z no cambia nada hoy, pero cambia lo que hace una H después.
- **Medición y colapso:** una vez medida, la carta queda fija.

Se aprenden porque deciden si ganás la mano.

Está pensado para:
- **estudiantes secundarios y universitarios** que dan sus primeros pasos en computación cuántica;
- **docentes** que buscan una actividad práctica para el aula;
- **cualquier persona de Latinoamérica y España** que ya juega al Truco o quiere aprenderlo.

No hace falta saber física ni programación: el tutorial arranca por las reglas de las cartas y llega hasta las compuertas, la fase y la medición.

## ¿Cómo funciona la parte cuántica?

1. **Un qubit por jugador.** Al empezar cada mano, cada jugador elige una carta. Esa carta pasa a ser un qubit con dos identidades posibles:
   - **|0⟩**: la carta original;
   - **|1⟩**: su carta **ligada**, que conserva el número y cambia al palo pareja: **basto ↔ oro** y **copa ↔ espada**.

   Por ejemplo, un 7 de copa débil (fila 11 de 14 en la escala) puede volverse el 7 de espada (fila 3).
2. **Compuertas.** Cada jugador recibe 4 fichas por mano de un mazo de 41: **H, Z, RX, RY y RZ**, 8 fichas de cada una, y una sola **X**, que es rara. Las rotaciones tienen ángulos fijos de 30°, −30°, 60° y 90°. Se colocan hasta tres fichas, en el orden que quieras, y se toca **Confirmar**. En el nivel Difícil cada jugador puede sacar compuertas solo dos veces por mano.
3. **Qiskit.** Para cada circuito, Qiskit arma un `QuantumCircuit` de un qubit y calcula el `Statevector` después de cada compuerta. El juego muestra:
   - las probabilidades exactas de las dos identidades;
   - el recorrido del estado en una esfera de Bloch interactiva. La esfera rotula sus seis polos (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩) y cada eje tiene su propio color.
4. **Medición.** La carta se mide **una sola vez**, al jugarla o al aceptar un Envido. Colapsa a |0⟩ o |1⟩ con las probabilidades de la regla de Born y conserva esa identidad, su fuerza y sus tantos hasta el final de la mano.
   - **Dónde se mide:** en el tutorial y en la Partida rápida, Qiskit muestrea el `Statevector` final con `sample_memory(1)`, tanto en local como en el runtime de Python de Qollab. Una partida personalizada puede, en cambio, enviar el circuito con 1 shot al backend elegido en Qollab (por defecto, el simulador gratuito integrado). Qollab admite un solo job de ese tipo por ejecución, así que las partidas completas usan el muestreo local.
   - **Dónde se revisa:** el registro de cada medición (backend, compuertas, resultado y método) aparece en el resumen de la mano y en la consola del navegador como `[Qriollo] Medición`.

Los dos qubits son independientes: no hay entrelazamiento ni se afirma una ventaja cuántica. La idea es que un qubit se vuelva tangible.

## ¿Cómo lo ejecuto?

### En Qollab

1. Abrí el proyecto Qriollo en Qollab y tocá **Run**. El proyecto corre como **JS / Qiskit** en el simulador gratuito integrado de Qollab, sin configurar claves ni cuentas.
2. En el inicio, elegí el idioma con 🌐.
3. Empezá por **Tutorial → Truco con Bot Q**, o andá directo a **Partida rápida**.

El pie de página muestra la versión en ejecución (**v0.2.4**).

### En tu computadora

Necesitás Python 3.12 o posterior. Desde la raíz del repositorio:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Después abrí `http://127.0.0.1:8000`.
- **Windows:** usá `.venv\Scripts\python.exe`.
- **Otro puerto:** usá `serve.py --port 8001`.
- No hacen falta claves ni base de datos.

## Qué resultados esperar

- **Diapositivas:**
  - jugás bazas y contás tantos;
  - en la diapositiva de la carta cuántica tocás **H** y ves 50 % / 50 %; después tocás **Medir** y ves cómo colapsa la carta;
  - con **X** sale la ligada el 100 % de las veces.
- **Práctica con Bot Q:**
  - desafíos en los que una jugada incorrecta no se hace y Bot Q explica por qué;
  - preguntas rápidas;
  - una última mano cuántica en la que la X convierte tu 7 de copa débil en el 7 de espada y gana la baza.
- **Lecciones de compuertas:** cada compuerta se anima en la esfera de Bloch con sus probabilidades de Qiskit. Por ejemplo, H·Z·H da la ligada con 100 %, porque la fase de Z se vuelve visible después de la segunda H.
- **Partida completa:** dos jugadores compiten hasta 15 puntos. Cada mano termina con un resumen de cada baza y el registro de cada medición, y la consola anota cada colapso.

## Variante de reglas

Dos jugadores, a 15 puntos, sin Flor, con la baraja española de 40 cartas.
- **Bazas:** la mano se gana con dos de tres bazas.
- **Truco:** la mano vale 1 punto, o 2, 3 o 4 con Truco, Retruco y Vale Cuatro.
- **Envido:** apuesta aparte sobre los tantos:
  - Envido 2;
  - Real Envido 3;
  - Falta Envido, que vale lo que le falta a quien va adelante para llegar a 15.

## Créditos y licencia

Por **Guido Miniero Cocco, Alejo Dellape y Gaspar Osterrieth**.

- **Licencia:** el código original se publica bajo **licencia MIT** (ver `LICENSE`).
- **Recursos aportados:** el arte de la mesa, las cartas y el logo los aportó el equipo.
- **Esfera de Bloch:** adapta [Interactive Bloch Sphere](https://qollab.xyz/u/qollab/interactive-bloch-sphere) de Qollab.
- **Asistencia de IA:** el desarrollo tuvo asistencia de OpenAI Codex y Claude (Anthropic).
- **Sonido:** el juego no tiene música. Los cantos se leen con las voces del navegador.

Los avisos completos están en `THIRD_PARTY_NOTICES.md`.

This effort is supported by Qollab & IonQ.
