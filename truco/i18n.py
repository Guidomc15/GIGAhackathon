"""English versions of engine messages. Spanish stays the canonical text in the code."""
ERRORS = {
    'Carta inválida': 'Invalid card',
    'Seleccioná un simulador IonQ; este backend no está identificado como IonQ': 'Select an IonQ simulator; this backend is not identified as IonQ',
    'Seguí la indicación de Bot Q para continuar.': 'Follow Bot Q’s instruction to continue.',
    'Resultado sin probabilidades válidas': 'Result without valid probabilities',
    'Resultado inválido': 'Invalid result',
    'Reparto inválido: tres cartas por jugador': 'Invalid deal: three cards per player',
    'Reparto inválido: cartas repetidas': 'Invalid deal: repeated cards',
    'Reparto inválido: fichas': 'Invalid deal: tokens',
    'Lección inválida': 'Invalid lesson',
    'Qollab permite un solo job IonQ por ejecución. No se inventará una segunda medición': 'Qollab allows one IonQ job per run. A second measurement will not be invented',
    'Orden/formato de bits no reconocido: se esperaba un bit': 'Unrecognised bit order/format: one bit was expected',
    'No se verificó que el backend sea simulador. No se enviará a hardware': 'The backend was not verified as a simulator. Nothing will be sent to hardware',
    'No hay medición pendiente o lote incompleto': 'No pending measurement, or incomplete batch',
    'No hay job remoto para consultar': 'There is no remote job to query',
    'No hay circuitos para medir': 'There are no circuits to measure',
    'Modo inválido': 'Invalid mode',
    'Modo cuántico inválido': 'Invalid quantum mode',
    'Medición inválida': 'Invalid measurement',
    'Mano inválida': 'Invalid mano',
    'La carta ya fue medida': 'The card was already measured',
    'La carta no está disponible para medir': 'The card is not available to measure',
    'Iniciá una partida': 'Start a game',
    'Ingresá dos nombres de hasta 30 caracteres': 'Enter two names of up to 30 characters',
    'Hay una medición pendiente. Completala o consultá su resultado antes de cambiar de partida o lección.': 'A measurement is pending. Complete it or check its result before changing game or lesson.',
    'Falta necesita el marcador': 'Falta needs the score',
    'Elegí una carta': 'Choose a card',
    'Elegí exactamente una carta': 'Choose exactly one card',
    'El servidor local solo admite modo de desarrollo': 'The local server only supports development mode',
    'Distribución inválida': 'Invalid distribution',
    'Dificultad inválida': 'Invalid difficulty',
    'Consultá el resultado IonQ pendiente antes de cambiar el modo de medición.': 'Check the pending IonQ result before changing the measurement mode.',
    'Confirmá antes de medir': 'Confirm before measuring',
    'Circuito inválido: hasta tres compuertas': 'Invalid circuit: up to three gates',
    'Circuito confirmado: no puede cambiar': 'Circuit confirmed: it cannot change',
    'Carta no disponible': 'Card not available',
    'Cada ficha se usa una vez; máximo tres': 'Each token can be used once; three at most',
    'Acción inválida para este estado': 'Invalid action for this state',
    'Privacidad inválida': 'Invalid privacy setting',
    'IonQ sigue pendiente. Reintentar consulta retoma el mismo job': 'IonQ is still pending. Retrying resumes the same job',
    'No se pudo validar el resultado IonQ; no se asignó una identidad': 'The IonQ result could not be validated; no identity was assigned',
    'IonQ informó error o cancelación; no hay resultado de juego': 'IonQ reported an error or cancellation; there is no game result',
    'Guion del tutorial desincronizado': 'Tutorial script out of sync',
    'El envío anterior tiene estado incierto. No se enviará otro job que pueda duplicar la medición': 'The previous submission has an uncertain state. No job that could duplicate the measurement will be sent',
    'Modo difícil: ya usaste tus 2 retiros de compuertas en esta mano': 'Hard mode: you already used your 2 gate removals this hand',
}
import re
PATTERNS = (
    (r'^En el tutorial, seguí la indicación de Bot Q: (.*)$', r'In the tutorial, follow Bot Q’s instruction: \1'),
    (r'^Falló el envío \((.*)\); estado remoto incierto\. No se reenviará automáticamente$', r'Submission failed (\1); remote state uncertain. It will not be resent automatically'),
    (r'^Falló la operación \((.*)\)\. No se generó un resultado\.$', r'The operation failed (\1). No result was produced.'),
)


def error_text(message, lang):
    """Translate an engine error; unknown messages are returned unchanged."""
    if lang != 'en': return message
    if message in ERRORS: return ERRORS[message]
    for spanish, english in PATTERNS:
        if re.match(spanish, message): return re.sub(spanish, english, message)
    return message
