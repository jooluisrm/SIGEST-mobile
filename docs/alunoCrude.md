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
* `GetAlunoResponse`: Sucesso (200 OK) ao buscar um aluno específico.
* `CreateAlunoRequest`: Estrutura do payload de cadastro do aluno.
* `CreateAlunoSuccessResponse`: Sucesso (201 Created) contendo os dados do aluno cadastrado.
* `UpdateAlunoRequest`: Payload de edição. Contém `name` obrigatório e demais campos opcionais.
* `UpdateAlunoSuccessResponse`: Sucesso (200 OK) após atualização.
* `DeleteAlunoResponse`: Sucesso (204 No Content) após deleção (retorna vazio/null).

A integração está centralizada em [aluno.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/aluno.ts):
* **getAlunoById:** `GET /alunos/{id}`
* **useAlunoQuery:** Busca dados de um único aluno, habilitado apenas quando o ID é válido.
* **updateAluno:** `PUT /alunos/{id}`
* **useUpdateAlunoMutation:** Salva alterações de edição do aluno.
* **deleteAluno:** `DELETE /alunos/{id}`
* **useDeleteAlunoMutation:** Remove o aluno e invalida a listagem.

---

## 5. Visualização Detalhada, Edição e Exclusão

### A. Detalhe do Aluno (Visualização)
* **Endpoint:** `GET /api/alunos/{id}`
* **Tratativas no Front:**

  * **Tratamento de 404 (Não Encontrado):** Caso o aluno não exista ou tenha sido removido, exibe-se um alerta amigável e redireciona o usuário para a listagem principal.

### B. Edição do Aluno
* **Endpoint:** `PUT /api/alunos/{id}`
* **Regra de Negócio Crítica (Backend):** O validador de edição (`UpdateAlunoRequest`) exige que o campo `name` seja **sempre obrigatório** na edição, mesmo que ele não tenha sido modificado.
* **Tratativa:** O payload enviado deve sempre incluir o campo `name` atualizado ou o valor anterior intacto.

### C. Exclusão do Aluno
* **Endpoint:** `DELETE /api/alunos/{id}`
* **Retorno:** Status `204 No Content` (sem corpo de resposta).
* **Tratativa:** Ao obter o retorno de sucesso (204), a listagem deve ser invalidada no React Query e o usuário deve ser redirecionado para a tela de listagem.

