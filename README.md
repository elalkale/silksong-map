# Silksong Interactive Map

Mapa interactivo para Hollow Knight: Silksong con todos los marcadores del juego.

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

Abre el navegador en **http://localhost:3000**

## Controles

| Acción | Método |
|---|---|
| Mover mapa | Click + arrastrar |
| Zoom | Rueda del ratón / botones +/- |
| Zoom teclado | Teclas `+` / `-` |
| Resetear vista | Tecla `0` o botón ⌂ |
| Buscar | Tecla `f` o clic en el buscador |
| Cerrar selección | `Escape` |
| Marcar completado | Click en marcador → botón |

## Categorías

- 🟡 **Bancos** — Puntos de guardado y descanso
- 🟢 **NPCs** — Personajes con los que hablar
- 🔴 **Jefes** — Enemigos principales
- 🟣 **Coleccionables** — Fragmentos y plumas
- 🔵 **Habilidades** — Poderes de Hornet
- 🟠 **Secretos** — Zonas ocultas
- 🩵 **Tiendas** — Comercios

## Características

- Progreso persistido en servidor (archivo `data/progress.json`)
- Filtros por categoría
- Buscador en tiempo real
- Ocultar/mostrar marcadores completados
- Zoom y paneo suave
- Tooltips al pasar el ratón
- Zoom táctil (pinch) para móvil

## Estructura

```
silksong-map/
├── server.js              # Express server
├── data/
│   ├── markers.js         # Datos de marcadores (backend)
│   └── progress.json      # Progreso guardado (auto-generado)
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── markers-data.js  # Datos de marcadores (frontend)
│   │   └── app.js           # Lógica principal
│   └── images/
│       └── map.webp         # Imagen del mapa
```

## Añadir marcadores

Edita `public/js/markers-data.js` y añade objetos al array `MARKERS_DATA`:

```js
{
  id: 'mi_marcador_01',    // ID único
  type: 'npc',             // bench | npc | boss | collectible | skill | secret | shop
  name: 'Nombre del NPC',
  area: 'Nombre de la zona',
  x: 45.2,                 // posición horizontal (0-100%)
  y: 33.8,                 // posición vertical (0-100%)
  desc: 'Descripción detallada del marcador.',
}
```

> **Tip:** Las coordenadas X e Y se muestran en la esquina inferior izquierda del mapa mientras mueves el ratón. Úsalas para colocar marcadores con precisión.
