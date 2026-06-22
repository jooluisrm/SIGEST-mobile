import { cadastroDisciplinaSchema } from "../../src/schema/cadastro-disciplina";

describe("cadastroDisciplinaSchema", () => {
  it("accepts a valid disciplina payload", () => {
    expect(() =>
      cadastroDisciplinaSchema.parse({
        name: "Matematica",
        area_conhecimento: "Exatas",
        carga_horaria: "80h",
        ementa: "Conteudo programatico",
        status: true,
      })
    ).not.toThrow();
  });

  it("rejects short name and empty required fields", () => {
    const result = cadastroDisciplinaSchema.safeParse({
      name: "Ma",
      area_conhecimento: "",
      carga_horaria: "",
      ementa: "",
      status: true,
    });

    expect(result.success).toBe(false);
  });
});
