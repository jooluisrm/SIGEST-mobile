# CRUD de Servidores / Usuários (Listagem, Busca e Cadastro)

Este documento descreve a especificação técnica e a implementação das rotas, paginação, regras de validação e o funcionamento do CRUD de Servidores (referidos no front-end como Usuários) no aplicativo mobile.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de servidores exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todos os Servidores
* **Método:** `GET`
* **URL:** `/api/servidors` (Nota: Plural terminado em `s`, padrão do Laravel)
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### B. Buscar Servidores por Nome ou CPF
* **Método:** `GET`
* **URL:** `/api/servidors/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### C. Cadastrar Servidor
* **Método:** `POST`
* **URL:** `/api/servidors`
* **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
* **Payload de Envio:** Ver a tipagem `CreateServidorRequest`.

---

## 2. Busca e Listagem no Frontend (React Query)

Para otimizar o carregamento e evitar erros desnecessários, a busca do frontend é reativa:

1. **Busca Vazia ou < 3 caracteres:** O hook `useUsuariosQuery` consome a **Listagem Geral** (`GET /api/servidors?page=N`).
2. **Busca >= 3 caracteres:** O hook chaveia automaticamente para a **Rota de Busca** (`GET /api/servidors/value/{value}?page=N`).
3. **Tratamento de Lista Vazia:** Se o backend retornar status `200` com `data: null`, convertemos para um array vazio `[]` no mapeamento dos dados da tela, garantindo que o componente `ListEmptyComponent` da `FlatList` seja renderizado.

---

## 3. Cadastro de Servidor (Usuário)

### Regras de Validação Estritas do Laravel (StoreServidorRequest)
* **Criação Relacional:** A criação ocorre de forma transacional em duas tabelas vinculadas (`users` e `servidors`), onde o usuário é criado primeiro com os dados pessoais, a senha é criptografada e o registro na tabela `servidors` é inserido apontando para o `user_id`. Por fim, é atribuída a role `Servidor` ao usuário.
* **`cargo`:** Obrigatório.
* **`setor`:** Obrigatório.

> [!WARNING]
> **Inconsistência Crítica Banco de Dados vs Validação (Tratativa no Front):**
> Os campos `nome_pai` e `telefone` estão marcados como `nullable` no validador de regras de usuário do Laravel, mas o banco de dados não aceita valores nulos (gerando erro 500 no servidor).
> **Tratativa:** O frontend torna os campos `nomePai` e `telefone` obrigatórios em sua validação cliente no formulário, prevenindo falhas de banco de dados.

### Formato de Payload e Conversões
* **CPF:** O CPF é higienizado (`dados.cpf.replace(/\D/g, "")`) enviando apenas números puros.
* **RG e Telefones:** Formatações aplicadas no formulário (máscaras) são limpas (`replace(/\D/g, "")` e `replace(/[^0-9Xx]/g, "")` no RG) antes do envio.
* **Data de Nascimento:** O formulário recebe a data no formato brasileiro `DD/MM/AAAA` e a converte para o formato ISO `YYYY-MM-DD` antes do envio.
* **Deficiência:** Caso a opção "Possui alguma deficiência?" seja "Não", é enviado `"Nenhuma"`. Caso seja "Sim", envia-se a descrição digitada em `qualDeficiencia`.

### Tratamento de Erro de Validação 422
Em vez do tradicional `errors` do Laravel, a API customizada retorna as mensagens sob a chave **`mensagem`** (singular, em português):
```json
{
  "status": false,
  "code": 422,
  "mensagem": {
    "email": ["O campo email já está em uso."],
    "cargo": ["O campo cargo é obrigatório."]
  }
}
```
**Mapeamento Inline:** O formulário mapeia o objeto `mensagem` do backend (que usa formato snake_case) para os campos equivalentes em camelCase no frontend, exibindo mensagens de erro vermelhas diretamente sob cada campo com problema.

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão definidos em [usuario.ts](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/usuario.ts):
* `GetServidorResponse`: Resposta de sucesso (200 OK) ao buscar um servidor/usuário específico.
* `CreateServidorRequest`: Estrutura do payload de cadastro do servidor/usuário.
* `CreateServidorSuccessResponse`: Sucesso (201 Created) unificando dados pessoais e profissionais.
* `UpdateServidorRequest`: Payload de edição do servidor (campos opcionais). O campo `password` é removido/ignorado.
* `UpdateServidorSuccessResponse`: Resposta de sucesso (200 OK) após atualização.
* `DeleteServidorResponse`: Sucesso (204 No Content) ao deletar.

A integração está centralizada em [usuario.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/usuario.ts):
* **getUsuarioById:** `GET /servidors/{id}`
* **useUsuarioQuery:** Busca dados de um único servidor.
* **updateUsuario:** `PUT /servidors/{id}`
* **useUpdateUsuarioMutation:** Salva edições no servidor.
* **deleteUsuario:** `DELETE /servidors/{id}`
* **useDeleteUsuarioMutation:** Remove o servidor e limpa cache.

---

## 5. Visualização Detalhada, Edição e Exclusão

### A. Detalhe do Servidor (Visualização)
* **Endpoint:** `GET /api/servidors/{id}` (onde `{id}` é o `id_servidor`)
* **Tratativas no Front:**
  * **Tratamento de 404 (Não Encontrado):** Se o registro não existir ou tiver sido removido, exibe-se um alerta amigável e o usuário é redirecionado para a lista de usuários.
  * **Tratamento de Nulos:** Campos nulos (`complemento`, `genero`) devem ser limpos ou tratados para não disparar exceções no React Native.

### B. Edição do Servidor
* **Endpoint:** `PUT /api/servidors/{id}` (onde `{id}` é o `id_servidor`)
* **Atenção (Backend):** O campo `password` é expressamente ignorado pelo backend no update (assim como no Professor). A rota não atualiza a senha.
* **Tratativa:** O formulário de edição do frontend não deve processar ou exigir o campo de senha.

### C. Exclusão do Servidor
* **Endpoint:** `DELETE /api/servidors/{id}` (onde `{id}` é o `id_servidor`)
* **Funcionamento:** Exclui o `user_id` associado, revoga tokens ativos e remove por cascata o registro da tabela `servidors`.
* **Retorno:** Status `204 No Content` (sem corpo).
* **Tratativa:** Ao receber sucesso 204, invalidar queries locais no React Query e redirecionar para a listagem.

