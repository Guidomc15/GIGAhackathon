# Third-party and AI disclosure

Original game implementation, composer UI, test cases and documentation were created during the authorized hackathon window, starting 9 October 2026 20:00 ART. No prior game engine, academic implementation, external UI template or IBM Composer graphics was reused. The interactive sphere now deliberately adapts the Qollab example disclosed below. The owner supplied visual references and artwork, disclosed below. Unicode symbols are rendered by the user's system fonts; no font or icon library is bundled.

Original files: MIT, see LICENSE. Python standard library: Python Software Foundation license, provided by the interpreter rather than redistributed here.

## Runtime packages — installed versions

| Package | Version | License |
|---|---|---|
| Qiskit | 2.5.2 | Apache-2.0 |
| NumPy | 2.5.3 | BSD-3-Clause; distribution metadata additionally lists 0BSD, MIT, Zlib, CC0-1.0 |
| SciPy | 1.18.1 | BSD-3-Clause; wheels may bundle OpenBLAS/LAPACK and runtime components with their own notices |
| rustworkx | 0.18.1 | Apache-2.0 |
| dill | 0.4.1 | BSD-3-Clause |
| stevedore | 5.9.1 | Apache-2.0 |
| typing_extensions | 4.16.0 | PSF-2.0 |

## Test packages

pytest 9.1.1 (MIT), iniconfig 2.3.1 (MIT), packaging 26.3 (Apache-2.0 OR BSD-2-Clause), pluggy 1.6.0 (MIT), Pygments 2.21.0 (BSD-2-Clause).

`requirements-lock.txt` records the actual local environment, including test dependencies. `docs/installed-metadata-licenses.txt` preserves installed license metadata, including SciPy's bundled-component notices. Package binaries are not redistributed in the source archive. Preserve each distribution's license files when building a binary distribution.

## Qollab and IonQ

Qollab provides the injected backend and its Pyodide/Qiskit runtime under its platform terms. It supplied qiskit_ionq in the verified smoke run; we did not install, vendor or create its credentials. Qiskit IonQ Provider is Apache-2.0 according to its upstream repository. Its exact Qollab-installed version is recorded when the diagnostic reports it; do not assume it equals any locally available release.

Official references consulted (API guidance, not copied implementation):

- https://qollab.xyz/learn/docs/runtime-environment
- https://qollab.xyz/learn/docs/js-qiskit-projects
- https://qollab.xyz/learn/docs/compute-backends
- https://github.com/qiskit-community/qiskit-ionq

The owner's initial Qollab Bell-state template was inspected, then replaced for a one-qubit probe. It was not incorporated into the game. A local reference snapshot is excluded from release archives and the repository.

## AI and production tools

OpenAI Codex generated code, UI, documentation and tests from the supplied specification, inspected the environment and ran verification. This assistance is explicitly declared. The owner should review the output before final competition submission. OpenAI service usage is governed by its applicable terms, not a bundled open-source license.

The Codex browser tools captured application screenshots. FFmpeg creates a short evidence montage from those screenshots; it is a production tool and is not bundled. The original evidence montage contains no stock footage, music, voice or external demonstration footage. Later UI artwork is disclosed below. The demo accurately labels development sampling and the separate real IonQ probe.

This effort is supported by Qollab & IonQ.

The evidence-frame production script uses Pillow from the bundled workspace runtime (HPND and project notices). It is a build tool, not an application dependency; no Pillow binary is redistributed.

## Menu artwork

The opening menu image was supplied by the owner on 10 October 2026 and is embedded unchanged in menu-art.js. Its authorship and license were not independently verified; the MIT license on original code does not assert ownership of this supplied artwork.

## Table artwork and derivative background

The owner supplied the table design on 10 October 2026. Built-in imagegen prepared assets/table-empty.png by removing the example cards, scoreboard and control, preserving the wood/frame/light composition for live game overlays. The exact prompt is assets/table-edit-prompt.txt. Original reference artwork rights remain separate from original MIT code. The score display and UI are code-native original assets. The initial code-native cards and backs were replaced by the owner-provided deck described below. The background is encoded without visual changes in table-data-0.js / table-data-1.js to respect Qollab’s 2 MB per-file limit.

## Spanish deck and enlarged-card reference

On 10 October 2026 the owner supplied a 1024×572 atlas containing the 40 Spanish cards and a back, plus an enlarged-card composer reference. assets/cards-atlas.png and cards-art.js preserve the atlas bytes unchanged. ui.js and CSS select each rectangular view by rank and suit; no new card illustration was generated. The supplied artwork’s authorship/license was not independently verified and is not relicensed by the MIT code license. The composer implements the reference as live HTML/CSS controls and a Qiskit-driven interactive canvas sphere, rather than embedding its illustrative circuit or gate sequence as game state.

## Reused code: Qollab Interactive Bloch Sphere

Source: https://qollab.xyz/u/qollab/interactive-bloch-sphere — project owner **qollab**. The public project page was inspected on 10 October 2026 (current default version v1.2, dated 30 August 2026). The implementation is adapted from the main.js export supplied by the user, preserved byte-for-byte with its README under third_party/interactive-bloch-sphere/.

Reused in bloch.js: 3D camera projection; front/back rings and axes; gradient arrow and arrowhead; equatorial dashed guide; depth-dependent labels; slow camera spin; pointer capture and drag rotation. Adaptations: integration with the existing three-slot composer and Python Qiskit state projections; actual unitary trajectory and numbered prefix markers; replay from |0⟩ after an edit; explicit collapse segment; canvas lifecycle cleanup and remembered camera; keyboard view rotation/Home; reduced-motion handling; colors matching Qriollo. Camera rotation changes the view only, never the circuit or probabilities. Attribution links appear under each sphere and in Créditos and the Qollab project card.

Excluded: upstream gate-selection UI, arbitrary-angle slider, extra gate types, readout panels, backend selector, 1024-shot Math.random local sampler and q-sphere.csv (a separate four-bit table unrelated to this one-qubit renderer). Game measurements still use the existing adapter and measurement timing. The supplied README describes backend submission, while its supplied main.js actually samples locally; neither sampling path was imported.

No LICENSE or explicit license declaration accompanied the supplied files or the inspected project card. Attribution records provenance and does not by itself establish a license or guarantee hackathon eligibility. The original MIT grant in this repository applies to our original work, not to the reused upstream portions or preserved third-party exports. Upstream rights and any organizer requirements remain separate.

Further sphere adaptation: arrow shaft and head changed to red at the owner's request. Tutorial/report layouts now share the original Qriollo card composer's glass frame and circuitStrip; the Qollab sphere credit is preserved in each view.

Further adaptation: Qiskit trajectory segments are colored by their responsible gate, sharing gate-colors.js with the original Qriollo composer. Ordered legends and step-specific dash patterns were added; the red arrow and upstream attribution are preserved.

Further sphere adaptation: per-prefix teaching views dim earlier gate paths and replay the current Qiskit segment. Teaching text/formulas and report integration are original game code; the underlying canvas source credit and license disclosure remain.

card-effects.js is original game code: probability clipping of the owner-supplied atlas, animated SVG wave/orbit and presentation-only collapse. No new raster asset or external library was introduced. Compact measured-state spheres continue to use the declared Qollab adaptation.
