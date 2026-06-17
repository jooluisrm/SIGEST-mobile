/**
 * Modelo de dados do Professor retornado nas listagens.
 * Mapeado a partir de ProfessorResource.
 */
export interface Professor {
  id_user: number;
  id_professor: number;
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string; // Formato "YYYY-MM-DD"
  nome_pai: string | null;
  nome_mae: string | null;
  genero: string;
  deficiencia: string | null;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  telefone: string | null;
  celular: string;
  email: string;
  matricula_adpm: string;
  codigo_disciplina: string | null;
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
 * Resposta de sucesso contendo a lista paginada de professores.
 */
export interface ProfessorsPaginatedResponse {
  status: boolean;
  code: number; // Ex: 200
  message: string;
  data: Professor[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhum professor é encontrado.
 * O Laravel retorna status 200 com "Resultado não encontrado" e data = null.
 */
export interface ProfessorsEmptyResponse {
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

// Payload enviado ao cadastrar o professor
export interface CreateProfessorRequest {
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string; // Formato YYYY-MM-DD
  nome_pai: string; // Obrigatório no banco de dados!
  nome_mae: string;
  genero?: string | null; // Opcional no banco
  deficiencia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string | null; // Opcional no banco
  cidade: string;
  estado: string; // Ex: "SP"
  telefone: string; // Obrigatório no banco de dados!
  celular: string;
  email: string;
  password?: string; // Obrigatório na criação
  matricula_adpm: string;
  codigo_disciplina: string;
}

// Dados do professor retornados na propriedade 'data'
export interface ProfessorData {
  id_user: number;
  id_professor: number;
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  nome_pai: string;
  nome_mae: string;
  genero: string | null;
  deficiencia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  telefone: string;
  celular: string;
  email: string;
  matricula_adpm: string;
  codigo_disciplina: string;
}

// Resposta de sucesso (201 Created)
export interface CreateProfessorSuccessResponse {
  status: boolean; // true
  code: number; // 201
  message: string;
  data: ProfessorData;
}

// Resposta de erro de validação (422 Unprocessable Content)
export interface ValidationErrorResponse {
  status: boolean; // false
  code: number; // 422
  mensagem: {
    [key in keyof CreateProfessorRequest]?: string[];
  };
}

// Resposta de erro genérico do servidor (500) ou outras falhas
export interface GenericErrorResponse {
  status: boolean; // false
  code: number;
  message: string;
  data: null;
}

export interface GetProfessorResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: ProfessorData;
}

export interface UpdateProfessorRequest extends Partial<Omit<CreateProfessorRequest, 'password'>> {}

export interface UpdateProfessorSuccessResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: ProfessorData;
}

export type DeleteProfessorResponse = null;

