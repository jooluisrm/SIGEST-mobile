# Busca e Listagem de Alunos

Esta documentação descreve a implementação técnica das rotas de alunos, paginação do Laravel e consumo no aplicativo frontend mobile.

---

## 1. Endpoints Utilizados

As rotas são protegidas e exigem autenticação do usuário com as roles `servidor` ou `admin`.

### Rota A: Listar Todos os Alunos
* **Método:** `GET`
* **URL:** `/alunos` (relativo à base URL `/api`)
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### Rota B: Buscar Alunos por Nome
* **Método:** `GET`
* **URL:** `/alunos/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

---

## 2. Funcionamento no Frontend (React Query)

Seguindo o guia `docs/ImplementationWorkflow.md`:

1. **Campo de busca vazio ou < 3 caracteres:**
   - O aplicativo consome a **Rota A** (`/alunos?page=N`) para carregar todos os alunos de forma paginada.
2. **Campo de busca >= 3 caracteres:**
   - O aplicativo altera automaticamente para a **Rota B** (`/alunos/value/{value}?page=N`) enviando o termo de pesquisa.
3. **Limpeza do campo:**
   - Ao limpar a busca, o aplicativo retorna instantaneamente a carregar a listagem geral da Rota A.

---

## 3. Tratativas de Respostas Especiais do Backend

Diferente do módulo de professores, o Laravel possui comportamentos distintos quando não há registros:

### A. Lista Geral Vazia (GET /alunos)
* **Comportamento:** Retorna HTTP `200` com `data: null` e mensagem `"Resultado não encontrado"`.
* **Tratativa:** Convertido para array vazio `[]` para evitar erros e mostrar a mensagem visual "Nenhum aluno encontrado".

### B. Busca Sem Correspondências (GET /alunos/value/{value})
* **Comportamento:** Retorna HTTP `200` com `data: []` (array vazio) e mensagem `"Coleção vazia"`, mantendo os metadados de paginação.
* **Tratativa:** Identificado como array vazio `[]` e exibido no componente de lista vazia.

### C. Busca Inválida / Curta (HTTP 422)
* **Comportamento:** Ocorre caso o termo enviado tenha menos de 3 caracteres.
* **Tratativa:** Evitamos a chamada validando o comprimento da string no frontend. Caso ocorra, capturamos `error.response.data.errors` e exibimos o alerta específico.
