/**
 * Modelo de dados do Período Letivo retornado pela API.
 */
export interface PeriodoLetivo {
  id: number;
  course_id: number;
  name: string;
  data_inicio: string; // Formato "YYYY-MM-DD"
  data_encerramento: string; // Formato "YYYY-MM-DD"
  status: boolean | number; // 1 para ativo, 0 para inativo ou boolean
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
  per_page: number; // Sempre 10 no backend
  to: number | null;
  total: number;
}

/**
 * Resposta de sucesso contendo a lista paginada de períodos letivos.
 */
export interface PeriodoLetivoPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: PeriodoLetivo[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhum período letivo é encontrado.
 */
export interface PeriodoLetivoEmptyResponse {
  status: boolean;
  code: 200;
  message: string;
  data: null;
}

// Payload enviado ao cadastrar o período letivo
export interface CreatePeriodoLetivoRequest {
  course_id: number;
  name: string;
  data_inicio: string; // Formato YYYY-MM-DD
  data_encerramento: string; // Formato YYYY-MM-DD
  status?: boolean | number;
}

// Resposta de sucesso (201 Created) ao criar período letivo
export interface CreatePeriodoLetivoSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: PeriodoLetivo;
}

// Resposta de erro de validação (422 Unprocessable Content) no padrão nativo Laravel FormRequest
export interface LaravelValidationErrorResponse {
  message: string;
  errors: {
    [key in keyof CreatePeriodoLetivoRequest]?: string[];
  } & {
    [key: string]: string[] | undefined;
  };
}

// Resposta de erro genérico do servidor (500)
export interface GenericErrorResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

export interface GetPeriodoLetivoResponse {
  status: boolean;
  code: number;
  message: string;
  data: PeriodoLetivo;
}

// Payload de atualização do período letivo
export interface UpdatePeriodoLetivoRequest extends Partial<CreatePeriodoLetivoRequest> {}

export interface UpdatePeriodoLetivoSuccessResponse {
  status: boolean;
  code: number;
  message: string;
  data: PeriodoLetivo;
}

export type DeletePeriodoLetivoResponse = null;
