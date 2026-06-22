import { z } from "zod";

export const cadastroOfertaDisciplinaSchema = z.object({
  disciplina_id: z.number().int().min(1, "Selecione uma disciplina"),
  classroom_id: z.number().int().min(1, "Selecione uma turma"),
  professor_id: z.number().int().min(1, "Selecione um professor"),
  periodo_letivo_id: z.number().int().min(1, "Selecione um período letivo"),
  status: z.boolean(),
});

export type CadastroOfertaDisciplinaFormData = z.infer<typeof cadastroOfertaDisciplinaSchema>;
