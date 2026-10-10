# Validación actual · 0.2.0

La base integrada es el commit GitHub `6576cce` (0.1.9), junto con el servidor local y los arreglos que habían quedado sin publicar. La suite actual tiene 37 pruebas Python.

```sh
.venv/bin/python -m unittest discover -s tests -v
python build_qollab.py --check
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tests/browser_interface.cjs
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tests/browser_full_match.cjs
TRUCO_PRIVACY=1 PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tests/browser_full_match.cjs
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tests/browser_animations.cjs
```

El servidor `serve.py` debe estar ejecutándose para las pruebas de navegador. Fuera de este entorno instalá Playwright y usá su Chromium, o configurá `CHROMIUM_EXECUTABLE_PATH`; `PLAYWRIGHT_MODULE` admite una instalación externa. `TRUCO_URL` y `ARTIFACT_DIR` permiten cambiar destino y carpeta de capturas.

Se verifican reglas y pardas, partidas variadas hasta 15, rotaciones fijas con Qiskit, distribución/conservación del mazo, medición única y atómica, recuperación del mismo job remoto con dobles de prueba, API HTTP, privacidad opcional, cartas al responder, Envido automático con empates, resultado antes del resumen y Bot Q. El navegador comprueba pantallas de 320/390 píxeles, teclado, errores de transporte y animaciones activadas/reducidas. El paquete de Qollab se verifica en un proceso Python aislado sin acceso a `truco/`: importación, sesión persistente, X real, Envido, partida hasta 15 y video desde archivos planos. También se comprueba que el ZIP incluya todas las dependencias de los imports JavaScript y el módulo Python. Las pruebas actuales usan Qiskit local; no ejecutan el wrapper de Qollab ni verifican una nueva partida IonQ o una publicación Qollab.

## Registros históricos de Qollab hasta 0.1.9

Los siguientes registros describen las versiones anteriores y sus artefactos. El conjunto histórico de 95 pruebas citado aquí no está incluido en este checkout; las pruebas reproducibles actuales están en `tests/`.

# Testing evidence and reproduction

## Suite del checkout actual

La versión local incluye 28 pruebas ejecutables con
`.venv/bin/python -m unittest discover -s tests -v`, además de comprobaciones
reproducibles de navegador en `tests/browser_interface.cjs` y
`tests/browser_full_match.cjs`. Cobertura, resultados y propuestas en
[POLISH_REVIEW.md](POLISH_REVIEW.md).

Las referencias a 95 pruebas y `pytest` que siguen son evidencia histórica;
esa suite anterior no está incluida en este checkout.

Run `.venv/bin/python -m pytest -q`. Current verified result: **95 passed** on Python 3.12.14 and Qiskit 2.5.2. Tests use seeds only inside tests; live dealing and sampling are unseeded.

## Coverage

- **Quantum:** X, H, HH, XX, ZZ up to global phase, HZH, HX versus XH Bloch vectors, direct RY and H→RY±, normalized probabilities, amplitudes, token limits, locked circuit, 0/1 sample, persistent collapse, no second collapse, invalid distributions.
- **Classic:** forty cards, twenty pairs, 500 collision-free deals, complete fourteen-tier hierarchy, all 27 three-baza outcomes for both mano players, figure/same-suit/triple-suit/no-suit Envido, all fixed accepted chains, accumulated refusals, dynamic Falta, gate stock/discard conservation over 30 hands.
- **State machine:** private projection, invalid mandatory-response actions, Envido pausing/reaffirming Truco, accepted Envido private order and reuse of measured card, refused Truco levels, folding stakes, immediate match end after Falta/Envido, thirty complete seeded local matches to 15.
- **Adapter (mocks only):** one-shot measured circuit construction, batched independent qubits, effective sample, same-job retry after timeout, duplicate submission prevention, refusal of unverified/non-IonQ and hardware targets, fail-closed uncertain submission. These tests are not real IonQ results.
- **Tutorial/service:** guided Bot Q hand with Envido first, unscripted real Qiskit samples, outcome-adaptive text and no private data until explicit reveal.

## Manual local browser observations

