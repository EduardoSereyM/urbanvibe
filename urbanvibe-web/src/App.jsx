import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Star, Globe, Instagram, Facebook, Twitter, Menu, X, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import axios from 'axios';

// Assets
import logoSource from './assets/logo-figma.png';
import InteractiveMap from './components/InteractiveMap';

const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [venues, setVenues] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        fetchData();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/v1/venues/map');
            if (response.data) setVenues(response.data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const navLinks = [
        { name: 'EL DESAFÍO', href: '#desafio' },
        { name: 'SOLUCIÓN', href: '#solucion' },
        { name: 'NEGOCIOS', href: '#negocios' },
    ];

    return (
        <div className="min-h-screen bg-uv-base text-uv-text overflow-x-hidden w-full relative">

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-uv-purple blur-[120px] opacity-20 rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-uv-cyber blur-[100px] opacity-10 rounded-full" />
            </div>

            {/* Navigation */}
            <nav className={`fixed w-full top-0 z-[100] transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-uv-base/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <motion.img
                        src={logoSource}
                        alt="UrbanVibe"
                        className="h-8 md:h-10 w-auto object-contain cursor-pointer"
                        style={{ maxWidth: '140px' }}
                        whileHover={{ scale: 1.05 }}
                    />

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className="text-sm font-bold tracking-widest text-uv-text/70 hover:text-uv-naranja transition-colors font-brand">
                                {link.name}
                            </a>
                        ))}
                        <button className="btn-primary py-2 px-5 text-sm">
                            Unete a la beta
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-uv-text">
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-uv-base border-b border-white/5 overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-brand font-bold flex justify-between items-center p-4 bg-uv-card rounded-xl active:scale-95 transition-transform"
                                    >
                                        {link.name}
                                        <ChevronRight size={20} className="text-uv-naranja" />
                                    </a>
                                ))}
                                <button className="btn-primary w-full mt-4">
                                    ÚNETE A LA BETA
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* HERO Section V4: Vertical Stack (Mobile & Desktop) */}
            <main className="relative min-h-screen flex flex-col pt-24 pb-0 bg-uv-base">

                {/* 1. TOP: TEXT CONTENT (40% de Altura Visual) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-shrink-0 flex flex-col justify-center items-center text-center px-6 mb-8 lg:mb-12 relative z-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-uv-card/50 border border-uv-cyber/30 mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-uv-cyber animate-pulse shadow-[0_0_10px_#00E0FF]"></span>
                        <span className="text-xs font-bold tracking-[0.2em] text-cyan-300">SANTIAGO V1.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-brand font-black mb-6 leading-[0.9] tracking-tight">
                        SANTIAGO <span className="text-uv-naranja italic">VIBRA.</span>
                    </h1>

                    <p className="text-uv-text/80 text-lg md:text-xl mb-8 max-w-lg mx-auto font-sans font-light">
                        La llave maestra para desbloquear experiencias ocultas.
                    </p>

                    <button className="btn-primary text-lg group relative overflow-hidden shadow-[0_0_30px_rgba(250,78,53,0.3)]">
                        <span className="relative z-10 flex items-center gap-2">
                            DESCUBRIR AHORA <ArrowRight size={20} />
                        </span>
                    </button>
                </motion.div>

                {/* 2. BOTTOM: MASSIVE MAP (60%+, Base Visual) */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
                    className="flex-grow w-full relative z-10"
                >
                    <div className="h-[60vh] md:h-[70vh] w-full mx-auto md:max-w-[95%]">
                        {/* Contenedor Premium "Panel de Control" */}
                        <div className="w-full h-full rounded-t-[3rem] overflow-hidden border-t border-x border-white/10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] relative bg-uv-base group">

                            {/* Borde Brillante Superior */}
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-uv-cyber/50 to-transparent z-30"></div>

                            {/* El Mapa con Filtro Nocturno */}
                            <div className="w-full h-full relative">
                                <InteractiveMap venues={venues} />

                                {/* Gradiente Superior para fundir con el texto */}
                                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-uv-base via-uv-base/80 to-transparent pointer-events-none z-20"></div>
                            </div>

                            {/* Floating UI Elements on Map */}
                            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-30">
                                <div className="bg-uv-card/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-4 shadow-2xl">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-uv-card"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-uv-card"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-uv-card"></div>
                                    </div>
                                    <p className="text-xs font-bold text-white"><span className="text-uv-naranja">120+</span> Exploradores activos</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </main>

            {/* SECTIONS GRID */}
            <section className="py-20 px-6 relative z-10" id="solucion">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-brand font-bold mb-4 uppercase">¿Cómo funciona?</h2>
                        <p className="text-uv-text/60 text-lg">La experiencia UrbanVibe en 3 pasos</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Globe className="text-uv-cyber" size={32} />, title: "EXPLORA", desc: "Usa el mapa interactivo para encontrar 'Joyas Ocultas' cerca de ti." },
                            { icon: <Users className="text-uv-amarillo" size={32} />, title: "CONECTA", desc: "Haz check-in escaneando el QR del local y gana puntos automáticamente." },
                            { icon: <Star className="text-uv-rojo" size={32} />, title: "GANA", desc: "Canjea tus puntos por promociones exclusivas en nuestra red de partners." }
                        ].map((card, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="app-card group hover:border-uv-naranja/50 transition-colors"
                            >
                                <div className="w-14 h-14 bg-uv-base rounded-xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-brand font-bold mb-3">{card.title}</h3>
                                <p className="text-uv-text/60 font-sans leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* B2B BANNER */}
            <section className="px-6 py-10 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="app-card bg-gradient-to-r from-uv-card to-uv-base relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-uv-naranja/10 blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center p-4 md:p-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-brand font-bold mb-4">IMPULSA TU NEGOCIO</h2>
                                <p className="text-uv-text/70 mb-8 text-lg">Únete a la red de locales fundadores y conecta con una audiencia lista para vivir nuevas experiencias.</p>
                                <button className="btn-secondary">
                                    MÁS INFORMACIÓN
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            <div className="flex justify-center md:justify-end">
                                {/* Abstract Graphic */}
                                <div className="grid grid-cols-2 gap-4 opacity-80">
                                    <div className="bg-uv-base p-4 rounded-xl border border-white/5 w-32 h-32 flex items-center justify-center">
                                        <Users className="text-uv-cyber" size={40} />
                                    </div>
                                    <div className="bg-uv-naranja p-4 rounded-xl border border-white/5 w-32 h-32 flex items-center justify-center translate-y-8">
                                        <Star className="text-white" size={40} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Simple */}
            <footer className="py-12 border-t border-white/5 mt-10 bg-uv-base relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <img src={logoSource} alt="Logo" className="h-8 mb-2 mx-auto md:mx-0 opacity-80" />
                        <p className="text-xs text-uv-text/40 font-bold tracking-widest">© 2026 URBANVIBE</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="opacity-50 hover:opacity-100 hover:text-uv-naranja transition-all"><Instagram size={20} /></a>
                        <a href="#" className="opacity-50 hover:opacity-100 hover:text-uv-naranja transition-all"><Twitter size={20} /></a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default App;
