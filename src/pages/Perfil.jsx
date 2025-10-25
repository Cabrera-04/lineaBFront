import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, LogOut, ArrowLeft, User, Lock, CheckCircle, AlertCircle } from "lucide-react";

const glass = "bg-neutral-900/80 backdrop-blur-lg border border-white/15 shadow-lg";
const inputClass = "w-full p-2 rounded-lg bg-neutral-800 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-neutral-900 px-5 py-2 font-bold hover:bg-emerald-300 transition transform hover:scale-105 shadow-lg shadow-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed";

export default function Perfil() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('perfil');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:5001/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (err) {
                console.error("Error al obtener el perfil:", err);
                setError("No se pudo cargar la información. Intenta iniciar sesión de nuevo.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-950 grid place-items-center text-center px-4">
                <div>
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold text-red-400">Error al Cargar</h2>
                    <p className="text-neutral-400 mt-2">{error}</p>
                    <Link to="/login" className="mt-6 inline-block text-emerald-400 font-bold hover:underline">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-neutral-950 text-white font-sans">
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `url('/dashboard-bg.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />

            <header className={`sticky top-0 z-40 ${glass}`}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 grid place-items-center rounded-xl bg-emerald-400/20 border border-emerald-300/50">
                            <MapPin className="h-5 w-5 text-emerald-300" />
                        </div>
                        <h1 className="font-semibold text-white">UNESLeaf • Mi Cuenta</h1>
                    </div>
                    <button onClick={handleLogout} className="text-sm text-neutral-300 hover:text-white inline-flex items-center gap-2 transition">
                        <LogOut className="h-4 w-4" /> Salir
                    </button>
                </div>
            </header>

            <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 animate-fade-in">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200 transition mb-6 font-semibold">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                </Link>

                <h2 className="text-3xl lg:text-4xl font-extrabold mb-8 bg-gradient-to-r from-white to-neutral-400 text-transparent bg-clip-text">
                    Configuración de la Cuenta
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <aside className={`${glass} rounded-2xl p-4 sticky top-24`}>
                        <nav className="flex flex-col space-y-2">
                            <TabButton icon={User} label="Perfil" isActive={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} />
                            <TabButton icon={Lock} label="Seguridad" isActive={activeTab === 'seguridad'} onClick={() => setActiveTab('seguridad')} />
                        </nav>
                    </aside>

                    <div className="w-full">
                        {activeTab === 'perfil' && <ProfileForm user={userData} onUpdate={setUserData} />}
                        {activeTab === 'seguridad' && <SecurityForm />}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProfileForm({ user, onUpdate }) {
    const [username, setUsername] = useState(user.username);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5001/api/auth/profile',
                { username },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(response.data.user);
            setMessage({ type: 'success', text: response.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar el perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className={`${glass} rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in`}>
            <h3 className="text-2xl font-bold text-white">Información del Perfil</h3>
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-neutral-700 grid place-items-center flex-shrink-0">
                    <User className="h-10 w-10 text-neutral-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold">{user.username}</h4>
                    <p className="text-sm text-white/70">Actualiza tus datos personales.</p>
                </div>
            </div>
            <hr className="border-white/10" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="username">Nombre de Usuario</label>
                    <input type="text" id="username" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="email">Correo Electrónico</label>
                    <input type="email" id="email" className={`${inputClass} bg-neutral-800/50 cursor-not-allowed`} value={user.email} readOnly disabled />
                </div>
                <div className="pt-4 flex items-center gap-4">
                    <button type="submit" className={buttonClass} disabled={isSaving || username === user.username}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    {message.text && <ResponseMessage type={message.type} text={message.text} />}
                </div>
            </form>
        </section>
    );
}

function SecurityForm() {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setPasswords(prev => ({...prev, [id]: value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
            return;
        }
        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/auth/change-password',
                { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: response.data.message });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Limpiar campos
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar la contraseña.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className={`${glass} rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in`}>
            <h3 className="text-2xl font-bold text-white">Seguridad</h3>
            <p className="text-white/70">Actualiza tu contraseña periódicamente para mantener tu cuenta segura.</p>
            <hr className="border-white/10" />
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="currentPassword">Contraseña Actual</label>
                    <input type="password" id="currentPassword" className={inputClass} value={passwords.currentPassword} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="newPassword">Nueva Contraseña</label>
                    <input type="password" id="newPassword" className={inputClass} value={passwords.newPassword} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                    <input type="password" id="confirmPassword" className={inputClass} value={passwords.confirmPassword} onChange={handleChange} required />
                </div>
                <div className="pt-4">
                    <button type="submit" className={buttonClass} disabled={isSaving}>
                        {isSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </div>
                {message.text && <div className="pt-2"><ResponseMessage type={message.type} text={message.text} /></div>}
            </form>
        </section>
    );
}

function TabButton({ icon: Icon, label, isActive, onClick }) {
    const activeClass = "bg-emerald-400/20 text-emerald-300";
    const defaultClass = "text-white/70 hover:bg-white/5 hover:text-white";
    return (
        <button onClick={onClick} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${isActive ? activeClass : defaultClass}`}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </button>
    );
}

function ResponseMessage({ type, text }) {
    const isSuccess = type === 'success';
    const colorClass = isSuccess ? 'text-emerald-300' : 'text-red-400';
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    return (
        <div className={`flex items-center gap-2 text-sm font-semibold ${colorClass} animate-fade-in`}>
            <Icon className="h-5 w-5" />
            <span>{text}</span>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="relative min-h-screen bg-neutral-950">
            <header className={`sticky top-0 z-40 ${glass} h-16`}></header>
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="h-5 w-48 bg-neutral-700 rounded-md mb-6 animate-pulse"></div>
                <div className="h-10 w-3/4 bg-neutral-700 rounded-md mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <div className={`${glass} rounded-2xl p-4 h-32 animate-pulse`}></div>
                    <div className={`${glass} rounded-2xl p-8 space-y-6 animate-pulse`}>
                        <div className="h-8 w-1/2 bg-neutral-700 rounded-md"></div>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-neutral-700"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-neutral-700 rounded-md"></div>
                                <div className="h-4 w-60 bg-neutral-700 rounded-md"></div>
                            </div>
                        </div>
                        <div className="h-px bg-neutral-700 w-full"></div>
                        <div className="space-y-4">
                            <div className="h-4 w-24 bg-neutral-700 rounded-md"></div>
                            <div className="h-9 w-full bg-neutral-700 rounded-md"></div>
                            <div className="h-4 w-32 bg-neutral-700 rounded-md"></div>
                            <div className="h-9 w-full bg-neutral-700 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

