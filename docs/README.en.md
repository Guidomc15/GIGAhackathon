# Qriollo · Quantum Truco 0.2.3

**A truly Argentine way to learn quantum computing.** Qriollo is Argentine Truco with a quantum card: each player turns one of their cards into a qubit, transforms it with gates and measures it when it is played. Qiskit computes the states, the Bloch-sphere paths and the measurements.

The whole interface is in **English and Spanish** (🌐 on every screen). Truco, Envido, Quiero and the other calls keep their Spanish names.

[Spanish README](../README.md) · [Upload to Qollab](../QOLLAB_UPDATE.md) · [Tests](../TESTING.md) · [Changelog](../CHANGELOG.md) · [Notices and licences](../THIRD_PARTY_NOTICES.md)

This effort is supported by Qollab & IonQ.

## What you can do

- **Tutorial**: 17 interactive slides on the rules and the quantum card, a four-hand practice against Bot Q and nine lessons on gates and the Bloch sphere.
- **Quick game**: two people on one device, default names, Learning level and local Qiskit simulation.
- **Custom game**: names, level (Learning or Hard) and privacy mode, which hides your hand when the device is passed.
- **Quick help**: the illustrated ladder of all 40 cards, envido points and how the quantum card counts.

## The game

The game is a two-player variant played to 15 points, without Flor, using the 40-card Spanish deck.

- **Winning a hand:** two of three bazas (tricks) win a hand.
- **Truco:** a hand is worth 1 point, or 2, 3 or 4 with Truco, Retruco and Vale Cuatro.
- **Envido:** a separate bet on your envido points:
  - Envido is worth 2;
  - Real Envido is worth 3;
  - Falta Envido is worth what the leader needs to reach 15.

### The quantum card

1. At the start of each hand each player picks one card: it becomes a **qubit**.
2. It has two identities, the **original** (|0⟩) and the **linked** card (|1⟩). The linked card keeps the number and takes the partner suit: **clubs ↔ coins** and **cups ↔ swords**. A weak 7 of cups can become the 7 of swords, a brava.
3. Up to **three gate tokens**, in any order, change the odds. On Hard you may remove gates only twice per hand.
4. **Confirm** locks the circuit. The card is **measured once**, when it is played or when an Envido is accepted, and its identity, strength and envido points stay fixed after that.

Each player gets 4 tokens per hand from a 41-token deck.
- **H, Z, RX, RY and RZ:** 8 each, about 20 % per family. Rotations use fixed angles of 30°, −30°, 60° and 90°.
- **X:** a single token (2.4 %).

The two qubits are independent, so there is no entanglement and no claim of quantum advantage.

### Checking the measurement

- **In the summary:** the hand summary → “More details about your card” → “Measurement record” shows the backend, the gates, the result and the method. Locally this is `Qiskit Statevector.sample_memory(1)`; on IonQ the record also includes the `job_id` and the returned distribution.
- **In the console:** the browser console logs every measurement as `[Qriollo] Medición …` with the same record. It also logs the version at start-up.

## Run locally

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Open `http://127.0.0.1:8000`. No keys or database are needed. Games live in memory until the server stops.

## Qollab

Unzip `QOLLAB_0.2.3.zip` and upload **all its files** to a **JS / Qiskit** project, replacing files with the same name. The footer must read **v0.2.3**. The full steps are in [QOLLAB_UPDATE.md](../QOLLAB_UPDATE.md). On Qollab the IonQ adapter allows one job per run, so full games use explicit local simulation and the tutorial always measures with local Qiskit.

## Tests

The suite has 49 Python tests and six Playwright browser suites, which also run in GitHub Actions. See [TESTING.md](../TESTING.md).

## Credits

Guido Miniero Cocco, Alejo Dellape and Gaspar Osterrieth.

- **Licence:** the original code is MIT.
- **Contributed assets:** the art, logo and music were contributed by the team.
- **Bloch sphere:** adapted from Qollab's Interactive Bloch Sphere.
- **AI assistance:** OpenAI Codex and Claude (Anthropic).

See [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
