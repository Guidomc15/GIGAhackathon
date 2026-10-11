# Qriollo · Truco Cuántico 0.2.2

Un juego para aprender computación cuántica jugando al Truco argentino. Dos personas comparten un dispositivo, convierten una carta en un qubit y compiten hasta 15 puntos. La interfaz completa está en **español e inglés** (🌐 en cualquier pantalla); Truco, Envido, Quiero y los demás cantos conservan su nombre.

**[English overview](docs/README.en.md)** · [Ejecutar localmente](RUNNING.md) · [Subir o actualizar Qollab](QOLLAB_UPDATE.md) · [Pruebas](TESTING.md) · [Cambios](CHANGELOG.md)

This effort is supported by Qollab & IonQ.

## Jugar

Con Python 3.12, desde la raíz del repositorio:

```sh
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python serve.py
```

Abrí el puerto 8000 en el navegador. En Windows usá `.venv\Scripts\python.exe`. No se necesitan claves ni base de datos. [Más detalles](RUNNING.md).

Para Qollab, descomprimí **[QOLLAB_0.2.2.zip](QOLLAB_0.2.2.zip)** y cargá sus archivos como **JS / Qiskit**. Es una entrega sin carpetas. **Incluye módulos nuevos (`i18n.js`, `music-data.js`): cambiar solamente `main.js` no alcanza.** [Instrucciones](QOLLAB_UPDATE.md).

## Qué hay en 0.2.2

- **Español e inglés** en toda la app. El idioma inicial sigue al navegador y se cambia en cualquier momento con 🌐, también en mitad de una partida. El motor devuelve pistas y errores en el idioma elegido.
- **Tutorial en dos partes.** *Truco con Bot Q*: 15 diapositivas interactivas con las reglas (cartas, escala, bazas, Truco y Envido) y una práctica de cuatro manos (33 pasos) con desafíos y preguntas rápidas: si elegís mal, la jugada no se hace y Bot Q da una pista. La cuarta mano introduce la carta cuántica. *Compuertas y esfera de Bloch*: nueve lecciones con esfera animada, analogías del juego y porcentajes calculados por Qiskit.
- **Niveles.** Aprendizaje: compuertas sin límite. Difícil: cada jugador puede sacar compuertas solo 2 veces por mano (reordenar no cuenta).
- **Confirmar**: el circuito se cierra con un único botón.
- **Ejes de colores.** En la esfera X es coral, Y violeta y Z celeste, y las letras X, Y, Z de las explicaciones usan el mismo color.
- **Pantallas sin barra de desplazamiento** en escritorio (desde 900 × 540 px): mesa a la izquierda, guía y cantos a la derecha. En celulares la página sigue siendo vertical.
- **Inicio nuevo** según el boceto del equipo: logo de Qriollo, lema «Una forma bien argenta de aprender computación cuántica», placas Tutorial · Partida rápida · Ayuda rápida · Créditos y la carta Q con la esfera de Bloch. Partida rápida empieza directo (nombres por defecto, nivel Aprendizaje, simulación local); «Partida personalizada» abre la configuración completa.
- **Música** nueva en bucle, con volumen y silencio propios.
- Se quitaron el ruido cuántico educativo y la rotación π/67.

## Cómo funciona la carta cuántica

Al empezar cada mano, cada jugador elige una carta. Su identidad «ligada» conserva el número y cambia el palo (espada ↔ copa, basto ↔ oro). Con hasta tres fichas de compuertas (H, X, Z, RX, RY, RZ con ángulos fijos de 30°, −30°, 60° y 90°) cambia las probabilidades de cada identidad. La carta se mide una sola vez, al jugarla o al aceptar un Envido, y desde ese momento su identidad queda fija. Qiskit calcula las vistas previas, las trayectorias y las mediciones.

## Variante de Truco

Dos jugadores, a 15 puntos y sin Flor. Falta Envido vale **15 menos el puntaje de quien va adelante**. Se reparten seis parejas de cartas distintas para evitar duplicados después de un cambio de palo. Las reglas completas, separadas por secciones, están en «Cómo jugar».

## Código

| Archivo o carpeta | Función |
| --- | --- |
| `truco/` | Reglas, estado de partida, Qiskit, niveles, textos en inglés del motor, guion de los tutoriales y API de sesión |
| `main.js`, `ui.js`, `main.css` | Interfaz y controles |
| `i18n.js`, `learning.js` | Idioma de la interfaz, colores de los ejes y reglas bilingües |
| `presentation.js`, `preferences.js`, `sound.js`, `music-data.js`, `phrases.js` | Avisos, ajustes, música, voces y cantos |
| `serve.py`, `local-engine.js` | Servidor y puente HTTP de desarrollo local |
| `qollab_engine.py` | Motor generado en un archivo para Qollab; no editar a mano |
| `build_qollab.py` | Regenera el motor y el ZIP plano; verifica que coincidan con las fuentes |
| `tests/`, `.github/workflows/` | Pruebas reproducibles y validación continua |
| `docs/history/` | Registros de versiones anteriores |

Tras modificar `truco/*.py` o archivos de la entrega:

```sh
python build_qollab.py --zip QOLLAB_0.2.2.zip
python build_qollab.py --check --verify-zip QOLLAB_0.2.2.zip
.venv/bin/python -m unittest discover -s tests -v
```

## Versiones

`v0.2.1` (`c7ef21d`) conserva la versión anterior, con el ruido educativo y las lecciones previas. [Cómo volver a una versión anterior](docs/ROLLBACK.md).

La partida y las preferencias viven en memoria o en el navegador. El proyecto no tiene multijugador por red. En Qollab, el adaptador IonQ conserva el límite observado de un job por ejecución: las partidas completas usan simulación local explícita y el tutorial siempre mide con Qiskit local.

Código original MIT; arte, música, esfera adaptada, dependencias y asistencia de IA declarados en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Colaboradores: Guido Miniero Cocco, Alejo Dellape y Gaspar Osterrieth
