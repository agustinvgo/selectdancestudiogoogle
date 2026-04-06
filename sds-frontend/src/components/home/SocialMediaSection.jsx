import { motion, useReducedMotion } from 'framer-motion';
import { Instagram, Video, MessageCircle } from 'lucide-react';

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        icon: Instagram,
        url: 'https://www.instagram.com/selectdance.studio/',
        gradient: 'from-purple-600 via-pink-600 to-orange-500',
        handle: '@selectdance.studio',
        desc: 'Síguenos para ver las últimas coreografías y eventos.'
    },
    {
        name: 'TikTok',
        icon: Video,
        url: 'https://www.tiktok.com/@selectdance.studio',
        gradient: 'from-black via-gray-900 to-gray-800',
        handle: '@selectdance.studio',
        desc: 'Tutoriales, challenges y el lado divertido del estudio.'
    },
    {
        name: 'WhatsApp',
        icon: MessageCircle,
        url: 'https://wa.me/message/ZNBV2CLWYU36H1',
        gradient: 'from-green-500 via-green-600 to-teal-600',
        handle: 'Habla con nosotros',
        desc: 'Escríbenos directamente para inscripciones y dudas.'
    }
];

const SocialMediaSection = () => {
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-24 bg-transparent text-inherit overflow-hidden transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-red-500 tracking-[0.3em] text-xs font-bold uppercase block mb-4">Comunidad</span>
                    <h2 className="text-4xl md:text-5xl font-bold">Conecta con Nosotros</h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {SOCIAL_LINKS.map((social) => (
                        <motion.a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={cardVariants}
                            whileHover={shouldReduceMotion ? {} : { y: -10, scale: 1.02 }}
                            className={`relative group p-8 rounded-3xl overflow-hidden bg-gradient-to-br ${social.gradient}`}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-500" />

                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[240px]">
                                <div className="bg-white/10 w-fit p-4 rounded-full backdrop-blur-sm">
                                    <social.icon className="w-8 h-8 text-inherit transition-colors duration-500" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{social.name}</h3>
                                    <p className="text-sm font-medium opacity-80 mb-4">{social.handle}</p>
                                    <p className="text-sm opacity-90 leading-relaxed">
                                        {social.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative blur/shine */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default SocialMediaSection;

