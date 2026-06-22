import { Disciplina } from "./disciplina";
import { Classroom } from "./turma";
import { Professor } from "./professor";
import { PeriodoLetivo } from "./periodoletivo";

export interface OfertaDisciplina {
  id: number;
  disciplina?: Disciplina;
  classroom?: Classroom;
  professor?: Professor;
  periodo_letivo?: PeriodoLetivo;
  status: boolean | number;
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

export interface OfertaDisciplinaPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: OfertaDisciplina[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface OfertaDisciplinaEmptyGeneralResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

export interface CreateOfertaDisciplinaRequest {
  disciplina_id: number;
  classroom_id: number;
  professor_id: number;
  periodo_letivo_id: number;
  status: boolean;
}

export interface CreateOfertaDisciplinaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: OfertaDisciplina;
}

export interface GetOfertaDisciplinaResponse {
  status: boolean;
  code: number;
  message: string;
  data: OfertaDisciplina;
}

export interface UpdateOfertaDisciplinaRequest {
  disciplina_id?: number;
  classroom_id?: number;
  professor_id?: number;
  periodo_letivo_id?: number;
  status?: boolean;
}

export interface UpdateOfertaDisciplinaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: OfertaDisciplina;
}

export interface DeleteOfertaDisciplinaResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}
