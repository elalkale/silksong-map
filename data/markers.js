// markers.js — fuente única de datos de marcadores
// Edita SOLO este archivo para añadir/modificar/eliminar marcadores
// Formato: { id, type, name, area, x, y, desc }
// x e y son porcentajes (0-100) del tamaño total del mapa

const MARKERS = [
  // ── BANCOS ──
  { id:'bench_01', type:'bench', name:'Banco — Gusaneras', area:'Gusaneras', x:14.6, y:65.4, desc:'Banco de descanso en las Gusaneras.' },
  { id:'bench_02', type:'bench', name:'Banco — Blasted Steps', area:'Blasted Steps', x:21.0, y:55.3, desc:'Banco de descanso en las Blasted Steps.' },
  { id:'bench_03', type:'bench', name:'Banco', area:'Blasted Steps', x:12.2, y:50.0, desc:'Banco de descanso en las Blasted Steps.' },
  { id:'bench_04', type:'bench', name:'Banco', area:'Blasted Steps', x:21.9, y:46.4, desc:'Banco de descanso en las Blasted Steps.' },
  { id:'bench_05', type:'bench', name:'Banco', area:'Sands of Karak', x:11.5, y:34.0, desc:'Banco de descanso de Torre del coral.' },
  { id:'bench_06', type:'bench', name:'Banco', area:'Mount Fay', x:10.2, y:28.2, desc:'Banco de descanso de Mount Fay.' },


  // ── NPCS ──
  { id: 'npc_01', type: 'npc', name: 'Sula', area: 'gruta de musgo', x: 8.8, y: 76.7, desc: 'Steel Soul mode only!' },
  { id: 'npc_02', type: 'npc', name: 'Snail Shamans', area: 'gruta de musgo', x: 18.9, y: 76.1, desc: 'Acto 3' },

  // ── JEFES ──
  { id:'boss_01', type:'boss', name:'Jefe — Grandes Salones', area:'Hohe Hallen', x:50.5, y:17.5, desc:'Guardián de los Grandes Salones. Primer jefe principal. Ataques en arco y embestidas rápidas.' },


  // ── COLECCIONABLES ──
  { id:'col_01', type:'collectible', name:'Fragmento de Máscara', area:'Hohe Hallen', x:45.5, y:22.5, desc:'Aumenta la vida máxima de Hornet. Necesitas 2 fragmentos para completar una máscara.' },


  // ── HABILIDADES ──
  { id:'skill_01', type:'skill', name:'Escalada de Seda', area:'Hohe Hallen', x:53.0, y:20.5, desc:'Permite a Hornet escalar paredes especiales cubiertas de seda.' },


  // ── SECRETOS ──
  { id:'secret_01', type:'secret', name:'Zona Oculta', area:'Hohe Hallen', x:44.5, y:20.0, desc:'Área secreta detrás de una pared falsa. Contiene un coleccionable raro y una inscripción de lore.' },


  // ── TIENDAS ──
  { id:'shop_01', type:'shop', name:'Tienda — Grandes Salones', area:'Hohe Hallen', x:47.5, y:23.5, desc:'Vende reliquias, amuletos y el mapa del área. El primer comercio que encontrarás.' },

];

module.exports = MARKERS;