The game started through serve.py. Initial handoff contained no cards or gate details. Checkbox+reveal displayed only the active player's cards. Selecting X produced |1⟩ and Bloch Z=−1; explicit confirmation concealed the screen before passing the device. A real local sequence Truco→Envido va primero→Quiero measured both cards, showed each privately in mano order, then displayed only totals (22 and 32 in that observed hand) and required Truco reaffirmation. These numbers are observed outputs, not hardcoded demo expectations.

The updated Qollab application also completed a guided local hand: three human card plays, Bot Q responses, persistent local collapse, private report and “Mano guiada terminada”. The evidence video loaded in Qollab with duration=56 and readyState=4. Screenshots are in artifacts/. See STATUS.md for subsequent application checks and links.

## Actual IonQ diagnostic

The separate Qollab smoke test completed on IonQ Aria 1 simulator with H and shots=1, counts {"1":1}. Bit map was q[0]→c[0]. A second submission in one run failed with ConnectionError due to the one-job limit. Source and output snapshots are preserved; do not confuse this diagnostic with a full normal match.

## Actual application IonQ measurement

The uploaded UI successfully measured tutorial X through the injected IonQ Aria 1 simulator, shots=1, counts {"1":1}; job 01a123c5-ed8a-720c-8052-e0e784db4290. The same-run next lesson was blocked without fallback. Further lessons were sampled only after explicitly selecting local development. Interactive jobs require retaining the top-level execution until Stop.

## Remaining acceptance checks

Do not sign off the hackathon checklist merely because unit tests pass. Verify the uploaded UI and tutorial in the actual runtime; validate batch results and job lifecycle; complete a full normal match with repeated IonQ measurements only in an approved environment; access the public version from a different session; inspect final video/links; audit keyboard, screen-reader and mobile behavior. Preserve the 12-month hosting commitment after submission.

## Opening menu update — 10 October 2026

Manually verified all four opening buttons: setup form, Bot Q intro, card hierarchy/Envido values, credits. Returning home restores the artwork. Native buttons expose accessible names and keyboard focus. Responsive mobile layout is checked separately from the desktop composition. The game-engine suite remains 95 passing tests.

## Live table update

Manually checked both players’ private preparation, Activar cuántico opening the modal, a real X edit, confirmation/hidden handoff, click-to-play measurement and the completed first baza. Observed X mapping 1 basto→1 oro with local Qiskit sampling and the rival’s 1 espada remaining its original identity. Both public cards appeared in baza 1; opponent backs decreased from three to two and played cards left the private fan. These are observed outputs, not prescribed demo cards. Drag/drop is implemented; a physical drag gesture has not yet been independently verified. The engine suite remains 95 passing tests.

Actual Qollab table checks also passed: new two-human setup, private reveal, card selection, modal activation, H edit and return to the mesa. The setup UI avoids FormData because the real Qollab wrapper did not submit the earlier form.

## Visual update: deck and enlarged quantum composer

The supplied 40-card design and back are used throughout the hand, table, identities and reports. Valores includes a complete deck gallery. The enlarged translucent card has three editable circuit positions, the original/linked identities and actual probabilities, the Qiskit Bloch trajectory, and a separate metal rack containing the four dealt gate tokens. Add/remove/reorder/undo/reset and private confirmation remain functional. Local browser checks verified H → 50/50, H then Z → X=-1, reorder Z then H → X=+1, removal/undo and confirmation hiding the hand. 95 engine/quantum tests pass. This visual update performs no new IonQ job and does not resolve the existing one-job blocker.

## Qollab interactive sphere reuse

