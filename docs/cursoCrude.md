# CRUD de Cursos (Listagem, Busca, Visualização, Cadastro, Edição e Exclusão)

Este documento descreve a especificação técnica e a implementação das rotas, paginação, regras de validação e o funcionamento do CRUD de Cursos no aplicativo mobile.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de cursos exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todos os Cursos
* **Método:** `GET`
* **URL:** `/api/courses`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### B. Buscar Cursos por Nome
* **Método:** `GET`
* **URL:** `/api/courses/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### C. Cadastrar Curso
* **Método:** `POST`
* **URL:** `/api/courses`
* **Payload de Envio:** Ver a tipagem `CreateCourseRequest`.

### D. Visualizar um Curso pelo ID
* **Método:** `GET`
* **URL:** `/api/courses/{id}`

### E. Atualizar Curso pelo ID
* **Método:** `PUT` ou `PATCH`
* **URL:** `/api/courses/{id}`
* **Payload de Envio:** Ver a tipagem `UpdateCourseRequest`.

### F. Excluir Curso pelo ID
* **Método:** `DELETE`
* **URL:** `/api/courses/{id}`

---

## 2. Busca e Listagem no Frontend (React Query)

Para otimizar o carregamento e evitar erros desnecessários, a busca do frontend é reativa:

1. **Busca Vazia ou < 3 caracteres:** O hook `useCoursesInfiniteQuery` consome a **Listagem Geral** (`GET /api/courses?page=N`).
2. **Busca >= 3 caracteres:** O hook chaveia automaticamente para a **Rota de Busca** (`GET /api/courses/value/{value}?page=N`).
3. **Tratamento de Lista Vazia:** Se o backend retornar status `200` com `data: null`, o mapeamento do frontend converte para um array vazio `[]`, garantindo que o componente `ListEmptyComponent` da `FlatList` seja renderizado corretamente.

---

## 3. Cadastro e Edição de Curso

### Regras de Validação do Formulário (Front & Back)
* **`name`:** Único na tabela de cursos, obrigatório, de 5 a 30 caracteres.
* **`number_periods`:** Inteiro positivo, obrigatório, de 1 a 100 períodos.
* **`total_hours`:** Inteiro positivo, obrigatório, de 1 a 10.000 horas.
* **`details`:** Opcional, texto com limite de 2.000 caracteres.
* **`status`:** Booleano, define se o curso está ativo ou inativo.

> [!WARNING]
> **Edição de Períodos Bloqueada no Front:**
> Embora o backend aceite o campo `number_periods` na rota de atualização (PUT), ele ignora modificações para evitar inconsistências nos períodos filhos já gerados.
> **Tratativa:** O frontend exibe o campo "Número de Períodos" como desabilitado (read-only) com uma mensagem informativa clara caso o curso esteja sendo editado.

### Tratamento de Erro de Validação 422
A API retorna os erros de validação do Laravel sob a chave **`mensagem`** (com "m" no final, em português):
```json
{
  "status": false,
  "code": 422,
  "mensagem": {
    "name": ["O campo nome já está em uso."],
    "number_periods": ["O campo número de períodos deve ser um número inteiro."]
  }
}
```
**Mapeamento Inline:** O formulário do frontend captura essas mensagens e as exibe nas cores vermelhas de erro diretamente abaixo de cada input com falha.

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão definidos em [curso.ts (Types)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/curso.ts):
* `Course`: Modelo de dados da entidade curso.
* `CreateCourseRequest`: Estrutura do payload de criação.
* `UpdateCourseRequest`: Estrutura do payload de edição (com campos opcionais e `number_periods` opcional).
* `ValidationErrorResponse`: Objeto de retorno para erros HTTP 422.

A integração de rotas com React Query está centralizada em [curso.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/curso.ts):
* **useCoursesInfiniteQuery:** Gerencia a paginação infinita e busca reativa.
* **useCourseQuery:** Busca os detalhes de um único curso por ID.
* **useCreateCourseMutation:** Mutation para cadastrar um novo curso.
* **useUpdateCourseMutation:** Mutation para salvar modificações em um curso existente.
* **useDeleteCourseMutation:** Mutation para remover permanentemente um curso.

---

## 5. Detalhes, Edição e Exclusão em Cascata

### A. Tela de Detalhes
* **Endpoint:** `GET /api/courses/{id}`
* **Rota:** `app/(private)/gerenciar/curso/[id].tsx`
* **Layout:** Apresenta um banner colorido com um avatar ilustrativo de livro e exibe todas as propriedades do curso de forma legível.

### B. Exclusão em Cascata (Alerta Crítico)
* **Endpoint:** `DELETE /api/courses/{id}`
* **Funcionamento no Banco:** A exclusão de um curso dispara remoções em cascata. Isso deleta permanentemente todos os períodos acadêmicos, turmas e disciplinas que dependem deste curso.
* **Tratativa no Front:** Antes de prosseguir com a exclusão, o aplicativo exibe um `Alert` de confirmação destructiva contendo um aviso em letras maiúsculas explicitando os riscos de remoções em cascata de outras entidades associadas.
