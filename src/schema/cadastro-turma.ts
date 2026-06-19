import { z } from "zod";

export const cadastroTurmaSchema = z.object({
  period_id: z.number().int().min(1, "Selecione uma série escolar"),
  name: z.string()
    .min(5, "O nome da turma deve ter pelo menos 5 caracteres")
    .max(30, "O nome da turma deve ter no máximo 30 caracteres"),
  max_students: z.number()
    .int("A capacidade máxima deve ser um número inteiro")
    .min(5, "A capacidade mínima é de 5 alunos")
    .max(60, "A capacidade máxima é de 60 alunos"),
  shift: z.enum(["Matutino", "Vespertino", "Noturno"]),
  status: z.boolean(),
});

export type CadastroTurmaFormData = z.infer<typeof cadastroTurmaSchema>;
