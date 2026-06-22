import { cadastroAtividadeSchema } from "../../src/schema/atividade";

describe("cadastroAtividadeSchema", () => {
    it("accepts a valid activity payload", () => {
        expect(() =>
            cadastroAtividadeSchema.parse({
                oferta_disciplina_id: 1,
                titulo: "Prova Mensal de Matemática",
                tipo: "Prova",
                data_inicio: "2026-06-22",
                descricao: "Conteúdo sobre frações"
            })
        ).not.toThrow();
    });

    it("accepts a valid payload with end date", () => {
        expect(() =>
            cadastroAtividadeSchema.parse({
                oferta_disciplina_id: 5,
                titulo: "Trabalho de Geografia",
                tipo: "Trabalho",
                data_inicio: "2026-06-22",
                data_fim: "2026-06-29",
                descricao: null
            })
        ).not.toThrow();
    });

    it("rejects too short title", () => {
        const result = cadastroAtividadeSchema.safeParse({
            oferta_disciplina_id: 1,
            titulo: "Pr",
            tipo: "Prova",
            data_inicio: "2026-06-22"
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
        const result = cadastroAtividadeSchema.safeParse({
            oferta_disciplina_id: 1,
            titulo: "Trabalho de História",
            tipo: "Trabalho",
            data_inicio: "2026/06/22"
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid end date format", () => {
        const result = cadastroAtividadeSchema.safeParse({
            oferta_disciplina_id: 1,
            titulo: "Trabalho de História",
            tipo: "Trabalho",
            data_inicio: "2026-06-22",
            data_fim: "29-06-2026"
        });
        expect(result.success).toBe(false);
    });
});
