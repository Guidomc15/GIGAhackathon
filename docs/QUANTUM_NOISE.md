# Ruido cuántico educativo

Un qubit no queda necesariamente inmóvil mientras esperamos. Su entorno puede intercambiar energía con él y reducir la coherencia necesaria para interferir. Se eligieron dos canales conocidos: **relajación de amplitud hacia |0⟩** y **desfasaje**.

Es un modelo educativo de un qubit independiente. No reproduce un chip específico ni afirma ventaja cuántica. Los segundos están ampliados para hacer visible el efecto y permitir leer.

## Del ejemplo al cálculo

H desde |0⟩ prepara 50/50. En este modelo, con T₁ = 60 s:

| Tiempo educativo | Original P(0) | Ligada P(1) |
| --- | --- | --- |
| 0 s | 50,00 % | 50,00 % |
| 15 s | 61,06 % | 38,94 % |
| 30 s | 69,67 % | 30,33 % |
| 60 s | 81,61 % | 18,39 % |

La relajación mueve población de |1⟩ hacia |0⟩. El desfasaje reduce coherencia, pero por sí solo no altera los porcentajes de una medición en la base 0/1. Un estado inicial |0⟩ permanece allí en este modelo: ruido no significa que toda probabilidad tenga que cambiar.

## Canal empleado

Partimos del circuito ideal, calculado con Qiskit. Para el tiempo activo t:

- γ = 1 − exp(−t/T₁).
- A₀ = diag(1, √(1−γ)); A₁ = [[0, √γ], [0, 0]].
- p = (1 − exp(−t/Tφ))/2.
- D₀ = √(1−p) I; D₁ = √p Z.
- ρ(t) = Σⱼ Dⱼ (Σᵢ Aᵢ ρ(0) Aᵢ†) Dⱼ†.

Se utiliza `DensityMatrix.evolve(Kraus(...))` en Qiskit. T₁ = 60 s, Tφ = 90 s y 1/T₂ = 1/(2T₁) + 1/Tφ, de modo que T₂ ≈ 51,43 s y T₂ ≤ 2T₁. El equilibrio de amplitud se eligió en |0⟩.

La solución analítica usada para verificarlo es:

```text
P(1,t) = P(1,0) exp(-t/T1)
P(0,t) = 1 - P(1,t)
X(t) = X(0) exp(-t/T2)
Y(t) = Y(0) exp(-t/T2)
Z(t) = 1 + (Z(0)-1) exp(-t/T1)
```

La matriz puede describir un estado mixto: su vector de Bloch puede quedar dentro de la esfera. No se inventa un único par de amplitudes para ese estado. Las diagonales de ρ son las probabilidades mostradas; la misma ρ se utiliza en `DensityMatrix.sample_memory(1)`. El registro guarda tiempo, constantes, probabilidades y resultado. No se mide mientras el reloj se actualiza.

## Reloj del juego

Empieza después de confirmar el circuito y solo corre durante decisiones visibles de su dueño. Los ticks del navegador se validan por jugador, mano, fase e intervalo; no modifican cartas del rival. El modelo no es un reloj de seguridad para competencia online: este juego comparte un dispositivo y no tiene multijugador por red.

Se pausa al leer avisos, consultar ayudas desplegadas, pasar el dispositivo en privado, abrir el menú o esconder la pestaña. No corre durante mediciones o tránsito de la API. El resultado medido se conserva durante la mano. Así, elegir un temporizador más lento no castiga al jugador.

El ruido está activado inicialmente en **simulación local** y se puede quitar al iniciar. Las partidas remotas IonQ no reciben estos canales ni se convierten a locales automáticamente. El tutorial final permite simular 0/15/30/60 s y medir con Qiskit local.

## Fuentes oficiales

Se consultaron las implementaciones y documentación mantenidas por Qiskit:

- [Qiskit · representación de Kraus](https://github.com/Qiskit/qiskit/blob/main/qiskit/quantum_info/operators/channel/kraus.py): ρ → Σ AᵢρAᵢ†.
- [Qiskit Aer · canales estándar](https://github.com/Qiskit/qiskit-aer/blob/main/qiskit_aer/noise/errors/standard_errors.py): `thermal_relaxation_error`, `amplitude_damping_error`, `phase_damping_error`, condición T₂ ≤ 2T₁ y equilibrio.

Referencias de API para ampliar:

- [IBM Quantum · DensityMatrix](https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.quantum_info.DensityMatrix).
- [IBM Quantum · Kraus](https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.quantum_info.Kraus).
- [IBM Quantum · compuertas](https://quantum.cloud.ibm.com/docs/en/api/qiskit/circuit_library).

Las reglas del juego se documentan como una variante explícita de dos jugadores a 15 puntos, no como una regla universal para toda región.
