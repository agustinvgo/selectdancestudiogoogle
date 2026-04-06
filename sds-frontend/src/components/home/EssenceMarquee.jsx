const EssenceMarquee = () => {
    return (
        <section className="py-8 bg-sds-red overflow-hidden whitespace-nowrap border-y border-red-800">
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-force {
                    animation: marquee 20s linear infinite;
                    width: max-content;
                }
                `}
            </style>
            <div className="animate-marquee-force flex">
                <div className="flex shrink-0 items-center justify-around">
                    <span className="text-4xl md:text-6xl font-black text-black/20 uppercase tracking-tighter mx-4">PASIÓN • TÉCNICA • COMUNIDAD • ARTE • DISCIPLINA • EXPRESIÓN •  COMPETENCIA •</span>
                    <span className="text-4xl md:text-6xl font-black text-black/20 uppercase tracking-tighter mx-4">PASIÓN • TÉCNICA • COMUNIDAD • ARTE • DISCIPLINA • EXPRESIÓN •  COMPETENCIA •</span>
                </div>
                <div className="flex shrink-0 items-center justify-around">
                    <span className="text-4xl md:text-6xl font-black text-black/20 uppercase tracking-tighter mx-4">PASIÓN • TÉCNICA • COMUNIDAD • ARTE • DISCIPLINA • EXPRESIÓN •  COMPETENCIA •</span>
                    <span className="text-4xl md:text-6xl font-black text-black/20 uppercase tracking-tighter mx-4">PASIÓN • TÉCNICA • COMUNIDAD • ARTE • DISCIPLINA • EXPRESIÓN •  COMPETENCIA •</span>
                </div>
                
            </div>
        </section>
    );
};

export default EssenceMarquee;
