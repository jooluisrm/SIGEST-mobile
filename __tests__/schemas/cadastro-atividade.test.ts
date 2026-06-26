import { cadastroAtividadeSchema } from "../../src/schema/cadastro-atividade";

describe("cadastroAtividadeSchema", () => {
  it("accepts a valid activity payload", () => {
    expect(() =>
      cadastroAtividadeSchema.parse({
        titulo: "Prova Mensal de Matemática",
        tipo: "Prova",
        data_inicio: "2026-06-22",
        data_fim: "2026-06-25",
        descricao: "Conteúdo referente a frações e números decimais.",
      })
    ).not.toThrow();
  });

  it("rejects an activity with start date after end date", () => {
    const result = cadastroAtividadeSchema.safeParse({
      titulo: "Prova de História",
      tipo: "Prova",
      data_inicio: "2026-06-25",
      data_fim: "2026-06-22",
      descricao: "História do Brasil Império.",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("A data de fim não pode ser anterior à data de início.");
    }
  });

  it("rejects invalid title", () => {
    const result = cadastroAtividadeSchema.safeParse({
      titulo: "Pr",
      tipo: "Trabalho",
      data_inicio: "2026-06-22",
      data_fim: "2026-06-22",
      descricao: "Valida descricao",
    });

    expect(result.success).toBe(false);
  });

  it("accepts null or empty description", () => {
    const resultWithEmpty = cadastroAtividadeSchema.safeParse({
      titulo: "Trabalho de Biologia",
      tipo: "Trabalho",
      data_inicio: "2026-06-22",
      data_fim: "2026-06-22",
      descricao: "",
    });
    expect(resultWithEmpty.success).toBe(true);

    const resultWithNull = cadastroAtividadeSchema.safeParse({
      titulo: "Trabalho de Biologia",
      tipo: "Trabalho",
      data_inicio: "2026-06-22",
      data_fim: "2026-06-22",
      descricao: null,
    });
    expect(resultWithNull.success).toBe(true);
  });
});
