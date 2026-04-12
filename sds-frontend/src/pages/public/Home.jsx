import { Toaster } from 'react-hot-toast';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaLocalBusiness from '../../components/SEO/SchemaLocalBusiness.jsx';
import SchemaFAQ from '../../components/SEO/SchemaFAQ.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';

// Modular Components
import HeroSection from '../../components/home/HeroSection.jsx';
import EssenceMarquee from '../../components/home/EssenceMarquee.jsx';
import FeaturedClasses from '../../components/home/FeaturedClasses.jsx';
import RoomRentalSection from '../../components/home/RoomRentalSection.jsx';
import SocialMediaSection from '../../components/home/SocialMediaSection.jsx';
import ContactSection from '../../components/home/ContactSection.jsx';

const Home = () => {
    return (
        <div className="bg-transparent text-inherit w-full">
            <PageSEO
                title="Select Dance Studio"
                description="Select Dance Studio: clases de ballet, jazz, contemporáneo y gimnasia artística para niñas en Palermo, CABA. Alquiler de salas profesionales para clases, ensayos y workshops."
                canonical="/"
            />
            <SchemaLocalBusiness />
            <SchemaFAQ />
            <SchemaBreadcrumb items={[{ name: 'Inicio', url: '/' }]} />
            <Toaster />

            <HeroSection />
            <EssenceMarquee />
            <FeaturedClasses />
            <RoomRentalSection />
            <SocialMediaSection />

            <ContactSection />
        </div>
    );
};

export default Home;