The canvas sphere in bloch.js adapts **Interactive Bloch Sphere by qollab** (https://qollab.xyz/u/qollab/interactive-bloch-sphere), using the export supplied by the owner. Rendering, depth, arrow, idle camera spin and pointer drag are reused; gate-selection controls and sampling are excluded. Our existing composer, four-token/three-slot limits and measurement adapter remain in charge. Qiskit supplies states and true unitary paths; the view can be rotated by pointer or keyboard without changing the state. Visible attribution, precise reuse scope, source snapshots and license status are documented in THIRD_PARTY_NOTICES.md and third_party/interactive-bloch-sphere/PROVENANCE.md. No license was included in the supplied upstream export; it is not covered by our original-code MIT grant.

Interactive sphere checks (10 October 2026): the local tutorial X state displayed Z=-1 and P(1)=100%; real pointer drag visibly rotated the camera while the state/probabilities stayed unchanged. Keyboard arrows and Home were exercised. In the existing three-slot card composer, adding the dealt H token produced X=1 and 50/50, with the attribution link visible. Existing 95 automated engine/quantum tests pass; no new IonQ measurement was requested for this UI integration. Screenshots: artifacts/19-interactive-bloch.jpg and artifacts/20-card-interactive-bloch.jpg.

Qollab verification for the integration: canvas mounted successfully, keyboard camera control exercised, visible source attribution inspected, and tutorial X preview changed to vector (0,0,-1) with P(1)=100%. No sample button was pressed. Evidence: artifacts/21-qollab-interactive-bloch.jpg.

Visual consistency update (10 October 2026): arrow shaft/head now red. Tutorial and report previews share circuitStrip with the live card editor, retaining three slots, q[0] and measurement symbol. Previews use the same glass/glow container; reports include original and linked card identities inside it. Actual local tutorial X preview visually checked; both human circuits confirmed with the shared controls; ending the hand by folding and revealing the private report verified its new presentation and truthful unmeasured outcome. 95 automated engine/quantum tests pass. Evidence: artifacts/22-red-arrow-tutorial.jpg and artifacts/23-card-style-report.jpg. No new IonQ jobs for this visual change.

Gate-colored trajectories: each Qiskit path now carries explicit start/end indices for each gate. The renderer, circuit positions and dealt tiles share one palette: H orange, X green, Z cyan, RY+ violet, RY- yellow. Ordered legend and solid/dashed/dotted stroke patterns identify steps even when paths overlap. Local H→X, X→H and H→Z→H lesson inspected with corresponding colored circuit positions and trajectory segments; the red state arrow remains distinct. 95 tests pass. No additional measurement was executed.

Qollab gate-color verification: the H→Z→H tutorial displayed orange H slots and matching orange tracks, a cyan Z slot and matching equatorial track, with a distinct red state arrow and ordered legend. Evidence: artifacts/26-colored-gate-paths.jpg and artifacts/27-qollab-gate-colors.jpg.

Gate teaching update: 95 existing tests pass. JavaScript syntax checked. Actual local H explanation inspected: |0⟩ input, equal 1/√2 amplitudes, 50/50 probabilities and replay control. Prefix spheres use existing Qiskit segment boundaries; no sampling is requested by explanation or replay.
Actual local H→Z→H teaching view inspected: |+⟩ after H, |−⟩ after Z, |1⟩ after the last H; probability sequence 100/0 → 50/50 → 50/50 → 0/100. Evidence: artifacts/28-h-step-explanation.jpg. No new IonQ job requested.
Actual Qollab H walkthrough and replay checked before publication; v0.1.7-preview is Public and Default. Evidence: artifacts/29-qollab-step-explanation.jpg.

Dynamic measurement update: 95 engine/quantum tests pass and ui.js/main.js syntax checks pass. Actual local guided Envido: H sampled as 1; private view showed only 6 de espada, fixed-result label and Continue, with no circuit/story. Continue resumed Truco; rejecting it led to a final private report containing the H explanation. Separate guided hand without Envido: public Bot Q result 0 animated on its table slot; playing the owner’s X-prepared 5 de espada produced result 1 / 5 de copa and animated at that slot, followed by next-turn handoff. No immediate analysis displayed. Evidence: artifacts/30-private-measured-card.jpg and artifacts/31-public-card-transition.jpg. These were local Qiskit development measurements, not new IonQ jobs. Reduced-motion logic omits both animation and presentation delay.

Actual Qollab H private Envido produced result 0 / 12 de espada with only the card and Continue; continuation checked in explicit local Qiskit development. Evidence: artifacts/32-qollab-measured-card.jpg. Publication v0.1.8-preview verified Public and Default.

Fused card update: 95 existing tests pass. main.js, ui.js and card-effects.js syntax checks pass. Actual local composer: H reaches 50/50, H→RY+ reaches 25/75; boundary moves accordingly. Live hand shows one fused selected card. Actual local Envido H measurement returned 0 / 2 de copa; final wave opacity inspected as 0 and full identity displayed with compact measured Bloch. No new IonQ job. Evidence: artifacts/33-fused-card-half.jpg, 34-fused-card-ry.jpg, 35-live-fused-card.jpg, 36-settled-fused-card.jpg. Loop cancellation and bounded view memory are retained.
