import { Link } from "react-router-dom";
import { MapPin, LogOut, ArrowRight, FileText, User } from "lucide-react";

import DashboardBg from '/dashboard-bg.jpg';

const glass = "bg-neutral-900/80 backdrop-blur-lg border border-white/15 shadow-lg";

export default function Dashboard() {
    return (
        <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden">

            <div
                className="absolute inset-0 z-0 opacity-6"
                style={{
                    backgroundImage: `url(${DashboardBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            ></div>

            <header className={`sticky top-0 z-40 ${glass}`}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 grid place-items-center rounded-xl bg-emerald-400/20 border border-emerald-300/50">
                            <MapPin className="h-5 w-5 text-emerald-300" />
                        </div>
                        <h1 className="font-semibold">UNESLeaf • Dashboard</h1>
                    </div>
                    <Link to="/" className="text-sm opacity-80 hover:opacity-100 inline-flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Salir
                    </Link>
                </div>
            </header>

            <main className="relative z-10 grid min-h-[calc(100vh-4rem)] place-items-center p-4 md:p-8">

                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                    <section
                        className={`
                            lg:col-span-2 rounded-2xl p-6 md:p-10 ${glass} border-emerald-400/30
                            flex flex-col md:flex-row items-center md:items-start 
                            justify-between gap-6 text-center md:text-left
                            transition-all duration-300
                        `}
                    >
                        <div>
                            <p className="text-sm font-semibold text-emerald-400 tracking-wide">BIENVENIDO A UNESLeaf</p>
                            <h2 className="text-4xl lg:text-5xl font-extrabold mt-2">Tu Visor Geográfico</h2>
                            <p className="text-white/80 max-w-xl mt-4 text-base">
                                Todo lo que necesitas para explorar, analizar y consultar
                                tus datos geoespaciales está a un clic de distancia.
                            </p>
                        </div>

                        <Link
                            to="/visor"
                            className="
                                inline-flex items-center justify-center gap-3 rounded-xl
                                bg-emerald-400 text-neutral-900 px-8 py-3
                                font-bold hover:bg-emerald-300 transition-all transform hover:scale-105
                                shadow-xl shadow-emerald-400/30 text-lg w-full md:w-auto flex-shrink-0
                            "
                        >
                            Abrir Visor <ArrowRight className="h-5 w-5" />
                        </Link>
                    </section>

                    <Link
                        to="/reportes"
                        className={`
                            block rounded-2xl p-6 ${glass} hover:border-emerald-400/50 
                            transition-all group h-full 
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-emerald-300 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-lg">Mis Reportes</h3>
                                <p className="text-sm text-white/70">Observa tus análisis.</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/50 ml-auto transform transition-transform group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                    </Link>

                    <Link
                        to="/perfil"
                        className={`
                            block rounded-2xl p-6 ${glass} hover:border-emerald-400/50 
                            transition-all group h-full
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <User className="h-8 w-8 text-emerald-300 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-lg">Mi Cuenta</h3>
                                <p className="text-sm text-white/70">Administra tu perfil.</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/50 ml-auto transform transition-transform group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}