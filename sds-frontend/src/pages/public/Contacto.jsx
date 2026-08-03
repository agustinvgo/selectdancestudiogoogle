import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';
import ContactSection from '../../components/home/ContactSection.jsx';

const Contacto = () => (
    <div className="min-h-screen bg-black pt-20 text-white">
        <PageSEO
            title="Contacto y ubicación — Academia de danza en Palermo"
            description="Contactá a Select Dance Studio en Honduras 5550, Palermo. Consultá por clases, horarios, aranceles, pruebas y alquiler de salas."
            canonical="/contacto"
        />
        <SchemaBreadcrumb items={[
            { name: 'Inicio', url: '/' },
            { name: 'Contacto', url: '/contacto' },
        ]} />
        <ContactSection />
    </div>
);

export default Contacto;

