/**
 * Modelo de dados do Aluno retornado pela API.
 * Mapeado a partir de AlunoResource.
 */
export interface Aluno {
  period_id: number | null;
  classroom_id: number | null;
  id: number;
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
  matricula: string;
  turma: any | null; // Tipo genérico para turma
  status: string | number;
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
 * Resposta típica para listagem paginada (sucesso com resultados).
 */
export interface AlunosPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: Aluno[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Caso especial de retorno da rota de listagem geral (/alunos)
 * quando nenhum registro existe no banco.
 */
export interface AlunosEmptyGeneralResponse {
  status: boolean;
  code: 200;
  message: string; // "Resultado não encontrado"
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

// Payload enviado ao cadastrar o aluno
export interface CreateAlunoRequest {
  period_id?: number | null; // Opcional
  classroom_id?: number | null; // Opcional
  name: string;
  cpf: string;
  rg: string; // Obrigatório no validador do backend!
  data_nascimento: string; // Formato YYYY-MM-DD
  nome_pai: string; // Obrigatório no banco de dados!
  nome_mae: string;
  genero?: string | null; // Opcional
  deficiencia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string | null; // Opcional
  cidade: string;
  estado: string; // Ex: "SP"
  telefone: string; // Obrigatório no banco de dados!
  celular: string;
  email: string;
  matricula: string; // Matrícula única
  status: boolean; // Ex: true para ativo
}

// Dados do aluno retornados pelo backend
export interface AlunoData {
  id: number;
  period_id: number | null;
  classroom_id: number | null;
  name: string;
  cpf: string;
  rg: string | null;
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
  matricula: string;
  status: boolean;
  turma?: any; // Retorna informações da turma se carregada
}

// Resposta de sucesso (201 Created)
export interface CreateAlunoSuccessResponse {
  status: boolean; // true
  code: number; // 201
  message: string;
  data: AlunoData;
}

// Resposta de erro de validação (422 Unprocessable Content)
export interface AlunoValidationErrorResponse {
  status: boolean; // false
  code: number; // 422
  mensagem: {
    [key in keyof CreateAlunoRequest]?: string[];
  };
}

// Resposta de erro genérico do servidor
export interface AlunoGenericErrorResponse {
  status: boolean; // false
  code: number;
  message: string;
  data: null;
}

export interface GetAlunoResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: AlunoData;
}

export interface UpdateAlunoRequest extends Partial<Omit<CreateAlunoRequest, 'name'>> {
  name: string; // Sempre obrigatório na edição!
}

export interface UpdateAlunoSuccessResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: AlunoData;
}

export type DeleteAlunoResponse = null;

