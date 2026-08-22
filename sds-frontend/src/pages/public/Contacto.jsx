import PageSEO from '../../components/SEO/PageSEO.jsx';
import ContactSection from '../../components/home/ContactSection.jsx';

const Contacto = () => (
    <div className="min-h-screen bg-black pt-20 text-white">
        <PageSEO
            title="Contacto y ubicación en Palermo, CABA"
            description="Contactá a Select Dance Studio en Honduras 5550, Palermo, CABA. Consultá clases, niveles, horarios, vacantes, aranceles y alquiler de salas."
            canonical="/contacto"
        />
        <ContactSection headingLevel="h1" headingLines={['Contacto y ubicación', 'en Palermo, CABA']} />
    </div>
);

export default Contacto;
