import { redirect } from 'next/navigation';

// /auth/login era una implementación heredada de una versión anterior del
// sistema ("Blister"), duplicada con /login y con bugs propios (no
// integraba con el AuthContext real, redirigía siempre a
// /admin/capacitaciones sin importar el rol). Se unificó todo hacia
// /login; esto queda solo por si algún enlace viejo todavía apunta acá.
export default function LegacyAuthLoginRedirect() {
    redirect('/login');
}
