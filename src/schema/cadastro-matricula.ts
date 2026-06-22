import { z } from "zod";

export const cadastroMatriculaSchema = z.object({
  aluno_id: z.number().int().min(1, "Selecione um aluno"),
  serie_id: z.number().int().min(1, "Selecione uma série"),
  codigo_matricula: z.string()
    .min(3, "O código de matrícula deve ter pelo menos 3 caracteres")
    .max(50, "O código de matrícula deve ter no máximo 50 caracteres"),
  data_matricula: z.string().min(1, "A data de matrícula é obrigatória"),
  data_cancelamento: z.string().nullable().optional(),
  status: z.boolean(),
}).refine((data) => {
  if (data.data_cancelamento && data.data_matricula) {
    const matriculaDate = new Date(data.data_matricula);
    const cancelamentoDate = new Date(data.data_cancelamento);
    return cancelamentoDate >= matriculaDate;
  }
  return true;
}, {
  message: "A data de cancelamento deve ser igual ou posterior à data de matrícula",
  path: ["data_cancelamento"],
});

export type CadastroMatriculaFormData = z.infer<typeof cadastroMatriculaSchema>;
