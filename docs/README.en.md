# Qriollo · Quantum Truco 0.2.1

Learn quantum computing through Argentine Truco. Two people share a device, prepare one quantum card each and play to 15 points. The Bot Q tutorial explains qubits, gates, interference, measurement and noise using examples, interactive experiments and optional technical detail. Choose English for rules and lesson text on the home screen; the game’s calls keep their Spanish names.

Run locally with Python 3.12:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Use the local port 8000 in your own browser. On Windows, use `.venv\Scripts\python.exe`. No keys or database are needed. For Qollab, unzip `QOLLAB_0.2.1.zip` and upload its root files as JS / Qiskit. Updating only main.js is insufficient for 0.2.1: replace the included JavaScript, CSS, HTML and Python entrypoint and add the new modules. [Upload instructions](../QOLLAB_UPDATE.md).

Announcements initially wait for **Skip · Continuar**. The timer cycles 1 s, 3 s, 7 s and manual; reduced motion preserves reading time. Turn changes retain scroll. Music and speech have independent mute/volume controls. Speech depends on installed browser voices.

Local educational noise uses Qiskit DensityMatrix and amplitude-damping/dephasing Kraus channels. It changes the same distribution used by actual sampling. Confirmed cards age during their owner’s visible decision time; announcements, privacy, help, menus and hidden tabs pause the clock. Measured identities stay fixed. Times T₁ = 60 s and Tφ = 90 s are deliberately scaled teaching values, not IonQ calibration. [Model and official sources](QUANTUM_NOISE.md).

This is a two-player, 15-point, no-Flor Truco variant. Falta Envido is 15 minus the leading score; pairing avoids duplicate cards after a quantum suit change. The app teaches the hierarchy, tied tricks, Envido and Truco separately.

[Tests](../TESTING.md) run locally; updated Qollab wrapper startup remains unverified. Complete matches and the educational noise model use explicitly selected local simulation. The IonQ adapter retains the previously observed one-job-per-run limit.

The remote `v0.2.0` tag preserves the previous playable release. [Rollback](ROLLBACK.md). Original code is MIT; adapted sphere, artwork, dependencies and AI assistance are disclosed in [notices](../THIRD_PARTY_NOTICES.md).

This effort is supported by Qollab & IonQ.
