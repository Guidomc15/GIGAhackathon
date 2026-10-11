# Volver a una versión anterior

Para volver a **0.2.1** (con ruido educativo y lecciones anteriores) usá el tag `v0.2.1` (`c7ef21d`) y su `QOLLAB_0.2.1.zip`, con los mismos pasos que se describen abajo para `v0.2.0`.

## Volver a 0.2.0

El tag remoto **v0.2.0** conserva exactamente el commit `5a96b4fd534ac5c7fd961866a163d21711d4e719`, anterior a los cambios de 0.2.1. No se reemplaza ese tag ni se borra la rama `codex/0.2.0-polish`.

También se conserva **v0.1.9**, en `6576cce6acc8bb18359c2aedd6c95fea4f228945`: era el contenido de `main` antes de publicar esta actualización. Elegí ese tag si necesitás recuperar exactamente el GitHub anterior, o `v0.2.0` para la entrega plana anterior de Qollab. Ninguna publicación reescribe los commits previos.

## En Qollab

Abrí el tag `v0.2.0` en GitHub y descargá su `QOLLAB_0.2.0.zip`. Detené Qollab, reemplazá los archivos incluidos por esas versiones y volvé a ejecutar como JS / Qiskit. Los módulos extra de 0.2.1 no se importan desde el `main.js` anterior. Las partidas no se migran entre ejecuciones.

## Probar la versión anterior en Git

Desde un checkout sin cambios pendientes:

```sh
git fetch origin --tags
git switch --detach v0.2.0
```

Para regresar a la versión actual:

```sh
git switch main
```

## Restaurar main conservando el historial

Desde un checkout sin cambios pendientes, creá una rama de restauración y un nuevo commit; no hace falta hacer force push:

```sh
git fetch origin --tags
git switch -c restore-0.2.0 origin/main
git restore --source v0.2.0 --staged --worktree .
git commit -m "Restore playable v0.2.0"
git push -u origin restore-0.2.0
```

Integrá esa rama para devolver main a la entrega anterior. El tag `v0.2.1` seguirá permitiendo recuperar la versión nueva.
