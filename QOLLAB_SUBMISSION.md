# Texto de proyecto · 0.2.3

Qriollo enseña computación cuántica jugando al Truco argentino. Dos personas convierten una carta en un qubit y juegan a 15 puntos. Las compuertas, su orden, la fase y la medición deciden la identidad de esa carta (la original o su ligada: basto ↔ oro, copa ↔ espada), su fuerza y sus tantos. La interfaz está en español e inglés.

El tutorial tiene tres partes:
- diapositivas interactivas con las reglas del Truco y la carta cuántica;
- una práctica contra Bot Q con desafíos y preguntas rápidas;
- nueve lecciones de compuertas con la esfera de Bloch animada.

Hay niveles Aprendizaje y Difícil.

El motor usa Qiskit para los circuitos, las trayectorias y las mediciones. Cada medición se puede revisar en el resumen de la mano y en la consola del navegador. La entrega 0.2.3 es un ZIP plano para JS / Qiskit. Las partidas completas se juegan en simulación local explícita; el adaptador IonQ conserva el límite observado de un job por ejecución.

Fuente: https://github.com/Guidomc15/GIGAhackaton

Equipo: Guido Miniero Cocco, Alejo Dellape y Gaspar Osterrieth.

Código original MIT. Los recursos visuales y la música los aportó el equipo, y la esfera adapta el ejemplo Interactive Bloch Sphere de Qollab. La asistencia de OpenAI Codex y Claude (Anthropic) está declarada en los avisos.

This effort is supported by Qollab & IonQ.
