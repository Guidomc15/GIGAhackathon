# Compatibility and first-stage inspection

Inspection and implementation began after the authorized window start (9 October 2026, 20:00 ART). Deadline: 11 October 2026, 20:00 ART. No source was reused from before the window.

## Observed environment

- The referenced `/mnt/data/Pasted text.txt` was not present on this macOS host. The exact attachment was recovered through the referenced ChatGPT conversation and read from its returned local preview path.
- The synced `sources/` directory was empty; no synced files were modified. Local AGENTS.md was read and respected.
- Initial system Python 3.14.6 had no Qiskit, IonQ provider or UI framework. Bundled Python 3.12.14 had NumPy, no Qiskit.
- Created an isolated `.venv`. Qiskit 2.4.1 initially installed and passed quantum tests. After inspecting Qollab's documented requirements and PyPI compatibility, upgraded only this isolated environment to Qiskit 2.5.2. Essential tests pass on that version. No system packages updated.
- Qollab plugin discovery returned no connector. Official documentation and the owner's signed-in project were inspected through the browser.
- The owner's draft initially had only main.py (the Bell-state starter), blank README/Project Card and requirements.txt `qiskit>=2.5.2,<3.0.0`. No special multi-job configuration was present.

## Real Qollab / IonQ execution evidence

On 9 October 2026 ART, the one-qubit diagnostic was executed in the owner's project on **IonQ Aria 1 simulator (25q), noise model aria-1**, never hardware. The console reported:

- Python **3.14.2**.
- Qiskit **2.5.2**.
- Backend **ionq_simulator**, module **qiskit_ionq.ionq_backend**.
- Circuit: H on q[0], then measurement q[0]→c[0].
- Shots: **1**.
- Qiskit ideal preview: [0.4999999999999999, 0.4999999999999999].
- Returned unfiltered counts: **{"1": 1}**.
- Job status progressed INITIALIZING→DONE; observed run approximately 14.8 seconds.

Evidence: `artifacts/05-ionq-smoke.jpg` and `artifacts/ionq-smoke-output.txt`. This proves the diagnostic path, not a complete IonQ match.

A second diagnostic attempted another one-qubit job within the same execution after completing the first. The result was **SECOND_JOB_REJECTED: ConnectionError; ONE_JOB_LIMIT: True**. The supplied project URL does not activate an exception. The required full match is blocked by this observed platform behavior, not merely by an assumption based on docs.

## Supported interface and chosen architecture

Official docs confirm JS / Qiskit wrapper, body-only index.html, top-level main.js/main.css, relative JS imports, dotted Python imports, `.callPromising` for IonQ calls, and an injected backend selected by the user. Python alone has no input() UI. No evidence supports Streamlit, Gradio or Dash server hosting; they were not selected or installed.

Chosen design: pure Python classic rules, Qiskit state evolution, explicit game states and separate public/private projections; original HTML/JS composer and SVG Bloch plot; Python session API; a loopback HTTP runner only for local development. No database or secrets. Dependencies are Qiskit and its transitive packages; licenses in THIRD_PARTY_NOTICES.md.

## Measurements, errors and retry

One classical bit eliminates multi-qubit endianness ambiguity: q[0] maps to c[0]. Only 0/1 or their one-bit hexadecimal equivalents are accepted. No low-probability filtering is applied. The provider's returned shot counts or probabilities are normalized and used for exactly one effective draw; the resulting identity is persisted. Counts from an actual one-shot noisy run are already a single outcome.

Remote jobs are submitted once, polled without blocking rendering, and given a 120-second pending threshold. Retrying consults the same job. If submission status is uncertain, fail closed rather than submit a duplicate. Errors do not produce outcomes or activate development sampling. Mock tests check these paths; timeout/error behavior has not yet been induced on the actual service.

## Risks and minimum alternatives

1. **One IonQ job/run; no persistent storage:** blocks successive measurements. Do not measure cards early or precompute future hands. Minimum honest alternative is a labeled Qiskit development mode plus a verified one-job IonQ preview. A compliant solution needs an organizer-approved environment allowing repeated jobs while retaining session state.
2. **Remote noise models:** ideal state previews remain ideal; measurements use returned results. Deterministic tutorial predictions refer to the ideal model. Ask organizers for an ideal IonQ simulator if ideal guarantees are required; never force results.
3. **Runtime and browser compatibility:** official docs require WebAssembly JSPI, recent Chromium or Firefox 153+, and do not support Safari. Full actual application validation is tracked in STATUS.md.
4. **Publication/repository/video and retention:** must be verified separately. An existing draft is not publication; successful diagnostic counts are not proof of a full match. The 12-month retention requirement is an owner commitment over time.

## Prioritized 48-hour plan

1. Inspect runtime and perform one-qubit probe, before claiming compatibility.
2. Test quantum math and persistent collapse.
3. Implement and test pure rules and canto state transitions.
4. Build deliberate private reveal, original composer and accessible Bloch display.
5. Add real tutorial samples, guided Bot Q hand and private/final reports.
6. Run automated and browser checks; reproduce actual IonQ path and multi-job behavior.
7. Package source, notices, MIT, submission copy, judging summary and captioned demonstration.
8. Publish a clearly labeled partial release only after verifying what it actually supports. Complete final compliance checks only when platform blocker is resolved.

Official references:

- https://qollab.xyz/learn/docs/runtime-environment
- https://qollab.xyz/learn/docs/js-qiskit-projects
- https://qollab.xyz/learn/docs/compute-backends

## Interactive lifetime finding

Actual application startup succeeded. The first UI-driven submission failed after the initial script had completed. Keeping the Qollab top-level run alive while controls use the injected backend allowed a real X circuit submission. A separate argument-passing defect in the no-argument poll helper was fixed; the JS bridge now omits undefined arguments. These findings came from actual browser runs, not an invented API. Stop remains the documented way to end a session.
