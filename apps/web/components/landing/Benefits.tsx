import { Card } from '@/components/ui/Card';
import {
    TrendingUp,
    Clock,
    Shield,
    BarChart3,
    CheckCircle,
    Users,
} from 'lucide-react';

const benefits = [
    {
        icon: TrendingUp,
        title: 'Aumenta la Productividad',
        description: 'Personal capacitado rinde más y comete menos errores',
    },
    {
        icon: Clock,
        title: 'Ahorra Tiempo',
        description: 'Automatiza la gestión de capacitaciones y certificaciones',
    },
    {
        icon: Shield,
        title: 'Cumplimiento Legal',
        description: 'Credenciales oficiales que cumplen normativas vigentes',
    },
    {
        icon: BarChart3,
        title: 'Reportes en Tiempo Real',
        description: 'Métricas y estadísticas de progreso de tus equipos',
    },
    {
        icon: CheckCircle,
        title: 'Verificación Instantánea',
        description: 'Valida credenciales escaneando el código QR',
    },
    {
        icon: Users,
        title: 'Escalable',
        description: 'Capacita desde 10 hasta 1000+ empleados sin límites',
    },
];

export function Benefits() {
    return (
        <section id="beneficios" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Beneficios para tu Empresa
                    </h2>
                    <p className="text-xl text-slate-800">
                        Digitaliza la capacitación de tu equipo y obtén resultados medibles
                    </p>
                </div>

                {/* Grid de beneficios */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <Card key={index} className="flex flex-col items-start group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="mb-6 relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-100 flex items-center justify-center shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] group-hover:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-500 overflow-hidden">
                                    {/* 3D highlights inside */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/70 to-transparent"></div>
                                    <Icon className="h-8 w-8 text-primary group-hover:scale-95 transition-transform duration-500 drop-shadow-md" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors duration-300">
                                    {benefit.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed font-medium">{benefit.description}</p>
                            </Card>
                        );
                    })}
                </div>

                {/* Estadísticas */}
                <div className="mt-16 bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 sm:p-12 text-white">
                    <div className="grid sm:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">95%</div>
                            <div className="text-white/90 font-medium tracking-wide">
                                Satisfacción de Empresas
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">-40%</div>
                            <div className="text-white/90 font-medium tracking-wide">
                                Reducción de Incidentes
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">24/7</div>
                            <div className="text-white/90 font-medium tracking-wide">
                                Acceso a Plataforma
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
