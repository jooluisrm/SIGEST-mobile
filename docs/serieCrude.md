# Integração de Série / Ano Escolar (Serie CRUD)

Este documento descreve a especificação técnica, regras de negócio e a integração das rotas de gerenciamento da entidade **Série / Ano Escolar (Serie)** no aplicativo mobile `sigest-mobile`.

---

## 1. Funcionamento & Regra de Negócio

No banco de dados, as **Séries** (representadas pelo modelo `Serie`) correspondem aos anos escolares (ex: `1ª ano`, `6ª ano`).

Na branch `main01`, esta entidade possui **CRUD completo** no backend, incluindo criação, atualização e exclusão, além de continuar sendo gerada automaticamente ao criar períodos letivos.

---

## 2. Endpoints Utilizados (Backend)

Todas as rotas de séries exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todas as Séries
* **Método:** `GET`
* **URL:** `/api/series`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)
* **Retorno de Sucesso (HTTP 200):** Coleção paginada de 10 séries.

### B. Criar Série
* **Método:** `POST`
* **URL:** `/api/series`
* **Payload de Envio:**
  ```json
  {
    "periodo_letivo_id": 1,
    "name": "6ª Ano",
    "total_hours": 800,
    "status": true
  }
  ```

### C. Buscar Séries por Nome/Valor
* **Método:** `GET`
* **URL:** `/api/series/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).

### D. Filtrar Séries por Período Letivo
* **Método:** `GET`
* **URL:** `/api/series/{periodo_letivo_id}/series-por-periodo-letivo`

### E. Detalhar Série (por ID)
* **Método:** `GET`
* **URL:** `/api/series/{id}`

### F. Atualizar Série (por ID)
* **Método:** `PUT/PATCH`
* **URL:** `/api/series/{id}`

### G. Excluir Série (por ID)
* **Método:** `DELETE`
* **URL:** `/api/series/{id}`

### H. Obter Matriz Curricular (Disciplinas)
* **Método:** `GET`
* **URL:** `/api/series/{id}/matriz`
* **Descrição:** Retorna a lista de disciplinas (`Disciplinas`) vinculadas a esta série específica.

---

## 3. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão declarados em [periodo.ts (Types)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/periodo.ts):
* `Period`: Interface representando o modelo da série.
* `MatrizDisciplina`: Mapeia as disciplinas associadas à matriz curricular da série.
* `PeriodPaginatedResponse`: Resposta paginada de listagem.
* `PeriodMatrizResponse`: Lista de disciplinas da matriz curricular da série.

A camada de chamadas e queries TanStack Query reside em [periodo.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/periodo.ts):
* **usePeriodsInfiniteQuery:** Busca paginada infinita geral de séries (agora apontando para `/api/series`).
* **usePeriodsByPeriodoLetivoQuery:** Filtra séries vinculadas a um período letivo. Útil para dropdowns encadeados em tempo real.
* **usePeriodQuery:** Carrega detalhes da série por ID.
* **usePeriodMatrizQuery:** Busca as disciplinas associadas à matriz curricular da série.
