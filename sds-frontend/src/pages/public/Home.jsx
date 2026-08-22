import { Toaster } from 'react-hot-toast';
import PageSEO from '../../components/SEO/PageSEO.jsx';

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
                title="Academia de danza en Palermo, CABA"
                description="Clases de danza para niñas desde los 3 años, adolescentes y adultos en Palermo, CABA. Ballet, jazz, contemporáneo, Acro Dance y gimnasia acrobática."
                canonical="/"
            />
            <Toaster />

            <HeroSection />
            <EssenceMarquee />
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '2200px' }}>
                <FeaturedClasses />
            </div>
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}>
                <RoomRentalSection />
            </div>
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '700px' }}>
                <SocialMediaSection />
            </div>
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
                <ContactSection />
            </div>
        </div>
    );
};

export default Home;

