import { z } from 'zod';

export const evaluacionFormSchema = z.object({
    categoria_id: z.string({
        required_error: 'Debe seleccionar una categoría de curso para evaluar.'
    }).min(1, 'Debe seleccionar una categoría de curso para evaluar.'),
    alumno_nombre: z.string({
        required_error: 'El nombre completo es requerido.'
    }).min(4, 'El nombre debe tener al menos 4 caracteres.'),
    alumno_email: z.string({
        required_error: 'El correo electrónico es requerido.'
    }).email('Debe ingresar un correo electrónico válido.')
});

export type EvaluacionFormData = z.infer<typeof evaluacionFormSchema>;
