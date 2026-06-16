# Busca e Listagem de Professores

Esta documentação descreve a implementação técnica das rotas de professores, paginação do Laravel e consumo no aplicativo frontend mobile.

---

## 1. Endpoints Utilizados

Ambas as rotas exigem autenticação do usuário com as roles `servidor` ou `admin`.

### Rota A: Listar Todos os Professores
* **Método:** `GET`
* **URL:** `/api/professors`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### Rota B: Buscar Professores por Nome ou CPF
* **Método:** `GET`
* **URL:** `/api/professors/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

---

## 2. Funcionamento no Frontend (React Query)

Para otimizar o carregamento e evitar erros desnecessários, a busca do frontend é reativa:

1. **Campo de busca vazio ou < 3 caracteres:**
   - O aplicativo consome a **Rota A** (`/api/professors?page=N`) para trazer a listagem geral paginada de professores.
2. **Campo de busca >= 3 caracteres:**
   - O aplicativo altera automaticamente para a **Rota B** (`/api/professors/value/{value}?page=N`) enviando o termo digitado.
3. **Limpeza do campo:**
   - Ao limpar a busca, o aplicativo retorna instantaneamente a carregar a listagem geral da Rota A.

---

## 3. Paginação do Laravel (LengthAwarePaginator)

O backend do Laravel responde utilizando paginação padrão (10 registros por página). A resposta de sucesso contém a seguinte estrutura:

```json
{
  "status": true,
  "code": 200,
  "message": "Professores listados com sucesso",
  "data": [ ... ],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 27
  }
}
```

* **`meta.current_page`**: Página atual renderizada.
* **`meta.last_page`**: Total de páginas disponíveis (utilizado para desabilitar o botão "próximo" no rodapé).
* **`data`**: Array com a lista de professores.

---

## 4. Tratativas de Respostas Especiais

### A. Nenhum Professor Encontrado (HTTP 200)
O Laravel responde com status `200 OK`, porém o campo `data` vem como `null`:
```json
{
  "status": true,
  "code": 200,
  "message": "Resultado não encontrado",
  "data": null
}
```
**Tratativa no Frontend:** Mapeamos `data` para um array vazio `[]` de forma que a tela exiba a ilustração de "Nenhum professor encontrado" em vez de quebrar ou carregar infinitamente.

### B. Erro de Validação (HTTP 422)
Ocorre caso o termo enviado tenha menos de 3 caracteres.
* **Tratativa:** Evitamos a chamada validando o tamanho da string antes do envio. Caso aconteça, tratamos o erro capturando `error.response.data.errors` e exibindo um alerta.

### C. Não Autorizado (HTTP 403)
Ocorre se um usuário autenticado tentar ver a lista sem pertencer às roles `admin` ou `servidor`.
* **Tratativa:** O aplicativo impede a navegação para a tela e exibe uma mensagem de bloqueio amigável.
