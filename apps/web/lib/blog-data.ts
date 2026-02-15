export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'capacitacion-obligatoria-conductores-2025',
    title: 'Capacitación Obligatoria para Conductores Profesionales en 2025',
    excerpt: 'Analizamos los requisitos actuales de capacitación vial obligatoria para conductores profesionales en Argentina y cómo cumplirlos.',
    content: `
      <h2>Actualización en Capacitación Vial Argentina</h2>
      <p>La normativa vigente establece requisitos cada vez más exigentes para la certificación de conductores de vehículos de carga y pasajeros, buscando elevar los estándares de seguridad en las rutas nacionales.</p>
      
      <h3>Puntos Clave de la Normativa Vigente</h3>
      <ul>
        <li><strong>Vigencia de Certificaciones:</strong> Las certificaciones deben renovarse periódicamente de forma obligatoria, garantizando que los conductores mantengan sus conocimientos actualizados.</li>
        <li><strong>Módulo Teórico Online:</strong> Se reconoce la validez de la capacitación teórica vía plataformas e-learning certificadas como VMP.</li>
        <li><strong>Examen Práctico Supervisado:</strong> La evaluación práctica debe ser realizada por instructores matriculados con la documentación correspondiente.</li>
      </ul>

      <blockquote>
        "La capacitación permanente busca elevar el estándar de seguridad en las rutas nacionales, asegurando que cada conductor profesional mantenga sus conocimientos actualizados frente a las nuevas tecnologías de los vehículos."
      </blockquote>

      <h3>Impacto en las Empresas</h3>
      <p>Las empresas de logística y transporte deben auditar sus legajos de conductores de inmediato. Aquellos con certificaciones vencidas deben regularizar su situación para evitar sanciones y garantizar la seguridad de sus operaciones.</p>
    `,
    date: '15 de Enero, 2026',
    author: 'Ing. Carlos Rodriguez',
    category: 'Normativa',
    image: '/images/blog/fleet-safety.png',
    readTime: '6 min',
    tags: ['Argentina', 'Certificación', 'Capacitación', 'Transporte']
  },
  {
    slug: 'conduccion-preventiva-zonas-de-montana',
    title: 'Conducción Preventiva en Zonas de Montaña: Desafíos en los Andes',
    excerpt: 'Técnicas avanzadas de conducción para enfrentar los desafíos geográficos de la región andina y rutas de alta montaña.',
    content: `
      <h2>Desafíos de la Geografía Latinoamericana</h2>
      <p>Desde la Cordillera de los Andes hasta las zonas serranas, la conducción en montaña requiere habilidades que van más allá del manejo convencional.</p>
      
      <h3>Técnicas Vitales</h3>
      <p>El uso del freno motor es, quizás, la técnica más importante para evitar el recalentamiento de los sistemas de frenado (fading). En descensos prolongados, la regla de oro es: <em>"Bajar en la misma marcha en la que se subiría"</em>.</p>
      
      <ul>
        <li><strong>Gestión de Curvas:</strong> Anticipación y puntos de frenado antes del ingreso a la curva.</li>
        <li><strong>Efectos de la Altitud:</strong> Cómo la falta de oxígeno afecta la reacción del motor y la fatiga del conductor.</li>
        <li><strong>Clima Cambiante:</strong> Manejo en presencia de hielo, nieve o "viento blanco".</li>
      </ul>

      <h3>Prevención de Accidentes</h3>
      <p>En Latinoamérica, las rutas de montaña representan un alto porcentaje de la siniestralidad vial en transporte de carga. La capacitación específica reduce estos riesgos en un 65%.</p>
    `,
    date: '28 de Enero, 2026',
    author: 'Inst. Marcos Peña',
    category: 'Seguridad',
    image: '/images/blog/driving-course.png',
    readTime: '8 min',
    tags: ['Montaña', 'Latam', 'Seguridad Vial', 'Técnicas']
  },
  {
    slug: 'telemetria-y-seguridad-vial',
    title: 'Telemetría y Seguridad Vial: El futuro de la gestión de flotas',
    excerpt: 'Cómo los datos en tiempo real están transformando la capacitación y reduciendo costos operativos en toda Latinoamérica.',
    content: `
      <h2>La Era del Dato en el Transporte</h2>
      <p>La integración de sistemas de telemetría con programas de capacitación personalizada es la tendencia más fuerte en el mercado logístico actual.</p>
      
      <h3>¿Qué estamos midiendo?</h3>
      <p>Ya no solo se trata de saber dónde está el camión. Los sistemas modernos nos permiten identificar:</p>
      <ul>
        <li>Frenadas bruscas y aceleraciones innecesarias.</li>
        <li>Tiempo de ralentí excesivo.</li>
        <li>Uso inadecuado del control de crucero.</li>
      </ul>

      <h3>Entrenamiento Basado en Evidencia</h3>
      <p>En VMP, utilizamos estos datos para crear módulos de refuerzo específicos para cada conductor. Si el sistema detecta que un conductor tiene problemas recurrentes con el frenado en curvas, se le asigna automáticamente un micro-módulo educativo sobre el tema.</p>
    `,
    date: '02 de Febrero, 2026',
    author: 'Dra. Elena Valenzuela',
    category: 'Tecnología',
    image: '/images/blog/telematics.png',
    readTime: '5 min',
    tags: ['Telemetría', 'IoT', 'Flotas', 'Eficiencia']
  },
  {
    slug: 'estandarizacion-certificaciones-mercosur',
    title: 'Hacia la Estandarización: Certificaciones viales en el Mercosur',
    excerpt: '¿Es posible una licencia única profesional para toda la región? Analizamos los avances y desafíos de la integración vial.',
    content: `
      <h2>Integración Regional y Transporte</h2>
      <p>El transporte internacional de cargas en el Mercosur enfrenta hoy un desafío burocrático: la falta de una certificación de competencias unificada para conductores profesionales.</p>
      
      <h3>Avances Recientes</h3>
      <p>Organismos de Argentina, Brasil, Uruguay y Paraguay han iniciado mesas de trabajo para homologar los contenidos de los cursos de Conducción Preventiva. El objetivo es que una certificación emitida bajo el estándar VMP sea reconocida automáticamente por las autoridades de control en cualquier carretera de la región.</p>
      
      <ul>
        <li><strong>Similitud en Normas:</strong> Más del 80% de las señales de tránsito ya están estandarizadas.</li>
        <li><strong>Capacitación Cross-Border:</strong> La importancia de entender las variaciones legales entre países.</li>
        <li><strong>Protocolos de Emergencia:</strong> Unificación de números y procedimientos de asistencia en ruta.</li>
      </ul>

      <h3>El Rol de la Tecnología</h3>
      <p>La digitalización de las credenciales mediante códigos QR (como los que implementamos en VMP) es la piedra angular para que un inspector en Uruguay pueda validar instantáneamente la formación de un conductor argentino.</p>
    `,
    date: '02 de Febrero, 2026',
    author: 'Lic. Sofía Méndez',
    category: 'Región',
    image: '/images/blog/mercosur-transport.png',
    readTime: '7 min',
    tags: ['Mercosur', 'Integración', 'Transporte Internacional', 'Normativa']
  }
];
