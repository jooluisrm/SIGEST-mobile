import { lancarFrequenciaSchema } from "../../src/schema/frequencia";

describe("lancarFrequenciaSchema", () => {
    it("accepts a valid frequency payload", () => {
        expect(() =>
            lancarFrequenciaSchema.parse({
                matricula_disciplina_id: 12,
                data: "2026-06-22",
                situacao: true,
                justificativa: null
            })
        ).not.toThrow();
    });

    it("accepts a valid payload with justification", () => {
        expect(() =>
            lancarFrequenciaSchema.parse({
                matricula_disciplina_id: 12,
                data: "2026-06-22",
                situacao: false,
                justificativa: "Apresentou atestado médico"
            })
        ).not.toThrow();
    });

    it("rejects invalid date format", () => {
        const result = lancarFrequenciaSchema.safeParse({
            matricula_disciplina_id: 12,
            data: "22/06/2026",
            situacao: true
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid matricula id", () => {
        const result = lancarFrequenciaSchema.safeParse({
            matricula_disciplina_id: 0,
            data: "2026-06-22",
            situacao: true
        });
        expect(result.success).toBe(false);
    });

    it("rejects justification exceeding 500 characters", () => {
        const longJustification = "a".repeat(501);
        const result = lancarFrequenciaSchema.safeParse({
            matricula_disciplina_id: 12,
            data: "2026-06-22",
            situacao: false,
            justificativa: longJustification
        });
        expect(result.success).toBe(false);
    });
});
