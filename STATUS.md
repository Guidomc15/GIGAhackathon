# Estado actual · propuesta 0.2.0

Base GitHub: `6576cce` (0.1.9). Implementación y pruebas actuales descritas en `RELEASE_0.2.0.md` y `TESTING.md`. El entorno local permite partidas completas con Qiskit. La publicación en GitHub/Qollab se informa por separado; publicar un entorno no agrega commits al repositorio.

## Registro histórico anterior

# Real delivery status — 10 October 2026 ART

This is a partial implementation, not the completed hackathon MVP.

## Implemented and verified

- Two-human Truco to 15, without Flor; full canto/state rules, paired collision-free dealing, private device handoff, quantum composer, prefix probabilities/amplitudes/Bloch trajectories and reports.
- Real Qiskit evolution and explicitly selected local development sampling. Thirty complete seeded matches to 15 in tests; live dealing/sampling are unseeded.
- **95 automated tests passed** on Python 3.12.14 / Qiskit 2.5.2.
- Browser verification of private handoff, editing/locking, Truco→Envido first→accept, private collapse, public totals and reaffirmation.
- Actual Qollab startup on Python 3.14.2 / Qiskit 2.5.2.
- Actual remote IonQ Aria 1 simulator H diagnostic: one shot, counts {"1":1}. Actual second submission rejected by the one-job limit.
- Actual application tutorial X measurement: one shot, counts {"1":1}, job 01a123c5-ed8a-720c-8052-e0e784db4290. Evidence is preserved in artifacts/ionq-tutorial-output.txt and 07-ionq-tutorial.jpg. This is a real application measurement, not a full match.
- Further tutorial samples and a complete guided Bot Q hand used explicitly selected local Qiskit development, labeled NO IonQ. The final private report and “Mano guiada terminada” were observed.
- Original source under MIT; dependency/AI notices; source ZIP, Qollab upload ZIP, captioned 56-second evidence video and equivalent transcript.

## Runtime requirements and unresolved checks

Qollab's top-level run must remain active for interactive jobs; main.js retains it until Stop. Reload/Stop discards all in-memory state. No credentials or persistent private storage are requested.

The tested project permits **one IonQ job per execution**. No working exception was observed. General matches and all tutorial lessons with successive on-demand IonQ measurements remain blocked. The application fails closed and never silently changes to local sampling. Current remote choices are noise-model simulators; ideal previews need not match every noisy shot.

Batch adapter checks are mocked, not verified remote batch results. A full normal two-human IonQ match to 15, independent human observation, comprehensive screen-reader audit and twelve-month hosting availability have not been verified. Qollab v0.1.0-preview was visibly created as the public default version. The public-access check is recorded in DELIVERY_STATUS.md. The released snapshot predates this local delivery record.

## Publication preference

The owner explicitly requested archive delivery without GitHub publication. No GitHub repository was created; no repository URL is fabricated. That competition repository-link criterion remains unmet by the owner's choice. The supplied Qollab project contains the implementation and v0.1.0-preview is its public default version.

This effort is supported by Qollab & IonQ.

## Opening screen update

The supplied image is now the opening menu, with four working native buttons and a separate card-values reference. Published as Qollab v0.1.1-preview; see DELIVERY_STATUS.md for actual checks.

## Table design release

Qollab v0.1.2-preview is public with the new table and game-wide visual theme. Live cards, backs, scores, baza slots and the Activar cuántico modal were manually checked; normal setup was fixed and verified in Qollab. See DELIVERY_STATUS.md. Original one-job IonQ limitations remain unchanged.

## Visual update: deck and enlarged quantum composer

The supplied 40-card design and back are used throughout the hand, table, identities and reports. Valores includes a complete deck gallery. The enlarged translucent card has three editable circuit positions, the original/linked identities and actual probabilities, the Qiskit Bloch trajectory, and a separate metal rack containing the four dealt gate tokens. Add/remove/reorder/undo/reset and private confirmation remain functional. Local browser checks verified H → 50/50, H then Z → X=-1, reorder Z then H → X=+1, removal/undo and confirmation hiding the hand. 95 engine/quantum tests pass. This visual update performs no new IonQ job and does not resolve the existing one-job blocker.

Qollab publication verified on 10 October 2026: v0.1.3-preview is Public and Default. This release includes the owner-provided deck, enlarged composer and deck gallery. Actual Qollab preparation/reveal/selection/composer/H editing checked with explicitly chosen local Qiskit development (no new IonQ job). Evidence: artifacts/16-quantum-composer.jpg, artifacts/17-deck-gallery.jpg, artifacts/18-qollab-composer.jpg.

## Qollab interactive sphere reuse

The canvas sphere in bloch.js adapts **Interactive Bloch Sphere by qollab** (https://qollab.xyz/u/qollab/interactive-bloch-sphere), using the export supplied by the owner. Rendering, depth, arrow, idle camera spin and pointer drag are reused; gate-selection controls and sampling are excluded. Our existing composer, four-token/three-slot limits and measurement adapter remain in charge. Qiskit supplies states and true unitary paths; the view can be rotated by pointer or keyboard without changing the state. Visible attribution, precise reuse scope, source snapshots and license status are documented in THIRD_PARTY_NOTICES.md and third_party/interactive-bloch-sphere/PROVENANCE.md. No license was included in the supplied upstream export; it is not covered by our original-code MIT grant.
