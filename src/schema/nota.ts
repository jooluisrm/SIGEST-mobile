import { z } from "zod";

export const cadastroNotaSchema = z.object({
    matricula_disciplina_id: z.coerce.number().min(1, "Matrícula na disciplina é obrigatória"),
    atividade_id: z.coerce.number().min(1, "Atividade é obrigatória"),
    nota: z.coerce.number().min(0, "A nota mínima é 0").max(10, "A nota máxima é 10"),
});

export type CadastroNotaFormData = z.infer<typeof cadastroNotaSchema>;
