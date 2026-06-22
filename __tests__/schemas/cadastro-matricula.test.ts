import { cadastroMatriculaSchema } from "../../src/schema/cadastro-matricula";

describe("cadastroMatriculaSchema", () => {
  it("accepts active matricula without cancellation date", () => {
    expect(() =>
      cadastroMatriculaSchema.parse({
        aluno_id: 1,
        serie_id: 2,
        codigo_matricula: "MAT-2026-001",
        data_matricula: "2026-06-22",
        data_cancelamento: null,
        status: true,
      })
    ).not.toThrow();
  });

  it("rejects cancellation date before matricula date", () => {
    const result = cadastroMatriculaSchema.safeParse({
      aluno_id: 1,
      serie_id: 2,
      codigo_matricula: "MAT-2026-001",
      data_matricula: "2026-06-22",
      data_cancelamento: "2026-06-21",
      status: false,
    });

    expect(result.success).toBe(false);
  });
});
