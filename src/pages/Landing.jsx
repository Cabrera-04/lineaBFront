import {Link} from "react-router-dom";
import {MapPin, Layers, Globe, TrendingUp, Menu, X} from "lucide-react";
import {useState} from "react";
import Hero from "/hero.jpg";
import MapViewer from "../components/MapViewer";

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const glassClass = "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-white/10 shadow-lg";

    return (
        <header className={`fixed inset-x-0 top-0 z-50 ${glassClass}`}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 animate-slide-in-top" style={{animationDelay: '0s'}}>
                    <div
                        className="h-9 w-9 grid place-items-center rounded-xl bg-emerald-400/20 border border-emerald-300/50 shadow-md">
                        <MapPin className="h-5 w-5 text-emerald-300"/>
                    </div>
                    <span className="font-extrabold text-xl tracking-wider text-white">UNESLeaf</span>
                </div>

                <div className="hidden md:flex items-center gap-3 animate-slide-in-top"
                     style={{animationDelay: '0.1s'}}>
                    <Link to="/login"
                          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition shadow-lg hover:shadow-emerald-400/30">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register"
                          className="inline-flex items-center justify-center rounded-full bg-emerald-400 text-neutral-900 px-4 py-2 text-sm font-bold hover:bg-emerald-300 transition transform hover:scale-105 shadow-xl shadow-emerald-400/30">
                        Crear cuenta ✨
                    </Link>
                </div>

                <button
                    className="md:hidden text-white hover:text-emerald-400 transition p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                </button>
            </div>

            {isOpen && (
                <div
                    className={`md:hidden absolute top-16 inset-x-0 ${glassClass} p-4 flex flex-col items-center space-y-4 animate-fade-in`}>
                    <Link to="/" onClick={() => setIsOpen(false)}
                          className="text-white hover:text-emerald-400 transition w-full text-center py-2 border-b border-white/10">Inicio</Link>
                    <Link to="/login" onClick={() => setIsOpen(false)}
                          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition w-3/4">Iniciar
                        Sesión</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-400 text-neutral-900 px-4 py-2 text-sm font-bold hover:bg-emerald-300 transition w-3/4 mb-2">Crear
                        cuenta</Link>
                </div>
            )}
        </header>
    );
}

const cardGlassClass = "border border-white/20 bg-background/50 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:shadow-emerald-400/50 hover:border-emerald-400/50";


const Landing = () => {
    const features = [
        {
            icon: MapPin,
            title: "Geolocalización Precisa",
            description: "Datos cartográficos de alta precisión para tus análisis espaciales con mínimo error.",
            color: "text-red-400",
            bg: "bg-red-400/10",
        },
        {
            icon: Layers,
            title: "Capas Múltiples Dinámicas",
            description: "Visualiza y combina distintas capas de información geográfica en tiempo real.",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            icon: Globe,
            title: "Cobertura Global Extendida",
            description: "Accede a información geográfica detallada de cualquier parte del mundo al instante.",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
        },
        {
            icon: TrendingUp,
            title: "Análisis Espacial Avanzado",
            description: "Herramientas potentes para análisis complejos y consultas geoespaciales.",
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans">
            <Navbar/>

            <section className="relative pt-32 pb-24 px-4 overflow-hidden min-h-[80vh] flex items-center">
                <div
                    className="absolute inset-0 opacity-20 filter saturate-150"
                    style={{
                        backgroundImage: `url(${Hero})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div
                    className="absolute top-[10%] left-[5%] w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl opacity-50 animate-float"/>
                <div
                    className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-blue-400/10 rounded-full blur-3xl opacity-50 animate-float"
                    style={{animationDelay: "2s"}}
                />

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight animate-slide-in-top">
                            Bienvenido a
                            <span
                                className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent italic font-serif tracking-widest">
    UNESLeaf
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-300 mb-10 max-w-2xl mx-auto animate-fade-in"
                           style={{animationDelay: '0.5s'}}>
                            Explora, analiza y visualiza datos geoespaciales con nuestra plataforma retro-moderna y
                            ultrarrápida.
                        </p>
                    </div>
                </div>
            </section>

            <hr className="w-1/2 mx-auto border-t border-emerald-400/30 my-10"/>

            <section className="py-20 px-4 animate-fade-in" style={{animationDelay: '1s'}}>
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-emerald-400">Visor Interactivo</h2>
                        <p className="text-neutral-400 text-xl max-w-3xl mx-auto">
                            Explora nuestra cartografía base en tiempo real.
                        </p>
                    </div>
                    <div className={`rounded-3xl overflow-hidden ${cardGlassClass} p-2`}>
                        <MapViewer />
                    </div>
                </div>
            </section>

            <hr className="w-1/2 mx-auto border-t border-emerald-400/30 my-10"/>

            <section className="py-24 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-emerald-400">Poder en tus
                            manos</h2>
                        <p className="text-neutral-400 text-xl max-w-3xl mx-auto">
                            Herramientas profesionales diseñadas para el análisis geoespacial
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`p-8 rounded-3xl ${cardGlassClass} animate-slide-in-top`}
                                style={{animationDelay: `${index * 0.2 + 0.5}s`, animationFillMode: 'both'}}
                            >
                                <div
                                    className={`h-16 w-16 grid place-items-center rounded-xl ${feature.bg} ${feature.color} mb-6 shadow-inner transition transform hover:scale-110`}>
                                    <feature.icon className="h-8 w-8"/>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-neutral-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="w-1/2 mx-auto border-t border-emerald-400/30 my-10"/>

            <footer className="py-10 px-4 border-t border-white/10 bg-neutral-950">
                <div className="container mx-auto text-center text-neutral-500 text-sm">
                    <p className="tracking-wider">&copy; {new Date().getFullYear()} Sistema de Información
                        Geográfica.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;