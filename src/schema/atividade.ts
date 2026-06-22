import { z } from "zod";

export const cadastroAtividadeSchema = z.object({
    oferta_disciplina_id: z.number().int().min(1, "Oferta de disciplina é obrigatória"),
    titulo: z.string().min(3, "O título deve ter no mínimo 3 caracteres").max(255),
    tipo: z.string().min(2, "Selecione o tipo de avaliação"),
    data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início deve ser no formato AAAA-MM-DD"),
    data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final deve ser no formato AAAA-MM-DD").nullable().optional(),
    descricao: z.string().max(1000, "A descrição deve ter no máximo 1000 caracteres").nullable().optional(),
});

export type CadastroAtividadeFormData = z.infer<typeof cadastroAtividadeSchema>;
