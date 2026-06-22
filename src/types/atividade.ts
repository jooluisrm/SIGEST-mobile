import { OfertaDisciplina } from "./ofertadisciplina";

export interface Atividade {
    id: number;
    oferta_disciplina_id: number;
    titulo: string;
    tipo: string; // Prova, Trabalho, etc.
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
    created_at?: string;
    updated_at?: string;
    oferta_disciplina?: OfertaDisciplina;
}

export interface CreateAtividadeRequest {
    oferta_disciplina_id: number;
    titulo: string;
    tipo: string;
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
}

export interface UpdateAtividadeRequest {
    titulo: string;
    tipo: string;
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
}

export interface AtividadeSingleResponse {
    mensagem: string;
    data: Atividade;
}

export interface AtividadeListResponse {
    mensagem: string;
    data: Atividade[] | {
        data: Atividade[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
