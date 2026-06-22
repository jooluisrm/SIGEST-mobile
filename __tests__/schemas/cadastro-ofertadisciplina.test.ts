import { cadastroOfertaDisciplinaSchema } from "../../src/schema/cadastro-ofertadisciplina";

describe("cadastroOfertaDisciplinaSchema", () => {
  it("accepts a valid oferta disciplina payload", () => {
    expect(() =>
      cadastroOfertaDisciplinaSchema.parse({
        disciplina_id: 1,
        classroom_id: 2,
        professor_id: 3,
        periodo_letivo_id: 4,
        status: true,
      })
    ).not.toThrow();
  });

  it("rejects missing relationship ids", () => {
    const result = cadastroOfertaDisciplinaSchema.safeParse({
      disciplina_id: 0,
      classroom_id: 0,
      professor_id: 0,
      periodo_letivo_id: 0,
      status: true,
    });

    expect(result.success).toBe(false);
  });
});
