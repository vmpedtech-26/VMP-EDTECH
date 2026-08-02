# 📄 ESPECIFICACIÓN: REDISEÑO DE IMÁGENES DE FONDO 4K REALES PARA LANDING PAGE VMP-EDTECH

**Slug:** `rediseno_imagenes_landing`  
**Objetivo:** Eliminar todas las imágenes pixeleadas, de baja resolución o repetidas en la landing page `https://www.vmp-edtech.com/`, reemplazándolas por un catálogo único de fotografías reales cinematográficas en calidad 4K (sin estética de IA ni futurista) con capas de legibilidad corporativas en Azul Noche (`#0B172A`) y Cian (`#00B4B6`).

---

## 🎯 Requisitos de Especificación

### 1. Estándar Fotográfico y Estética
* **Fotografía Real Cinematográfica (4K):** Imágenes fotográficas reales de alta definición, enfocadas en transporte de carga industrial, seguridad vial de flotas, maniobras en carreteras y yacimientos patagónicos, salas de telemetría y centros de capacitación.
* **Cero Imágenes de IA / Futuristas:** Prohibido el uso de gráficos abstractos de red sci-fi o elementos irreales. Todo el material debe ser 100% verosímil y profesional.
* **Cero Repeticiones:** Cada sección de la landing page contará con una fotografía de fondo completamente distinta y dedicada.

### 2. Capas de Legibilidad y Estilo
* **Filtro de Contraste Azul Noche (`#0B172A`):** Superposición de degradados en `rgba(11, 23, 42, 0.85)` a `rgba(11, 23, 42, 0.95)` para garantizar legibilidad absoluta del texto blanco.
* **Acentos Cian (`#00B4B6`) & Glassmorphism:** Bordes e iluminaciones sutiles en cian eléctrico y tarjetas con efecto cristal.

---

## 🖼️ Mapeo de Fondos Únicos por Sección

| Sección | Archivo de Imagen 4K | Temática Fotográfica Real |
| :--- | :--- | :--- |
| **1. Hero (Portada Principal)** | `hero_vmp_real_4k.jpg` | Convoy de camiones de transporte en carretera patagónica al atardecer. |
| **2. Cursos & Capacitaciones** | `cursos_vmp_real_4k.jpg` | Centro de formación ejecutiva y simuladores profesionales de manejo. |
| **3. Servicios Técnicos** | `servicios_vmp_real_4k.jpg` | Inspección técnica vehicular y equipos de telemetría en campo. |
| **4. Soluciones Corporativas** | `soluciones_vmp_real_4k.jpg` | Flota logística de carga en yacimiento energético. |
| **5. Por Qué Elegir VMP** | `porque_elegir_vmp_real_4k.jpg` | Centro de monitoreo y control de seguridad en tiempo real. |
| **6. Sobre la Empresa** | `empresa_vmp_real_4k.jpg` | Ingenieros y especialistas en seguridad industrial en planta. |
| **7. CTA Final / Contacto** | `contacto_vmp_real_4k.jpg` | Conductor profesional al volante con vista a la carretera. |

---

## 🛠️ Plan de Verificación
1. Inspección visual de la landing page en `apps/web/app/page.tsx` y hojas de estilo.
2. Confirmar que ninguna imagen se repita entre secciones.
3. Verificar nitidez en pantallas Retina/4K y respuesta responsive en móviles y laptops.
4. Compilar estáticamente el proyecto Next.js (`npm run build`) para verificar cero errores.
