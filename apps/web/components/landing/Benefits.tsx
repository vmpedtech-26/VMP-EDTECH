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
                            <Card key={index} className="flex flex-col items-start">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 mb-4">
                                    <Icon className="h-6 w-6 text-success" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-slate-800">{benefit.description}</p>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
