# Qriollo · resumen técnico 0.2.3

El juego conecta un circuito de un qubit con decisiones concretas de Truco: las compuertas cambian la probabilidad de que una carta conserve su palo o pase a su «ligada», lo que altera su fuerza y sus tantos de Envido, sin sumar puntos artificiales por usar compuertas.

Pensado para un público internacional: toda la interfaz está en español e inglés y se cambia en cualquier momento. El tutorial tiene dos partes: diapositivas interactivas con las reglas y una práctica contra Bot Q con desafíos y preguntas (cuatro manos, la última con la carta cuántica) y nueve lecciones de compuertas y esfera de Bloch con animaciones, analogías del juego y combinaciones clave. Los ejes de la esfera y las letras X, Y, Z de los textos comparten color. Hay un nivel Difícil que limita los retiros de compuertas.

Qiskit calcula prefijos de circuito, trayectorias en la esfera y mediciones reales. Las 49 pruebas Python verifican reglas, estado, privacidad, medición única, niveles, el tutorial en los dos idiomas, las lecciones y el adaptador remoto con dobles. Chromium verifica interfaz, idiomas, tutorial, controles, sonido y scroll. [Alcance de la evidencia](TESTING.md).

La aplicación no afirma ventaja cuántica ni usa entrelazamiento: son dos qubits independientes, uno por jugador. En Qollab, el límite observado de un job IonQ por ejecución hace que las partidas completas usen simulación local explícita.

Arte, música, esfera de Qollab y asistencia de IA declarados en [avisos](THIRD_PARTY_NOTICES.md).

This effort is supported by Qollab & IonQ.
