# Busca e Listagem de Servidores (Usuários)

Esta documentação descreve a implementação técnica das rotas de servidores (usuários), paginação do Laravel e consumo no aplicativo frontend mobile.

---

## 1. Endpoints Utilizados

As rotas são protegidas e exigem autenticação do usuário com as roles `servidor` ou `admin`.

### Rota A: Listar Todos os Servidores
* **Método:** `GET`
* **URL:** `/servidors` (relativo à base URL `/api`)
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### Rota B: Buscar Servidores por Nome ou CPF
* **Método:** `GET`
* **URL:** `/servidors/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

---

## 2. Funcionamento no Frontend (React Query)

Seguindo as regras do guia de boas práticas `docs/ImplementationWorkflow.md`:

1. **Campo de busca vazio ou < 3 caracteres:**
   - O aplicativo consome a **Rota A** (`/servidors?page=N`) para carregar a lista geral de servidores de forma paginada.
2. **Campo de busca >= 3 caracteres:**
   - O aplicativo altera automaticamente para a **Rota B** (`/servidors/value/{value}?page=N`) enviando o termo de pesquisa.
3. **Limpeza do campo:**
   - Ao limpar a busca, o aplicativo retorna instantaneamente a carregar a listagem geral da Rota A.

---

## 3. Tratativas de Respostas do Backend

O controller de servidores é consistente ao lidar com a ausência de resultados em ambas as rotas (`/servidors` e `/servidors/value/{value}`):

### A. Nenhum registro encontrado (HTTP 200 OK)
* **Comportamento:** Se não houver registros correspondentes (seja na listagem geral ou na busca), a API retorna `200 OK` com `data: null` e a mensagem `"Resultado não encontrado"`.
* **Tratativa:** Convertido para array vazio `[]` para que o frontend renderize o componente visual de "Nenhum usuário encontrado".

### B. Busca Inválida / Curta (HTTP 422)
* **Comportamento:** Ocorre caso o termo enviado tenha menos de 3 caracteres.
* **Tratativa:** Bloqueamos o envio no frontend fazendo a verificação `value.trim().length >= 3`. Caso aconteça, capturamos e mostramos o erro retornado no campo `errors.value[0]`.

### C. Erros de Acesso (HTTP 401 e 403)
* **401 Unauthorized:** Redirecionar o usuário para a tela de login.
* **403 Forbidden:** Bloquear o acesso à tela e exibir uma mensagem amigável de restrição de permissão.
