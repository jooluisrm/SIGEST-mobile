# Integração de Série / Período Escolar (Leitura e Matriz Curricular)

Este documento descreve a especificação técnica, regras de negócio e a integração das rotas de consulta da entidade **Série / Período Escolar (Period)** no aplicativo mobile.

---

## 1. Funcionamento & Regra de Negócio (Apenas Leitura)

No banco de dados, as **Séries** (representadas pelo modelo `Period`) correspondem aos anos escolares (ex: `1ª ano`, `6ª ano`).

> [!IMPORTANT]
> **Esta entidade é Read-Only (Apenas Leitura) no Frontend!**
> As séries são geradas **automaticamente** pelo backend quando um **Período Letivo** é criado. Por conta disso:
> * **Não há telas de criação (`POST`), edição (`PUT`) ou exclusão (`DELETE`)** no frontend.
> * A exclusão de uma série ocorre automaticamente em cascata no banco de dados quando o Período Letivo pai correspondente é deletado.

---

## 2. Endpoints Utilizados (Backend)

Todas as rotas de séries exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todas as Séries
* **Método:** `GET`
* **URL:** `/api/periods`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)
* **Retorno de Sucesso (HTTP 200):** Coleção paginada de 10 séries.

### B. Filtrar Séries por Período Letivo (Recomendado para Dropdowns)
* **Método:** `GET`
* **URL:** `/api/periods/{periodo_letivo_id}/series-por-periodo-letivo`
* **Descrição:** Retorna a lista paginada contendo apenas as séries vinculadas ao período letivo informado. É a rota ideal para preencher dropdowns dinâmicos de turmas/séries.
* **Nota de Integração:** O parâmetro da rota no backend foi registrado com um typo (`{peridoLetivo}`), mas a URL resolvida pelo Axios deve ser montada como `/api/periods/{id}/series-por-periodo-letivo` normalmente.

### C. Detalhar Série (por ID)
* **Método:** `GET`
* **URL:** `/api/periods/{id}`

### D. Obter Matriz Curricular (Disciplinas)
* **Método:** `GET`
* **URL:** `/api/periods/{id}/matriz` (também aceita `/api/periods/matriz/{id}`)
* **Descrição:** Retorna a lista de disciplinas (`Disciplinas`) vinculadas a esta série específica, contendo as cargas horárias, professores e ementas.

---

## 3. ⚠️ Alerta de Rotas Inexistentes / Não Implementadas

Para evitar falhas na integração, note que:
1. **Sem Modificações:** Não existem as funções `store`, `update` e `destroy` no controller do backend ([PeriodController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/PeriodController.php)).
2. **Sem Busca Global por Valor:** A rota `GET /api/periods/value/{value}` está listada nas rotas do Laravel, **mas o método `search` correspondente não está implementado** no controller do backend. A tentativa de chamá-la retornará erro `500` (Method search does not exist).
   * **Tratativa:** Para filtros, utilize apenas a rota de filtragem específica por Período Letivo (`GET /api/periods/{id}/series-por-periodo-letivo`).

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão declarados em [periodo.ts (Types)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/periodo.ts):
* `Period`: Interface representando o modelo da série.
* `MatrizDisciplina`: Mapeia as disciplinas associadas à matriz curricular da série.
* `PeriodPaginatedResponse`: Resposta paginada de listagem.
* `PeriodMatrizResponse`: Lista de disciplinas da matriz curricular da série.

A camada de chamadas e queries TanStack Query reside em [periodo.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/periodo.ts):
* **usePeriodsInfiniteQuery:** Busca paginada infinita geral de séries.
* **usePeriodsByPeriodoLetivoQuery:** Filtra séries vinculadas a um período letivo. Útil para dropdowns encadeados em tempo real.
* **usePeriodQuery:** Carrega detalhes da série por ID.
* **usePeriodMatrizQuery:** Busca as disciplinas associadas à matriz curricular da série.
