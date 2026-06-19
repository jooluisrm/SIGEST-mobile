/**
 * Modelo de dados do Período/Série Escolar retornado pela API.
 */
export interface Period {
  id: number;
  periodo_letivo_id: number;
  name: string;
  total_hours: number;
  status: boolean | number;
}

/**
 * Modelo de dados da Disciplina retornada na matriz curricular da Série.
 */
export interface MatrizDisciplina {
  id: number;
  name: string;
  area_conhecimento: string;
  carga_horaria: number;
  ementa: string | null;
  status: boolean | number;
  classroom_id: number | null;
  professor_id: number | null;
  period_id: number;
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
 * Resposta de sucesso contendo a lista paginada de períodos/séries.
 */
export interface PeriodPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: Period[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhum período/série é encontrado.
 */
export interface PeriodEmptyResponse {
  status: boolean;
  code: 200;
  message: string;
  data: null;
}

export interface GetPeriodResponse {
  status: boolean;
  code: number;
  message: string;
  data: Period;
}

/**
 * Resposta contendo a matriz curricular (disciplinas) da Série.
 */
export interface PeriodMatrizResponse {
  status: boolean;
  code: number;
  message: string;
  data: MatrizDisciplina[];
}
