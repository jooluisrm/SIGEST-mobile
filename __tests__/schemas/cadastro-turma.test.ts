import { cadastroTurmaSchema } from "../../src/schema/cadastro-turma";

describe("cadastroTurmaSchema", () => {
  it("accepts a valid turma payload", () => {
    expect(() =>
      cadastroTurmaSchema.parse({
        serie_id: 1,
        name: "Turma A",
        max_students: 30,
        shift: "Matutino",
        status: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid serie, capacity and shift", () => {
    const result = cadastroTurmaSchema.safeParse({
      serie_id: 0,
      name: "A",
      max_students: 4,
      shift: "Integral",
      status: true,
    });

    expect(result.success).toBe(false);
  });
});
