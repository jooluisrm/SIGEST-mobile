/**
 * Modelo de dados da Turma (Classroom) retornado pela API.
 */
export interface Classroom {
  id: number;
  period_id: number;
  name: string;
  max_students: number;
  shift: string;
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
 * Dados internos paginados (específico do Classroom).
 */
export interface ClassroomPaginatedData {
  data: Classroom[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta de sucesso contendo a lista de turmas (pode ser paginada ou array plano).
 */
export interface ClassroomPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: ClassroomPaginatedData | Classroom[];
}

/**
 * Resposta retornada quando nenhuma turma é encontrada.
 */
export interface ClassroomEmptyResponse {
  status: boolean;
  code: 200;
  message: string;
  data: null;
}

/**
 * Resposta de erro de validação (ex: busca com menos de 3 caracteres).
 */
export interface ValidationResponseError {
  message: string;
  errors: {
    value?: string[];
    [key: string]: string[] | undefined;
  };
}

/**
 * Payload enviado ao cadastrar a turma.
 */
export interface CreateClassroomRequest {
  period_id: number;
  name: string;
  max_students: number;
  shift: string;
  status: boolean;
}

/**
 * Resposta de sucesso ao criar turma.
 */
export interface CreateClassroomSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Classroom;
}

/**
 * Resposta de erro de validação (HTTP 422 Unprocessable Content) do Laravel backend.
 */
export interface ValidationErrorResponse {
  status: boolean;
  code: number;
  mensagem: {
    [key in keyof CreateClassroomRequest]?: string[];
  };
}

/**
 * Resposta de erro genérico do servidor (500).
 */
export interface GenericErrorResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

/**
 * Resposta contendo detalhes de uma única turma.
 */
export interface GetClassroomResponse {
  status: boolean;
  code: number;
  message: string;
  data: Classroom;
}

/**
 * Payload de atualização de turma.
 */
export interface UpdateClassroomRequest {
  period_id?: number;
  name?: string;
  max_students?: number;
  shift?: string;
  status?: boolean;
}

/**
 * Resposta de sucesso ao atualizar turma.
 */
export interface UpdateClassroomSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Classroom;
}

/**
 * Resposta de sucesso ao gerar turmas automaticamente.
 */
export interface GenerateClassroomsSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: Classroom[];
}
