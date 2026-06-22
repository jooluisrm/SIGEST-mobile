import { Atividade } from "./atividade";
import { MatriculaDisciplina } from "./matriculadisciplina";

export interface NotaAtividade {
    id: number;
    matricula_disciplina_id: number;
    atividade_id: number;
    nota: number; // Decimal scale 0.0 to 10.0
    created_at?: string;
    updated_at?: string;
    atividade?: Atividade;
    matricula_disciplina?: MatriculaDisciplina;
}

export interface CreateNotaRequest {
    matricula_disciplina_id: number;
    atividade_id: number;
    nota: number;
}

export interface UpdateNotaRequest {
    nota: number;
}

export interface NotaSingleResponse {
    mensagem: string;
    data: NotaAtividade;
}

export interface NotaListResponse {
    mensagem: string;
    data: NotaAtividade[] | {
        data: NotaAtividade[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
