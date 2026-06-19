# CRUD de Período Letivo (Listagem, Cadastro, Edição e Exclusão)

Este documento descreve a especificação técnica, regras de negócio e a implementação das rotas, paginação, regras de validação e o funcionamento do CRUD de Período Letivo no aplicativo mobile.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de período letivo exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

> [!NOTE]
> O prefixo das rotas de Período Letivo no backend está no singular: `/api/periodoletivo`.

### A. Listar Todos os Períodos Letivos
* **Método:** `GET`
* **URL:** `/api/periodoletivo`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### B. Buscar Períodos Letivos por Nome
* **Método:** `GET`
* **URL:** `/api/periodoletivo/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### C. Cadastrar Período Letivo
* **Método:** `POST`
* **URL:** `/api/periodoletivo`
* **Payload de Envio:** Ver a tipagem `CreatePeriodoLetivoRequest`.

### D. Visualizar um Período Letivo pelo ID
* **Método:** `GET`
* **URL:** `/api/periodoletivo/{id}`

### E. Atualizar Período Letivo pelo ID
* **Método:** `PUT` ou `PATCH`
* **URL:** `/api/periodoletivo/{id}`
* **Payload de Envio:** Ver a tipagem `UpdatePeriodoLetivoRequest`.

### F. Excluir Período Letivo pelo ID
* **Método:** `DELETE`
* **URL:** `/api/periodoletivo/{id}`

### G. Filtrar Períodos Letivos por Curso (Rota Customizada)
* **Método:** `GET`
* **URL:** `/api/courses/{course_id}/periodos-letivos`
* **Descrição:** Retorna a coleção paginada de períodos letivos que pertencem apenas ao `course_id` informado. Muito útil para filtros em tempo real no aplicativo.

---

## 2. Comportamento Crítico & Regra de Negócio

Ao cadastrar um Período Letivo no backend (`POST /api/periodoletivo`), a API executa uma transação automática em banco de dados:

1. **Criação do Período Letivo:** Cria o registro base com os campos enviados (`name`, `course_id`, `data_inicio`, `data_encerramento`, `status`).
2. **Resgate dos Períodos do Curso:** Consulta o Curso vinculado (`course_id`) para extrair a sua quantidade de períodos (`number_periods`) e carga horária total (`total_hours`).
3. **Geração Automática de Séries (Periods):** O backend cria automaticamente as séries/períodos escolares filhos vinculados a esse Período Letivo.
   * **Nome da série:** Se o curso começar com "Fundamental II", as séries criadas começam no **6º ano** (ex: 6º ano, 7º ano...). Para outros cursos, iniciam no **1º ano** (ex: 1º ano, 2º ano...).
   * **Carga horária:** Divide a carga horária total do curso proporcionalmente entre as séries geradas.
4. **Implicação no Frontend:** Não é necessária uma tela no frontend para gerenciar ou criar "Séries" de forma manual, visto que o backend gera tudo automaticamente no momento do cadastro do Período Letivo.

---

## 3. Tratamento de Erros e Validação Laravel Standard

Diferente do CRUD de Cursos, o CRUD de Período Letivo estende a classe padrão `FormRequest` do Laravel. Em caso de erros de validação (HTTP 422), a resposta do servidor virá com a chave **`errors`** (plural) contendo o dicionário com os campos e mensagens:

```json
{
  "message": "O curso selecionado é inválido. (and/or other validation messages)",
  "errors": {
    "course_id": [
      "O curso selecionado é inválido."
    ],
    "data_encerramento": [
      "A data de encerramento deve ser igual ou posterior à data de início."
    ]
  }
}
```

### Regras de Validação Requeridas
* **`course_id`:** Inteiro, obrigatório, deve existir na tabela de cursos.
* **`name`:** String, obrigatório, máximo de 255 caracteres.
* **`data_inicio`:** Data (formato AAAA-MM-DD), obrigatório.
* **`data_encerramento`:** Data (formato AAAA-MM-DD), obrigatório, deve ser igual ou posterior a `data_inicio`.
* **`status`:** Opcional booleano.

### Mapeamento no Frontend
No formulário do React Native, o tratamento do erro de validação HTTP 422 é feito mapeando as propriedades retornadas dentro de `errors` aos campos correspondentes na tela (exibindo mensagens vermelhas abaixo de cada campo afetado).

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão definidos em [periodoletivo.ts (Types)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/periodoletivo.ts):
* `PeriodoLetivo`: Mapeia as propriedades retornadas pela API.
* `CreatePeriodoLetivoRequest`: Tipagem para criação.
* `UpdatePeriodoLetivoRequest`: Tipagem para atualizações (todos opcionais).
* `LaravelValidationErrorResponse`: Captura o erro no padrão do Laravel com a chave `errors`.

A camada de API e hooks TanStack Query reside em [periodoletivo.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/periodoletivo.ts):
* **usePeriodosLetivosInfiniteQuery:** Consulta reativa geral/busca com rolagem infinita.
* **usePeriodoLetivoQuery:** Busca dados por ID.
* **useCreatePeriodoLetivoMutation:** Criação de período letivo.
* **useUpdatePeriodoLetivoMutation:** Atualização de período letivo.
* **useDeletePeriodoLetivoMutation:** Exclusão física com cascata.

---

## 5. Fluxos de Interface de Usuário

### A. Listagem
Disponível em `app/(private)/gerenciar/periodoletivo/index.tsx`.
* Possui busca por nome com debounce e rolagem infinita.
* Exibe cards contendo:
  * Nome do período letivo.
  * Nome do Curso correspondente (obtido através de mapeamento do ID do curso).
  * Datas de início e encerramento formatadas no padrão brasileiro (`DD/MM/AAAA`).
  * Badge de status (Ativo/Inativo).

### B. Cadastro & Edição
Disponível em `app/(private)/gerenciar/periodoletivo/cadastro.tsx`.
* **Curso Selecionável:** Exibe um Picker/Dropdown com os cursos disponíveis.
* **Validação de Data:** Formatação automática `DD/MM/AAAA` que é convertida para `AAAA-MM-DD` antes do envio. Validação no cliente que impede enviar data de encerramento anterior à data de início.
* **Status:** Toggle Switch (Ativo/Inativo).

### C. Detalhes
Disponível em `app/(private)/gerenciar/periodoletivo/[id].tsx`.
* Exibe todas as propriedades formatadas.
* Apresenta aviso de **Exclusão em Cascata**: ao deletar um Período Letivo, o usuário é alertado de que todas as séries (periods), turmas (classrooms) e matrículas filhas associadas serão removidas do banco permanentemente.
