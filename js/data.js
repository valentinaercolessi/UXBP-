// Datos mockeados para simular resultados de búsqueda (sin backend real).
const TRIPS = [
  {
    id: 1,
    nombre: 'Mendoza',
    categoria: 'Destino',
    precio: 500000,
    porNoche: false,
    imagen: 'assets/images/mendoza.png',
    intereses: ['montana', 'gastronomia'],
    inicio: '2025-10-01',
    fin: '2025-10-31',
    fotoCategoria: 'montana',
    fotoSeed: 0,
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Zonda Hotel & Spa', habitacion: 'Habitación Superior', desayuno: true },
  },
  {
    id: 2,
    nombre: 'Panamá',
    categoria: 'Destino',
    precio: 699000,
    porNoche: false,
    imagen: 'assets/images/panama.png',
    intereses: ['gastronomia', 'arte'],
    inicio: '2025-10-01',
    fin: '2025-10-31',
    fotoCategoria: 'playa',
    fotoSeed: 0,
    vuelo: { aerolinea: 'Copa Airlines' },
    alojamiento: { nombre: 'Trump Ocean Club', habitacion: 'Habitación Vista al Mar', desayuno: true },
  },
  {
    id: 3,
    nombre: 'Costão do Santinho',
    categoria: 'Alojamiento',
    precio: 84603,
    porNoche: true,
    imagen: 'assets/images/costao-do-santinho.png',
    intereses: ['montana'],
    inicio: '2025-10-01',
    fin: '2025-10-31',
    fotoCategoria: 'playa',
    fotoSeed: 1,
    vuelo: { aerolinea: 'GOL Linhas Aéreas' },
    alojamiento: { nombre: 'Costão do Santinho', habitacion: 'Habitación Standard', desayuno: true },
  },
  {
    id: 4,
    nombre: 'Novotel',
    categoria: 'Alojamiento',
    precio: 79999,
    porNoche: true,
    imagen: 'assets/images/novotel.png',
    intereses: ['historia', 'arte'],
    inicio: '2025-10-01',
    fin: '2025-10-31',
    fotoCategoria: 'ciudad',
    fotoSeed: 0,
    vuelo: { aerolinea: 'LATAM' },
    alojamiento: { nombre: 'Novotel', habitacion: 'Habitación Deluxe', desayuno: false },
  },
  {
    id: 5,
    nombre: 'Bariloche',
    categoria: 'Destino',
    precio: 420000,
    porNoche: false,
    imagen: 'assets/images/mendoza.png',
    intereses: ['montana'],
    inicio: '2025-10-10',
    fin: '2025-10-24',
    fotoCategoria: 'montana',
    fotoSeed: 1,
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Luma Boutique Hotel', habitacion: 'Habitación Deluxe', desayuno: true },
  },
  {
    id: 6,
    nombre: 'Cusco',
    categoria: 'Destino',
    precio: 610000,
    porNoche: false,
    imagen: 'assets/images/panama.png',
    intereses: ['historia', 'montana'],
    inicio: '2025-10-05',
    fin: '2025-10-20',
    fotoCategoria: 'montana',
    fotoSeed: 2,
    vuelo: { aerolinea: 'LATAM' },
    alojamiento: { nombre: 'Casa Andina Premium', habitacion: 'Habitación Ejecutiva', desayuno: true },
  },
  {
    id: 7,
    nombre: 'Roma',
    categoria: 'Destino',
    precio: 1450000,
    porNoche: false,
    imagen: 'assets/images/novotel.png',
    intereses: ['historia', 'arte', 'gastronomia'],
    inicio: '2025-10-12',
    fin: '2025-10-28',
    fotoCategoria: 'ciudad',
    fotoSeed: 1,
    vuelo: { aerolinea: 'ITA Airways' },
    alojamiento: { nombre: 'Hotel Artemide', habitacion: 'Habitación Classic', desayuno: false },
  },
  {
    id: 8,
    nombre: 'Hotel Costa Azul',
    categoria: 'Alojamiento',
    precio: 65000,
    porNoche: true,
    imagen: 'assets/images/costao-do-santinho.png',
    intereses: ['gastronomia'],
    inicio: '2025-10-01',
    fin: '2025-10-15',
    fotoCategoria: 'playa',
    fotoSeed: 2,
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Hotel Costa Azul', habitacion: 'Habitación Doble', desayuno: true },
  },
  {
    id: 9,
    nombre: 'San Telmo Boutique',
    categoria: 'Alojamiento',
    precio: 52000,
    porNoche: true,
    imagen: 'assets/images/novotel.png',
    intereses: ['arte', 'historia'],
    inicio: '2025-10-08',
    fin: '2025-10-31',
    fotoCategoria: 'ciudad',
    fotoSeed: 2,
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'San Telmo Boutique', habitacion: 'Habitación Loft', desayuno: false },
  },
  {
    id: 10,
    nombre: 'Salta',
    categoria: 'Destino',
    precio: 380000,
    porNoche: false,
    imagen: 'assets/images/mendoza.png',
    intereses: ['montana', 'historia'],
    inicio: '2025-10-01',
    fin: '2025-10-18',
    fotoCategoria: 'montana',
    fotoSeed: 3,
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Legado Mítico Salta', habitacion: 'Habitación Patio', desayuno: true },
  },
];

