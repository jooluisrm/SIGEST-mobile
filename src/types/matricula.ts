import { Aluno } from "./aluno";
import { Period } from "./periodo";

export interface Matricula {
  id: number;
  aluno_id: number;
  serie_id: number;
  codigo_matricula: string;
  data_matricula: string;
  data_cancelamento: string | null;
  status: boolean | number;
  aluno?: Aluno;
  serie?: Period;
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

export interface MatriculaPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Matricula[];
    links: PaginationLinks;
    meta: PaginationMeta;
  } | Matricula[]; // Matches either pagination wrapping style
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface MatriculaEmptyResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

export interface CreateMatriculaRequest {
  aluno_id: number;
  serie_id: number;
  data_matricula: string;
  data_cancelamento?: string | null;
  codigo_matricula: string;
  status: boolean;
}

export interface CreateMatriculaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Matricula;
}

export interface GetMatriculaResponse {
  status: boolean;
  code: number;
  message: string;
  data: Matricula;
}

export interface UpdateMatriculaRequest {
  aluno_id?: number;
  serie_id?: number;
  data_matricula?: string;
  data_cancelamento?: string | null;
  codigo_matricula?: string;
  status?: boolean;
}

export interface UpdateMatriculaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Matricula;
}

export interface DeleteMatriculaResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}
