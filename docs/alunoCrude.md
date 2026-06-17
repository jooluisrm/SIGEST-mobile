# CRUD de Alunos (Listagem, Busca e Cadastro)

Este documento descreve a especificação técnica e a implementação das rotas, paginação, regras de validação e o funcionamento do CRUD de Alunos no aplicativo mobile.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de alunos exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todos os Alunos
* **Método:** `GET`
* **URL:** `/api/alunos`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### B. Buscar Alunos por Nome, Email ou Telefone
* **Método:** `GET`
* **URL:** `/api/alunos/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### C. Cadastrar Aluno
* **Método:** `POST`
* **URL:** `/api/alunos`
* **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
* **Payload de Envio:** Ver a tipagem `CreateAlunoRequest`.

---

## 2. Busca e Listagem no Frontend (React Query)

Para otimizar o carregamento e evitar erros desnecessários, a busca do frontend é reativa:

1. **Busca Vazia ou < 3 caracteres:** O hook `useAlunosQuery` consome a **Listagem Geral** (`GET /api/alunos?page=N`).
2. **Busca >= 3 caracteres:** O hook chaveia automaticamente para a **Rota de Busca** (`GET /api/alunos/value/{value}?page=N`).
3. **Tratamento de Lista Vazia:** Se o backend retornar status `200` com `data: null`, convertemos para um array vazio `[]` no mapeamento dos dados da tela, garantindo que o componente `ListEmptyComponent` da `FlatList` seja renderizado.

---

## 3. Cadastro de Aluno

### Regras de Validação do Laravel (StoreAlunoRequest)
* **Estrutura Independente:** O aluno é criado diretamente na tabela `alunos`, sem possuir um usuário (`User`) correspondente acoplado.
* **`matricula`:** Única e obrigatória.
* **`rg`:** Obrigatória.

> [!WARNING]
> **Inconsistência Crítica Banco de Dados vs Validação (Tratativa no Front):**
> Os campos `nome_pai` e `telefone` estão marcados como `nullable` no validador do backend, mas as colunas no banco de dados não aceitam nulos (gerando erro 500 no servidor).
> **Tratativa:** O frontend torna os campos `nomePai` e `telefone` obrigatórios em sua validação cliente no formulário, prevenindo falhas de banco de dados.

### Formato de Payload e Conversões
* **CPF:** O CPF é higienizado (`dados.cpf.replace(/\D/g, "")`) enviando apenas números puros.
* **RG e Telefones:** Formatações aplicadas no formulário (máscaras) são limpas (`replace(/\D/g, "")`) antes do envio.
* **Status:** O valor string `"Ativo"` ou `"Inativo"` selecionado no formulário é mapeado para um tipo booleano (`true` ou `false`) exigido pelo backend.
* **Data de Nascimento:** O formulário recebe a data no formato brasileiro `DD/MM/AAAA` e a converte para o formato ISO `YYYY-MM-DD` antes do envio.
* **Deficiência:** Caso a opção "Possui alguma deficiência?" seja "Não", é enviado `"Nenhuma"`. Caso seja "Sim", envia-se a descrição digitada em `qualDeficiencia`.

### Mapeamento de Período e Turma
Os valores textuais do dropdown no formulário são mapeados para IDs inteiros:
* **Períodos:** `"1º Ano"` -> `1`, `"2º Ano"` -> `2`, `"3º Ano"` -> `3`, `"4º Ano"` -> `4`.
* **Turmas:** `"Turma A"` -> `1`, `"Turma B"` -> `2`, `"Turma C"` -> `3`.

### Tratamento de Erro de Validação 422
Em vez do tradicional `errors` do Laravel, a API customizada retorna as mensagens sob a chave **`mensagem`** (singular, em português):
```json
{
  "status": false,
  "code": 422,
  "mensagem": {
    "cpf": ["O campo cpf já está em uso."],
    "matricula": ["O campo matrícula já está em uso."]
  }
}
```
**Mapeamento Inline:** O formulário mapeia o objeto `mensagem` do backend (que usa formato snake_case) para os campos equivalentes em camelCase no frontend, exibindo mensagens de erro vermelhas diretamente sob cada campo com problema.

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão definidos em [aluno.ts](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/aluno.ts):
* `CreateAlunoRequest`: Estrutura do payload de cadastro do aluno.
* `CreateAlunoSuccessResponse`: Sucesso (201 Created) contendo os dados do aluno cadastrado com ID gerado.
* `AlunoValidationErrorResponse`: Resposta de validação (422) contendo o dicionário com a chave `mensagem`.

A integração está centralizada em [aluno.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/aluno.ts):
```typescript
export async function createAluno(payload: CreateAlunoRequest) {
  const { data } = await api.post<CreateAlunoSuccessResponse>("/alunos", payload);
  return data;
}

export function useCreateAlunoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAluno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}
```
