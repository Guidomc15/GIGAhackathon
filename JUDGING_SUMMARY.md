# Qriollo · resumen técnico 0.2.3

Qriollo conecta un circuito de un qubit con decisiones concretas de Truco. Las compuertas cambian la probabilidad de que una carta conserve su palo o pase a su carta ligada (basto ↔ oro, copa ↔ espada). Eso cambia su fuerza y sus tantos de Envido, sin sumar puntos artificiales por usar compuertas.

**Aprender:** toda la interfaz está en español e inglés y se cambia en cualquier momento. El tutorial tiene tres partes:
- 17 diapositivas interactivas con las reglas y la carta cuántica;
- una práctica contra Bot Q con desafíos y preguntas, en la que una jugada incorrecta no se hace y recibe una pista;
- nueve lecciones de compuertas con la esfera de Bloch animada.

La esfera rotula sus seis polos, y los ejes y las letras X, Y, Z de los textos comparten color. El nivel Difícil limita los retiros de compuertas.

**Qiskit:** calcula los prefijos del circuito, las trayectorias en la esfera y las mediciones. Cada medición se puede revisar en el resumen de la mano y en la consola del navegador, con su registro (backend, compuertas, resultado y método).

**Evidencia:**
- 49 pruebas Python verifican reglas, estado, privacidad, medición única, niveles, el tutorial en los dos idiomas, las lecciones y el adaptador remoto con dobles de prueba.
- Seis pruebas de Chromium recorren la interfaz, las diapositivas, la práctica completa, los idiomas, las voces y el scroll.
- [Alcance de las pruebas](TESTING.md).

**Lo que no afirma:** no hay ventaja cuántica ni entrelazamiento; son dos qubits independientes, uno por jugador. En Qollab, el límite observado de un job IonQ por ejecución hace que las partidas completas usen simulación local explícita.

Arte, esfera de Qollab y asistencia de IA están declarados en los [avisos](THIRD_PARTY_NOTICES.md).

This effort is supported by Qollab & IonQ.
