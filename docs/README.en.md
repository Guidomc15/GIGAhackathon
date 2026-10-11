# Qriollo · Quantum Truco 0.2.3

Learn quantum computing by playing Argentine Truco. Two people share a device, turn one card each into a qubit and play to 15 points. The whole interface is available in **English and Spanish** (🌐 on every screen); Truco, Envido, Quiero and the other calls keep their Spanish names, as at any table.

Run locally with Python 3.12:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Open local port 8000 in your browser. On Windows use `.venv\Scripts\python.exe`. No keys or database are needed. For Qollab, unzip `QOLLAB_0.2.3.zip` and upload its root files as JS / Qiskit; it adds `slides.js`, `home-art.js`, `i18n.js` and `music-data.js`, so replacing only `main.js` is not enough. The footer shows the version (v0.2.3) to confirm which files Qollab loaded. [Upload instructions](../QOLLAB_UPDATE.md).

## What is in 0.2.3

- **English and Spanish** everywhere, switchable at any moment, even mid-game. The starting language follows the browser.
- **Two-part tutorial.** *Truco with Bot Q*: 15 interactive slides with the rules (cards, ladder, bazas, Truco and Envido) and a four-hand practice (33 steps) with challenges and quick questions: a wrong move is not played and Bot Q gives a hint. The fourth hand introduces the quantum card. *Gates and the Bloch sphere*: nine lessons with an animated sphere, game analogies and Qiskit-computed odds.
- **Levels.** Learning: unlimited gate edits. Hard: each player may remove gates only twice per hand (reordering is free).
- A single **Confirm** button locks the circuit.
- **Coloured axes**: X coral, Y violet, Z light blue on the sphere, with the same colours on the letters in every explanation.
- **No scrollbars on desktop** (from 900 × 540 px): table on the left, guidance and calls on the right. Phones keep a vertical page.
- **New home screen** from the team's sketch: the Qriollo logo, the tagline “A truly Argentine way to learn quantum computing”, Tutorial · Quick game · Quick help · Credits plaques and the Q card with the Bloch sphere. Quick game starts at once (default names, Learning level, local simulation); “Custom game” opens the full setup.
- New looping **music** with its own volume and mute.
- **Quick help** shows the illustrated ladder of all 40 cards; the hand **summary** scrolls down to each measurement record, and every measurement is logged to the **console** (“[Qriollo] Medición”).
- **Token deck**: H, Z, RX, RY and RZ about 20 % each; X is rare (2.4 %).
- The educational noise model and the π/67 rotation were removed.

## The quantum card

At the start of each hand each player picks one card. Its “linked” identity keeps the number and switches suit (Swords ↔ Cups, Clubs ↔ Coins). Up to three gate tokens (H, X, Z, RX, RY, RZ at fixed 30°, −30°, 60° and 90°) change the odds of each identity. The card is measured once, when played or when an Envido is accepted, and then stays fixed. Qiskit computes previews, paths and measurements.

This is a two-player, 15-point, no-Flor Truco variant; Falta Envido is 15 minus the leading score. On Qollab the IonQ adapter keeps the observed one-job-per-run limit, so full games use explicit local simulation and the tutorial always measures with local Qiskit.

[Tests](../TESTING.md) · [Rollback](ROLLBACK.md) · Original code is MIT; artwork, music, adapted sphere, dependencies and AI assistance are disclosed in [notices](../THIRD_PARTY_NOTICES.md).

This effort is supported by Qollab & IonQ.
