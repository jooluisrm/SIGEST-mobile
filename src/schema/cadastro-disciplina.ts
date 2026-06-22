import { z } from "zod";

export const cadastroDisciplinaSchema = z.object({
  name: z.string()
    .min(3, "O nome da disciplina deve ter pelo menos 3 caracteres")
    .max(35, "O nome da disciplina deve ter no máximo 35 caracteres"),
  area_conhecimento: z.string()
    .min(1, "A área de conhecimento é obrigatória")
    .max(35, "A área de conhecimento deve ter no máximo 35 caracteres"),
  carga_horaria: z.string()
    .min(1, "A carga horária é obrigatória"),
  ementa: z.string()
    .min(1, "A ementa é obrigatória")
    .max(500, "A ementa deve ter no máximo 500 caracteres"),
  status: z.boolean(),
});

export type CadastroDisciplinaFormData = z.infer<typeof cadastroDisciplinaSchema>;
