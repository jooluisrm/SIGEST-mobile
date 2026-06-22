import { MatriculaDisciplina } from "./matriculadisciplina";

export interface Frequencia {
    id: number;
    matricula_disciplina_id: number;
    data: string; // ISO date string (YYYY-MM-DD)
    situacao: boolean; // true = Presente, false = Faltoso
    justificativa?: string | null;
    created_at?: string;
    updated_at?: string;
    matricula_disciplina?: MatriculaDisciplina;
}

export interface CreateFrequenciaRequest {
    matricula_disciplina_id: number;
    data: string; // YYYY-MM-DD
    situacao: boolean;
    justificativa?: string | null;
}

export interface UpdateFrequenciaRequest {
    situacao: boolean;
    justificativa?: string | null;
}

export interface FrequenciaSingleResponse {
    mensagem: string;
    data: Frequencia;
}

export interface FrequenciaListResponse {
    mensagem: string;
    data: Frequencia[] | {
        data: Frequencia[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
