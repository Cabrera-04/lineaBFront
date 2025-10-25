import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ArrowRight, User, Lock, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const glassFormClass = "border border-white/20 bg-background/50 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-emerald-400/50";
    const inputClass = "w-full p-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-neutral-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition";

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5001/api/auth/register",
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }
            );

            console.log("Registro exitoso:", response.data);
            localStorage.setItem("token", response.data.token);

            navigate("/dashboard");

        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error al registrarse. Intente de nuevo.";
            setError(errorMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans grid place-items-center relative overflow-hidden py-16 px-4">

            <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl opacity-50 animate-float" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: "2s" }} />

            <div className={`w-full max-w-lg p-8 sm:p-10 rounded-2xl z-10 animate-slide-in-top ${glassFormClass}`} style={{ animationDelay: '0.3s' }}>
                <Link to="/" className="absolute top-4 left-4 p-2 rounded-full text-neutral-300 hover:text-emerald-400 hover:bg-white/10 transition group">
                    <ArrowLeft className="h-6 w-6 group-hover:scale-110 transition" />
                    <span className="sr-only">Volver al inicio</span>
                </Link>

                <div className="text-center mb-8 pt-6">
                    <h1 className="text-3xl font-bold mb-2">Crear una Cuenta</h1>
                    <p className="text-neutral-400">Comienza tu viaje de análisis geoespacial hoy mismo.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Input Username */}
                    <div className="animate-slide-in-top" style={{ animationDelay: '0.5s' }}>
                        <label htmlFor="username" className="block text-sm font-medium mb-2 text-neutral-300">Nombre de Usuario</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="text"
                                id="username"
                                placeholder="GeoExplorer99"
                                className={`pl-10 ${inputClass}`}
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="animate-slide-in-top" style={{ animationDelay: '0.6s' }}>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-neutral-300">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="email"
                                id="email"
                                placeholder="tu.correo@dominio.com"
                                className={`pl-10 ${inputClass}`}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="animate-slide-in-top" style={{ animationDelay: '0.7s' }}>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-neutral-300">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                className={`pl-10 ${inputClass}`}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="animate-slide-in-top" style={{ animationDelay: '0.8s' }}>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-neutral-300">Confirmar Contraseña</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="••••••••"
                                className={`pl-10 ${inputClass}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-neutral-900 px-6 py-3 text-lg font-bold hover:bg-emerald-300 transition transform hover:-translate-y-0.5 shadow-xl shadow-emerald-400/50 animate-slide-in-top disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ animationDelay: '0.9s' }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                Crear Cuenta Gratis
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm mt-8 text-neutral-400 animate-fade-in" style={{ animationDelay: '1.0s' }}>
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-emerald-400 hover:text-cyan-400 transition font-medium hover:underline">
                        Inicia Sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}