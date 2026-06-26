import { z } from "zod";

export const cadastroAtividadeSchema = z.object({
  titulo: z.string()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(100, "O título deve ter no máximo 100 caracteres."),
  
  tipo: z.string()
    .min(1, "Selecione o tipo da atividade."),
  
  data_inicio: z.string()
    .min(1, "A data de início é obrigatória.")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de início inválida.",
    }),
  
  data_fim: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Data de fim inválida.",
  }),
  
  descricao: z.string()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .nullable()
    .optional(),
}).refine((data) => {
  if (!data.data_fim) return true;
  const start = new Date(data.data_inicio);
  const end = new Date(data.data_fim);
  return end >= start;
}, {
  message: "A data de fim não pode ser anterior à data de início.",
  path: ["data_fim"],
});

export type CadastroAtividadeData = z.infer<typeof cadastroAtividadeSchema>;
