import { Matricula } from "./matricula";
import { OfertaDisciplina } from "./ofertadisciplina";

export interface MatriculaDisciplina {
  id: number;
  matricula_id: number;
  oferta_disciplina_id: number;
  matricula?: Matricula;
  oferta_disciplina?: OfertaDisciplina;
  created_at?: string;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationLinkMeta {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLinkMeta[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface MatriculaDisciplinaPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: MatriculaDisciplina[];
    links: PaginationLinks;
    meta: PaginationMeta;
  } | MatriculaDisciplina[]; // Matches either paginated or flat data
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface MatriculaDisciplinaEmptyResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

export interface CreateMatriculaDisciplinaRequest {
  matricula_id: number;
  oferta_disciplina_id: number;
}

export interface CreateMatriculaDisciplinaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: MatriculaDisciplina;
}

export interface GetMatriculaDisciplinaResponse {
  status: boolean;
  code: number;
  message: string;
  data: MatriculaDisciplina;
}

export interface DeleteMatriculaDisciplinaResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}
