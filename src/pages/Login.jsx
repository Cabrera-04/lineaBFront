import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const glassFormClass = "border border-white/20 bg-background/50 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-emerald-400/50";
    const inputClass = "w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-neutral-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition";

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                "http://localhost:5001/api/auth/login",
                {
                    email: email,
                    password: password,
                }
            );

            localStorage.setItem("token", response.data.token);

            navigate("/dashboard");

        } catch (err) {
            const errorMsg = err.response?.data?.error || "Credenciales inválidas. Intente de nuevo.";
            setError(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans grid place-items-center relative overflow-hidden px-4">

            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl opacity-50 animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: "1.5s" }} />

            <div className={`w-full max-w-md p-8 sm:p-10 rounded-2xl z-10 animate-slide-in-top ${glassFormClass}`} style={{ animationDelay: '0.3s' }}>

                <Link to="/" className="absolute top-4 left-4 p-2 rounded-full text-neutral-300 hover:text-emerald-400 hover:bg-white/10 transition group">
                    <ArrowLeft className="h-6 w-6 group-hover:scale-110 transition" />
                    <span className="sr-only">Volver al inicio</span>
                </Link>

                <div className="text-center mb-8 pt-6">
                    <h1 className="text-3xl font-bold mb-2">Iniciar Sesión en UNESLeaf</h1>
                    <p className="text-neutral-400">Accede a tu cuenta de análisis geoespacial.</p>
                </div>

                <form className="space-y-6" onSubmit={onSubmit}>
                    {/* Input Email */}
                    <div className="animate-slide-in-top" style={{ animationDelay: '0.5s' }}>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-neutral-300">Correo Electrónico</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="email"
                                id="email"
                                placeholder="tu.correo@dominio.com"
                                className={`pl-10 ${inputClass}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div className="animate-slide-in-top" style={{ animationDelay: '0.6s' }}>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-neutral-300">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                className={`pl-10 ${inputClass}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>


                    {error && (
                        <div className="text-red-400 text-sm p-3 bg-red-900/50 border border-red-400/50 rounded-lg animate-fade-in">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-neutral-900 px-6 py-3 text-lg font-bold hover:bg-emerald-300 transition hover:-translate-y-0.5 shadow-xl shadow-emerald-400/50 animate-slide-in-top disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ animationDelay: '0.8s' }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                Iniciar Sesión
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm mt-8 text-neutral-400 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    ¿Aún no tienes cuenta?{" "}
                    <Link to="/register" className="text-emerald-400 hover:text-cyan-400 transition font-medium hover:underline">
                        Crea una cuenta nueva
                    </Link>
                </p>
            </div>
        </div>
    );
}