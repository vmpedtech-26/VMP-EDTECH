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
        image: '/images/icons/productivity.png',
        title: 'Aumenta la Productividad',
        description: 'Personal capacitado rinde más y comete menos errores',
    },
    {
        image: '/images/icons/time.png',
        title: 'Ahorra Tiempo',
        description: 'Automatiza la gestión de capacitaciones y certificaciones',
    },
    {
        image: '/images/icons/compliance.png',
        title: 'Cumplimiento Normativo',
        description: 'Credenciales oficiales que cumplen normativas vigentes',
    },
    {
        image: '/images/icons/reports.png',
        title: 'Reportes en Tiempo Real',
        description: 'Métricas y estadísticas de progreso de tus equipos',
    },
    {
        image: '/images/icons/verification.png',
        title: 'Verificación Instantánea',
        description: 'Valida credenciales escaneando el código QR',
    },
    {
        image: '/images/icons/scalability.png',
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
                        return (
                            <Card key={index} className="flex flex-col items-start hover:shadow-lg transition-shadow">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden mb-4 ring-2 ring-slate-100 shadow-sm">
                                    <img 
                                        src={benefit.image} 
                                        alt={benefit.title} 
                                        className="w-full h-full object-cover"
                                    />
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
