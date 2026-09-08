/**
 * H-002: Colombian departments and municipalities for structured rural addresses.
 * Focused on agricultural/livestock regions.
 */
export interface ColombiaRegion {
  department: string;
  municipalities: string[];
}

export const COLOMBIA_REGIONS: ColombiaRegion[] = [
  {
    department: 'Antioquia',
    municipalities: [
      'Medellín', 'Bello', 'Envigado', 'Itagüí', 'Rionegro', 'Apartadó', 'Turbo',
      'Caucasia', 'Santa Rosa de Osos', 'Don Matías', 'Entrerríos', 'San Pedro de los Milagros',
      'La Ceja', 'El Carmen de Viboral', 'Marinilla', 'La Unión', 'Sonsón', 'Yarumal',
      'Santa Fe de Antioquia', 'Fredonia', 'Andes', 'Jardín', 'Urrao',
    ],
  },
  {
    department: 'Atlántico',
    municipalities: [
      'Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Baranoa', 'Galapa',
      'Repelón', 'Luruaco', 'Santo Tomás',
    ],
  },
  {
    department: 'Bolívar',
    municipalities: [
      'Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar',
      'San Juan Nepomuceno', 'María La Baja', 'Mompox',
    ],
  },
  {
    department: 'Boyacá',
    municipalities: [
      'Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva',
      'Moniquirá', 'Puerto Boyacá', 'Garagoa', 'Guateque', 'Ramiriquí',
      'Samacá', 'Ventaquemada', 'Tuta',
    ],
  },
  {
    department: 'Caldas',
    municipalities: [
      'Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Anserma', 'Riosucio',
      'Supía', 'Aguadas', 'Pácora', 'Salamina',
    ],
  },
  {
    department: 'Caquetá',
    municipalities: [
      'Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello',
      'Belén de los Andaquíes', 'Morelia',
    ],
  },
  {
    department: 'Casanare',
    municipalities: [
      'Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo',
      'Monterrey', 'Maní', 'Hato Corozal',
    ],
  },
  {
    department: 'Cauca',
    municipalities: [
      'Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó',
      'El Tambo', 'Patía', 'Bolívar', 'Corinto',
    ],
  },
  {
    department: 'Cesar',
    municipalities: [
      'Valledupar', 'Aguachica', 'Codazzi', 'Bosconia', 'El Copey',
      'Chimichagua', 'Curumani', 'La Jagua de Ibirico',
    ],
  },
  {
    department: 'Córdoba',
    municipalities: [
      'Montería', 'Cereté', 'Sahagún', 'Lorica', 'Planeta Rica', 'Montelíbano',
      'Tierralta', 'San Pelayo', 'Ciénaga de Oro', 'San Carlos',
    ],
  },
  {
    department: 'Cundinamarca',
    municipalities: [
      'Bogotá', 'Soacha', 'Zipaquirá', 'Facatativá', 'Chía', 'Mosquera',
      'Fusagasugá', 'Girardot', 'Cajicá', 'Cota', 'Funza', 'Madrid',
      'Sibaté', 'Sopó', 'Tabio', 'Tenjo', 'Tocancipá', 'Ubaté',
      'Villeta', 'La Mesa', 'Silvania', 'Chocontá',
    ],
  },
  {
    department: 'Huila',
    municipalities: [
      'Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre',
      'Gigante', 'Aipe', 'Palermo', 'Rivera',
    ],
  },
  {
    department: 'La Guajira',
    municipalities: [
      'Riohacha', 'Maicao', 'Uribia', 'Fonseca', 'San Juan del Cesar',
      'Villanueva', 'Barrancas',
    ],
  },
  {
    department: 'Magdalena',
    municipalities: [
      'Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato',
      'Aracataca', 'Zona Bananera', 'Pivijay',
    ],
  },
  {
    department: 'Meta',
    municipalities: [
      'Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín',
      'Restrepo', 'Cumaral', 'Puerto Gaitán', 'Guamal',
    ],
  },
  {
    department: 'Nariño',
    municipalities: [
      'Pasto', 'Tumaco', 'Ipiales', 'La Unión', 'Samaniego',
      'Túquerres', 'Barbacoas', 'El Charco',
    ],
  },
  {
    department: 'Norte de Santander',
    municipalities: [
      'Cúcuta', 'Ocaña', 'Pamplona', 'Los Patios', 'Villa del Rosario',
      'Tibú', 'El Zulia', 'Abrego',
    ],
  },
  {
    department: 'Quindío',
    municipalities: [
      'Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Circasia',
      'Quimbaya', 'Filandia', 'Salento',
    ],
  },
  {
    department: 'Risaralda',
    municipalities: [
      'Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia',
      'Belén de Umbría', 'Marsella', 'Quinchía',
    ],
  },
  {
    department: 'Santander',
    municipalities: [
      'Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja',
      'San Gil', 'Socorro', 'Barbosa', 'Vélez', 'Lebrija', 'Málaga',
    ],
  },
  {
    department: 'Sucre',
    municipalities: [
      'Sincelejo', 'Corozal', 'San Marcos', 'Tolú', 'San Onofre',
      'Sampués', 'Ovejas', 'Coveñas',
    ],
  },
  {
    department: 'Tolima',
    municipalities: [
      'Ibagué', 'Espinal', 'Melgar', 'Honda', 'Mariquita', 'Lérida',
      'Chaparral', 'Líbano', 'Guamo', 'Purificación',
    ],
  },
  {
    department: 'Valle del Cauca',
    municipalities: [
      'Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga',
      'Yumbo', 'Jamundí', 'Candelaria', 'Pradera', 'Florida',
      'Ginebra', 'El Cerrito', 'Sevilla', 'Caicedonia', 'Roldanillo',
    ],
  },
];

/**
 * Get sorted list of all departments
 */
export function getDepartments(): string[] {
  return COLOMBIA_REGIONS.map((r) => r.department).sort();
}

/**
 * Get municipalities for a given department
 */
export function getMunicipalities(department: string): string[] {
  const region = COLOMBIA_REGIONS.find((r) => r.department === department);
  return region ? region.municipalities.sort() : [];
}
