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
    aeropuertoOrigen: 'AEP',
    aeropuertoDestino: 'MDZ',
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Zonda Hotel & Spa', habitacion: 'Habitación Superior', desayuno: true, capacidad: '2 personas', distancia: '2.1km del centro' },
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
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'PTY',
    vuelo: { aerolinea: 'Copa Airlines' },
    alojamiento: { nombre: 'Trump Ocean Club', habitacion: 'Habitación Vista al Mar', desayuno: true, capacidad: '2 personas', distancia: '350m de la playa' },
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
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'FLN',
    vuelo: { aerolinea: 'GOL Linhas Aéreas' },
    alojamiento: { nombre: 'Costão do Santinho', habitacion: 'Habitación Standard', desayuno: true, capacidad: '2 personas', distancia: '120m de la playa' },
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
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'FLN',
    vuelo: { aerolinea: 'LATAM' },
    alojamiento: { nombre: 'Novotel', habitacion: 'Habitación Deluxe', desayuno: false, capacidad: '2 personas', distancia: '600m del centro' },
  },
  {
    id: 5,
    nombre: 'Bariloche',
    categoria: 'Destino',
    precio: 420000,
    porNoche: false,
    imagen: 'assets/images/bariloche.jpg',
    intereses: ['montana'],
    inicio: '2025-10-10',
    fin: '2025-10-24',
    fotoCategoria: 'montana',
    fotoSeed: 1,
    aeropuertoOrigen: 'AEP',
    aeropuertoDestino: 'BRC',
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Luma Boutique Hotel', habitacion: 'Habitación Deluxe', desayuno: true, capacidad: '2 personas', distancia: '490m del centro' },
  },
  {
    id: 6,
    nombre: 'Cusco',
    categoria: 'Destino',
    precio: 610000,
    porNoche: false,
    imagen: 'assets/images/cusco.jpg',
    intereses: ['historia', 'montana'],
    inicio: '2025-10-05',
    fin: '2025-10-20',
    fotoCategoria: 'montana',
    fotoSeed: 2,
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'CUZ',
    vuelo: { aerolinea: 'LATAM' },
    alojamiento: { nombre: 'Casa Andina Premium', habitacion: 'Habitación Ejecutiva', desayuno: true, capacidad: '2 personas', distancia: '800m de la plaza principal' },
  },
  {
    id: 7,
    nombre: 'Roma',
    categoria: 'Destino',
    precio: 1450000,
    porNoche: false,
    imagen: 'assets/images/roma.jpg',
    intereses: ['historia', 'arte', 'gastronomia'],
    inicio: '2025-10-12',
    fin: '2025-10-28',
    fotoCategoria: 'ciudad',
    fotoSeed: 1,
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'FCO',
    vuelo: { aerolinea: 'ITA Airways' },
    alojamiento: { nombre: 'Hotel Artemide', habitacion: 'Habitación Classic', desayuno: false, capacidad: '2 personas', distancia: '1.5km del Coliseo' },
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
    aeropuertoOrigen: 'EZE',
    aeropuertoDestino: 'FLN',
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Hotel Costa Azul', habitacion: 'Habitación Doble', desayuno: true, capacidad: '2 personas', distancia: '90m de la playa' },
  },
  {
    id: 9,
    nombre: 'San Telmo Boutique',
    categoria: 'Alojamiento',
    precio: 52000,
    porNoche: true,
    imagen: 'assets/images/san-telmo.jpg',
    intereses: ['arte', 'historia'],
    inicio: '2025-10-08',
    fin: '2025-10-31',
    fotoCategoria: 'ciudad',
    fotoSeed: 2,
    aeropuertoOrigen: 'AEP',
    aeropuertoDestino: 'AEP',
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'San Telmo Boutique', habitacion: 'Habitación Loft', desayuno: false, capacidad: '2 personas', distancia: '300m de Plaza Dorrego' },
  },
  {
    id: 10,
    nombre: 'Salta',
    categoria: 'Destino',
    precio: 380000,
    porNoche: false,
    imagen: 'assets/images/salta.jpg',
    intereses: ['montana', 'historia'],
    inicio: '2025-10-01',
    fin: '2025-10-18',
    fotoCategoria: 'montana',
    fotoSeed: 3,
    aeropuertoOrigen: 'AEP',
    aeropuertoDestino: 'SLA',
    vuelo: { aerolinea: 'Aerolíneas Argentinas' },
    alojamiento: { nombre: 'Legado Mítico Salta', habitacion: 'Habitación Patio', desayuno: true, capacidad: '2 personas', distancia: '1km del centro histórico' },
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

// "Otras opciones": viajes que NO son totalmente viables (no pasan buscarViajes)
// pero están cerca de serlo — le piden algo de flexibilidad al usuario porque se
// pasan del presupuesto por hasta $100.000, o porque sus fechas disponibles no
// coinciden con las pedidas. Si encajaran en todo ya serían viables, no "otras
// opciones". Un viaje que se pasa del presupuesto por más de $100.000 queda
// afuera igual: ya no es "cercano".
const FLEXIBILIDAD_PRESUPUESTO_MAX = 100000;

function buscarOtrasOpciones({ presupuesto, inicio, fin, intereses, texto }) {
  return TRIPS.filter((trip) => {
    if (intereses.length && !trip.intereses.some((i) => intereses.includes(i))) return false;
    if (texto && !trip.nombre.toLowerCase().includes(texto.toLowerCase())) return false;

    const excedePresupuesto = presupuesto > 0 && trip.precio > presupuesto;
    const sePasaDemasiado = excedePresupuesto && (trip.precio - presupuesto) > FLEXIBILIDAD_PRESUPUESTO_MAX;
    if (sePasaDemasiado) return false;

    let fechasNoCoinciden = false;
    if (inicio && fin) {
      const tripInicio = parseLocalDate(trip.inicio);
      const tripFin = parseLocalDate(trip.fin);
      fechasNoCoinciden = fin < tripInicio || inicio > tripFin;
    }

    // Ya es totalmente viable (no necesita flexibilidad) → no es "otra opción".
    if (!excedePresupuesto && !fechasNoCoinciden) return false;

    return true;
  }).sort((a, b) => {
    const matchesA = a.intereses.filter((i) => intereses.includes(i)).length;
    const matchesB = b.intereses.filter((i) => intereses.includes(i)).length;
    if (matchesA !== matchesB) return matchesB - matchesA;

    if (presupuesto > 0) return Math.abs(presupuesto - a.precio) - Math.abs(presupuesto - b.precio);

    return a.precio - b.precio;
  });
}

// Por qué una opción de "Otras opciones" no es 100% viable: cuánto se pasa del
// presupuesto o cuántos días la separan de las fechas pedidas (lo que aplique).
// Se muestra en esa pantalla y, si el viaje se termina guardando, también en
// Mis Viajes.
function formatDiferenciaOtras(trip, costoTotal, presupuesto, inicio, fin) {
  if (presupuesto > 0 && costoTotal > presupuesto) {
    return `${formatCurrency(costoTotal - presupuesto)} más que tu presupuesto`;
  }
  const tripInicio = parseLocalDate(trip.inicio);
  const tripFin = parseLocalDate(trip.fin);
  if (fin < tripInicio) {
    const diffDias = Math.round((tripInicio - fin) / 86400000);
    return `Disponible ${diffDias} día${diffDias === 1 ? '' : 's'} después de tus fechas`;
  }
  if (inicio > tripFin) {
    const diffDias = Math.round((inicio - tripFin) / 86400000);
    return `Disponible ${diffDias} día${diffDias === 1 ? '' : 's'} antes de tus fechas`;
  }
  return '';
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

// ---------- Pantalla de detalle ("Me interesa") ----------

// Alternativas de vuelo para el botón de refrescar: la primera (mult 1) reconstruye
// exactamente el precio original del viaje recomendado (el mínimo).
const FLIGHT_ALT_POOL = [
  { aerolinea: null, horaIda: '22:10', horaVuelta: '18:00', mult: 1 },
  { aerolinea: 'LATAM', horaIda: '07:45', horaVuelta: '20:30', mult: 0.93 },
  { aerolinea: 'JetSMART', horaIda: '14:20', horaVuelta: '09:15', mult: 1.08 },
];

// Alternativas de alojamiento para el botón de refrescar (mismo criterio: la primera
// reconstruye el hotel y precio originales). Cada una trae su propia foto real del
// hotel (exterior/interior), para que la imagen cambie junto con la opción elegida.
const HOTEL_ALT_POOL = [
  { nombre: null, habitacion: null, distancia: null, mult: 1, imagen: 'assets/images/feed/hotel-original.jpg' },
  { nombre: 'Aires del Sur Hotel', habitacion: 'Habitación Superior', distancia: '750m del centro', mult: 0.91, imagen: 'assets/images/feed/hotel-alt1-exterior.jpg' },
  { nombre: 'Costanera Suites', habitacion: 'Habitación Ejecutiva', distancia: '1.1km del centro', mult: 1.09, imagen: 'assets/images/feed/hotel-alt2-cabin.jpg' },
];

// Actividades: una por categoría de destino (montaña/playa/ciudad), con una foto que
// coincide exactamente con el texto Y con el tipo de destino (alguien haciendo trekking
// en la montaña, alguien en bici en la costa, alguien caminando por el centro). Más
// "Mirador panorámico", que siempre usa el paisaje propio de cada destino.
const ACTIVITIES_BY_CATEGORIA = {
  montana: [
    { nombre: 'Trekking guiado', precio: 28000, imagen: 'assets/images/feed/mountain-hiker.jpg' },
  ],
  playa: [
    { nombre: 'Paseo en bicicleta', precio: 15000, imagen: 'assets/images/feed/beach-bikewaterfront.jpg' },
    { nombre: 'Caminata por la costa', precio: 12000, imagen: 'assets/images/feed/beach-coastrock.jpg' },
  ],
  ciudad: [
    { nombre: 'Recorrido en bicicleta', precio: 15000, imagen: 'assets/images/feed/activity-ciclismo.jpg' },
    { nombre: 'Paseo a pie por el centro', precio: 8000, imagen: 'assets/images/feed/city-streetaerial.jpg' },
  ],
};

// Gastronomía: algunas son universales (café, medialunas, postre — se comen en
// cualquier destino), y una es propia de cada categoría para que se sienta local
// (asado en la montaña, mercado costero en la playa, comida casera en la ciudad).
const GASTRONOMIA_UNIVERSAL = [
  { nombre: 'Café de especialidad', precio: 8000, imagen: 'assets/images/feed/food-cafe.jpg' },
  { nombre: 'Medialunas y café', precio: 6000, imagen: 'assets/images/feed/food-medialunas.jpg' },
  { nombre: 'Postre casero', precio: 9000, imagen: 'assets/images/feed/food-postre.jpg' },
];

const GASTRONOMIA_BY_CATEGORIA = {
  montana: [
    { nombre: 'Asado a la parrilla', precio: 26000, imagen: 'assets/images/feed/food-asado.jpg' },
  ],
  playa: [
    { nombre: 'Mercado costero', precio: 15000, imagen: 'assets/images/feed/food-degustacion.jpg' },
  ],
  ciudad: [
    { nombre: 'Almuerzo casero', precio: 13000, imagen: 'assets/images/feed/food-almuerzo.jpg' },
  ],
};

function redondearCien(n) {
  return Math.round(n / 100) * 100;
}

// Divide el costo total del viaje (el mínimo sugerido) en vuelo (ida/vuelta) y
// alojamiento, aplicando los multiplicadores de las alternativas elegidas por el
// usuario al refrescar. Con los multiplicadores en 1 (las opciones originales),
// la suma reconstruye exactamente el costo total de la pantalla anterior.
function splitCosts(costoBase, flightMult, hotelMult) {
  const flightTotal = redondearCien(costoBase * 0.3 * flightMult);
  const hotelTotal = redondearCien(costoBase * 0.7 * hotelMult);
  const idaPrecio = redondearCien(flightTotal * 0.55);
  const vueltaPrecio = flightTotal - idaPrecio;
  return { flightTotal, hotelTotal, idaPrecio, vueltaPrecio, total: flightTotal + hotelTotal };
}

function getActividadesForTrip(trip) {
  const fotos = PHOTO_POOLS[trip.fotoCategoria] || PHOTO_POOLS.ciudad;
  const propias = ACTIVITIES_BY_CATEGORIA[trip.fotoCategoria] || ACTIVITIES_BY_CATEGORIA.ciudad;
  const mirador = { nombre: 'Mirador panorámico', precio: 5000, imagen: fotos[trip.fotoSeed % fotos.length] };
  return [...propias, mirador].map((act, i) => ({ ...act, id: `act-${i}` }));
}

function getGastronomiaForTrip(trip) {
  const propia = GASTRONOMIA_BY_CATEGORIA[trip.fotoCategoria] || GASTRONOMIA_BY_CATEGORIA.ciudad;
  return [...propia, ...GASTRONOMIA_UNIVERSAL].map((item, i) => ({ ...item, id: `gas-${i}` }));
}
