import { Card } from '@/components/ui/Card';
import { BookOpen, Users, Award } from 'lucide-react';

const services = [
    {
        icon: BookOpen,
        title: 'Cursos Interactivos',
        description:
            'Capacitaciones teórico-prácticas con videos, quizzes y evaluaciones en tiempo real.',
    },
    {
        icon: Users,
        title: 'Gestión Empresarial',
        description:
            'Panel completo para administrar alumnos, asignar cursos y ver reportes de progreso.',
    },
    {
        icon: Award,
        title: 'Credencial Profesional',
        description:
            'Certificaciones oficiales con código QR verificable y validez industrial inmediata.',
    },
];

export function Services() {
    return (
        <section id="servicios" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Soluciones Integrales de Capacitación
                    </h2>
                    <p className="text-xl text-slate-800">
                        Todo lo que tu empresa necesita para formar profesionales
                        certificados
                    </p>
                </div>

                {/* Grid de servicios */}
                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <Card key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                    <Icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-slate-800 leading-relaxed">
                                    {service.description}
                                </p>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
