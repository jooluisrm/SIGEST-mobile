import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório." })
    .min(1, "E-mail é obrigatório.")
    .email("Insira um e-mail válido."),
});

export const validateCodeSchema = z.object({
  code: z
    .string({ required_error: "Código é obrigatório." })
    .length(6, "O código de verificação deve ter exatamente 6 dígitos.")
    .regex(/^\d+$/, "O código deve conter apenas números."),
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: "Senha é obrigatória." })
    .min(8, "A senha deve ter pelo menos 8 caracteres."),
  passwordConfirmation: z
    .string({ required_error: "Confirmação da senha é obrigatória." })
    .min(1, "Confirmação da senha é obrigatória."),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas não coincidem.",
  path: ["passwordConfirmation"],
});
