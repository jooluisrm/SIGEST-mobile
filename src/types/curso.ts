/**
 * Modelo de dados do Curso retornado pela API.
 */
export interface Course {
  id: number;
  name: string;
  number_periods: number;
  total_hours: number;
  details: string | null;
  status: boolean;
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
 * Resposta de sucesso contendo a lista paginada de cursos.
 */
export interface CoursesPaginatedResponse {
  status: boolean;
  code: number; // Ex: 200
  message: string;
  data: Course[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhum curso é encontrado.
 * O Laravel retorna status 200 com "Resultado não encontrado" e data = null.
 */
export interface CoursesEmptyResponse {
  status: boolean;
  code: 200;
  message: string; // Ex: "Resultado não encontrado"
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

// Payload enviado ao cadastrar o curso
export interface CreateCourseRequest {
  name: string;
  number_periods: number;
  total_hours: number;
  details?: string | null;
  status?: boolean;
}

// Resposta de sucesso (200 OK ou 201 Created) ao criar curso
export interface CreateCourseSuccessResponse {
  status: boolean; // true
  code: number;
  message: string;
  data: Course;
}

// Resposta de erro de validação (422 Unprocessable Content)
export interface ValidationErrorResponse {
  status: boolean; // false
  code: number; // 422
  mensagem: {
    [key in keyof CreateCourseRequest]?: string[];
  };
}

// Resposta de erro genérico do servidor (500)
export interface GenericErrorResponse {
  status: boolean; // false
  code: number;
  message: string;
  data: null;
}

export interface GetCourseResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: Course;
}

// Payload de atualização do curso (o campo number_periods é opcional, embora ignorado pelo backend)
export interface UpdateCourseRequest {
  name?: string;
  number_periods?: number;
  total_hours?: number;
  details?: string | null;
  status?: boolean;
}

export interface UpdateCourseSuccessResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: Course;
}

export type DeleteCourseResponse = null;
