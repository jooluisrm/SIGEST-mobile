import { z } from "zod";

export const lancarFrequenciaSchema = z.object({
    matricula_disciplina_id: z.coerce.number().min(1, "Matrícula na disciplina inválida"),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
    situacao: z.boolean(),
    justificativa: z.string().max(500, "A justificativa deve ter no máximo 500 caracteres").nullable().optional(),
});

export type LancarFrequenciaFormData = z.infer<typeof lancarFrequenciaSchema>;
