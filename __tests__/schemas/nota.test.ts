import { cadastroNotaSchema } from "../../src/schema/nota";

describe("cadastroNotaSchema", () => {
    it("accepts a valid grade payload", () => {
        expect(() =>
            cadastroNotaSchema.parse({
                matricula_disciplina_id: 1,
                atividade_id: 2,
                nota: 7.5
            })
        ).not.toThrow();
    });

    it("accepts minimum grade (0)", () => {
        expect(() =>
            cadastroNotaSchema.parse({
                matricula_disciplina_id: 1,
                atividade_id: 2,
                nota: 0
            })
        ).not.toThrow();
    });

    it("accepts maximum grade (10)", () => {
        expect(() =>
            cadastroNotaSchema.parse({
                matricula_disciplina_id: 1,
                atividade_id: 2,
                nota: 10
            })
        ).not.toThrow();
    });

    it("rejects negative grade", () => {
        const result = cadastroNotaSchema.safeParse({
            matricula_disciplina_id: 1,
            atividade_id: 2,
            nota: -1.5
        });
        expect(result.success).toBe(false);
    });

    it("rejects grade above 10", () => {
        const result = cadastroNotaSchema.safeParse({
            matricula_disciplina_id: 1,
            atividade_id: 2,
            nota: 10.5
        });
        expect(result.success).toBe(false);
    });
});