// Fotos "de la comunidad" mockeadas para el carrusel de la pantalla de viaje recomendado,
// agrupadas por temática para que cada destino muestre fotos acordes (montaña, playa, ciudad).
// Cada viaje arma su propio subset (ver getFeedForTrip) para que destinos de la misma
// categoría no muestren siempre el mismo orden.
const PHOTO_POOLS = {
  montana: [
    'assets/images/feed/mountain-lakeforest.jpg',
    'assets/images/feed/mountain-coastforest.jpg',
    'assets/images/feed/mountain-hiker.jpg',
    'assets/images/feed/mountain-forestpath.jpg',
    'assets/images/feed/mountain-snowpine.jpg',
    'assets/images/feed/mountain-sunsetfield.jpg',
    'assets/images/feed/bariloche-lago.jpg',
    'assets/images/feed/mountain-kayak.jpg',
    'assets/images/feed/mountain-canyon.jpg',
  ],
  playa: [
    'assets/images/feed/beach-coastrock.jpg',
    'assets/images/feed/beach-boatwake.jpg',
    'assets/images/feed/beach-waves.jpg',
    'assets/images/feed/beach-bluebay.jpg',
    'assets/images/feed/beach-bikewaterfront.jpg',
    'assets/images/feed/beach-wavecurl.jpg',
    'assets/images/feed/beach-darkwater.jpg',
  ],
  ciudad: [
    'assets/images/feed/city-cathedralnight.jpg',
    'assets/images/feed/city-vintagecars.jpg',
    'assets/images/feed/city-aerialgray.jpg',
    'assets/images/feed/city-bridgenight.jpg',
    'assets/images/feed/city-skylinehaze.jpg',
    'assets/images/feed/city-streetaerial.jpg',
  ],
};

const CAPTION_POOL = [
  { user: '@ale.mar', time: 'hace 2 días', inicial: 'A' },
  { user: '@violeta.rl', time: 'hace 10 días', inicial: 'V' },
  { user: '@juana.lopez', time: 'hace 1 semana', inicial: 'J' },
  { user: '@martin88', time: 'hace 13 días', inicial: 'M' },
  { user: '@mery.gomez', time: 'hace 5 días', inicial: 'M' },
  { user: '@fede.trip', time: 'hace 3 días', inicial: 'F' },
  { user: '@caro.viajera', time: 'hace 1 día', inicial: 'C' },
  { user: '@nachoo_ok', time: 'hace 8 días', inicial: 'N' },
];

// Arma las 5 fotos del carrusel para un viaje, todas de su categoría temática (montaña/playa/
// ciudad) para que se vean coherentes con el destino. Cada viaje tiene su propio fotoSeed
// (a mano, sin colisiones) para que destinos de la misma categoría no repitan el mismo orden.
function getFeedForTrip(trip) {
  const pool = PHOTO_POOLS[trip.fotoCategoria] || PHOTO_POOLS.ciudad;
  const cantidad = Math.min(5, pool.length);
  const seed = (trip.fotoSeed || 0) * 2;
  const fotos = Array.from({ length: cantidad }, (_, i) => pool[(seed + i) % pool.length]);

  return fotos.map((src, i) => ({
    src,
    ...CAPTION_POOL[(seed * 3 + i) % CAPTION_POOL.length],
  }));
}

// Parsea "YYYY-MM-DD" como fecha local (evita corrimientos de huso horario
// que ocurren al usar new Date() directo con strings ISO sin hora).
function parseLocalDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Busca viajes que cumplan con el presupuesto, rango de fechas, intereses y texto libre.
// Cualquier filtro vacío/sin definir se ignora (no restringe los resultados).
function buscarViajes({ presupuesto, inicio, fin, intereses, texto }) {
  return TRIPS.filter((trip) => {
    if (presupuesto > 0 && trip.precio > presupuesto) return false;

    if (inicio && fin) {
      const tripInicio = parseLocalDate(trip.inicio);
      const tripFin = parseLocalDate(trip.fin);
      if (fin < tripInicio || inicio > tripFin) return false;
    }

    if (intereses.length && !trip.intereses.some((i) => intereses.includes(i))) return false;

    if (texto && !trip.nombre.toLowerCase().includes(texto.toLowerCase())) return false;

    return true;
  });
}

// Elige el viaje "más viable" dentro de los resultados: prioriza más intereses en común
// y, a igualdad, el precio más cercano al presupuesto disponible (mejor aprovechamiento).
// Sin presupuesto definido, "viable" se interpreta como más económico.
function elegirMasViable(trips, { presupuesto, intereses }) {
  return [...trips].sort((a, b) => {
    const matchesA = a.intereses.filter((i) => intereses.includes(i)).length;
    const matchesB = b.intereses.filter((i) => intereses.includes(i)).length;
    if (matchesA !== matchesB) return matchesB - matchesA;

    if (presupuesto > 0) return Math.abs(presupuesto - a.precio) - Math.abs(presupuesto - b.precio);

    return a.precio - b.precio;
  })[0];
}
