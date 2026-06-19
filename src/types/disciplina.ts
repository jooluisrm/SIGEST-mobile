/**
 * Modelo de dados da Disciplina retornado pela API.
 */
export interface Disciplina {
  id: number;
  name: string;
  area_conhecimento: string;
  carga_horaria: string;
  ementa: string;
  classroom_id: number;
  professor_id: number;
  status: boolean | number;
}

/**
 * Links de paginação retornados pela API Laravel.
 */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/**
 * Item individual de link dentro do metadado de paginação.
 */
export interface PaginationLinkMeta {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Metadados de paginação retornados pela API Laravel.
 */
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

/**
 * Resposta de sucesso contendo a lista paginada de disciplinas.
 * O Laravel Resource Collection coloca links/meta na raiz.
 */
export interface DisciplinaPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: Disciplina[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhuma disciplina é encontrada.
 */
export interface DisciplinaEmptyResponse {
  status: boolean;
  code: 200;
  message: string;
  data: null;
}

/**
 * Resposta contendo detalhes de uma única disciplina.
 */
export interface GetDisciplinaResponse {
  status: boolean;
  code: number;
  message: string;
  data: Disciplina;
}

/**
 * Payload enviado ao cadastrar a disciplina.
 */
export interface CreateDisciplinaRequest {
  name: string;
  area_conhecimento: string;
  carga_horaria: string;
  ementa: string;
  classroom_id: number;
  professor_id: number;
  status: boolean;
}

/**
 * Resposta de sucesso ao criar disciplina.
 */
export interface CreateDisciplinaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Disciplina;
}

/**
 * Payload de atualização de disciplina.
 */
export interface UpdateDisciplinaRequest {
  name?: string;
  area_conhecimento?: string;
  carga_horaria?: string;
  ementa?: string;
  classroom_id?: number;
  professor_id?: number;
  status?: boolean;
}

/**
 * Resposta de sucesso ao atualizar disciplina.
 */
export interface UpdateDisciplinaSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Disciplina;
}

/**
 * Resposta de erro de validação (HTTP 422 Unprocessable Content) do Laravel backend.
 */
export interface ValidationErrorResponse {
  status: boolean;
  code: number;
  mensagem: {
    [key in keyof CreateDisciplinaRequest]?: string[];
  };
}
