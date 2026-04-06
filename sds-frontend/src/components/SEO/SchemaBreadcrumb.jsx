/**
 * Schema JSON-LD: BreadcrumbList
 * Muestra la ruta de navegación en los resultados de Google.
 * Ejemplo en SERP: selectdancestudio.com › Cursos › Junior
 *
 * Uso: agregar en cada página con su ruta correspondiente.
 *
 * @param {Array} items - Array de { name, url } en orden jerárquico
 *   ej: [{ name: 'Inicio', url: '/' }, { name: 'Cursos', url: '/cursos' }]
 */
const SchemaBreadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    const BASE_URL = 'https://www.selectdancestudio.com';

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default SchemaBreadcrumb;

// ─── EJEMPLOS DE USO ───────────────────────────────────────
//
// En Home.jsx — solo el inicio:
// <SchemaBreadcrumb items={[{ name: 'Inicio', url: '/' }]} />
//
// En CursosPublicos.jsx:
// <SchemaBreadcrumb items={[
//   { name: 'Inicio', url: '/' },
//   { name: 'Cursos', url: '/cursos' },
// ]} />
//
// En Competition.jsx:
// <SchemaBreadcrumb items={[
//   { name: 'Inicio', url: '/' },
//   { name: 'Equipo de Competición', url: '/competition' },
// ]} />
//
// En QuienesSomos.jsx:
// <SchemaBreadcrumb items={[
//   { name: 'Inicio', url: '/' },
//   { name: 'Quiénes Somos', url: '/nosotros' },
// ]} />
