# Estado Atual do Funcionamento das Rotas do Backend (Branch `main`)

Este documento detalha o funcionamento, rotas, regras de validação, formatos de retorno e o nível de implementação atual de todas as entidades do sistema.

---

## 1. Regras Globais da API
* **Prefixo padrão:** `/api`
* **Autenticação:** Todas as rotas (exceto `/login` e `/forgot-password`) exigem cabeçalho `Authorization: Bearer <token>` via **Laravel Sanctum**.
* **Tratamento de Erros de Validação (HTTP 422):** 
  * Se a validação estender a classe `ApiResquest`, a resposta conterá a chave **`mensagem`** (singular, com "m" no final).
  * Se a validação estender a classe nativa do Laravel `FormRequest`, a resposta conterá a chave padrão **`errors`**.

---

## 2. Curso (`Course`)
* **Controller:** [CourseController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/CourseController.php)
* **Permissão:** Role `servidor|admin`

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/courses` | Lista cursos paginados (10 por página) |
| `POST` | `/api/courses` | Cria um novo curso |
| `GET` | `/api/courses/{id}` | Busca detalhes de um curso específico |
| `PUT/PATCH` | `/api/courses/{id}` | Atualiza campos do curso (campo `number_periods` é ignorado na atualização) |
| `DELETE` | `/api/courses/{id}` | Remove o curso (exclusão em cascata) |
| `GET` | `/api/courses/value/{value}` | Filtra cursos por nome (mínimo 3 caracteres) |

### Regras de Validação (Request Body - `StoreCourseRequest` / `UpdateCourseRequest`):
* `name` (string, min: 5, max: 30) - Deve ser único no `POST`.
* `number_periods` (integer, min: 1, max: 100).
* `total_hours` (integer, min: 1, max: 10000).
* `details` (string, max: 2000, opcional).
* `status` (boolean, opcional).

### Formato de Erro de Validação:
* **Tipo:** `ApiResquest` -> Retorna chave `"mensagem"`.

---

## 3. Período Letivo (`PeriodoLetivo`)
* **Controller:** [PeriodoLetivoController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/PeriodoLetivoController.php)
* **Permissão:** Role `servidor|admin`
* **Efeito Colateral (Importante):** A criação de um Período Letivo gera automaticamente as séries filhas (`Period` - ex: "1ª ano", "2ª ano") baseando-se no curso associado.

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/periodoletivo` | Lista períodos letivos paginados |
| `POST` | `/api/periodoletivo` | Cria período letivo (e gera as séries correspondentes) |
| `GET` | `/api/periodoletivo/{id}` | Busca período letivo por ID |
| `PUT/PATCH` | `/api/periodoletivo/{id}` | Atualiza período letivo por ID |
| `DELETE` | `/api/periodoletivo/{id}` | Deleta período letivo (exclusão em cascata) |
| `GET` | `/api/courses/{course_id}/periodos-letivos` | Filtra períodos letivos vinculados a um curso específico |
| `GET` | `/api/periodoletivo/value/{value}` | Busca períodos letivos por nome |

### Regras de Validação (Request Body - `StorePeriodoLetivoRequest`):
* `course_id` (integer, obrigatório, deve existir na tabela `courses`).
* `name` (string, obrigatório, max: 255).
* `data_inicio` (date, obrigatório).
* `data_encerramento` (date, obrigatório, deve ser igual ou após `data_inicio`).
* `status` (boolean, opcional).

### Formato de Erro de Validação:
* **Tipo:** `FormRequest` nativo do Laravel -> Retorna chave `"errors"`.

---

## 4. Série (`Serie`)
* **Controller:** [SerieController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/SerieController.php)
* **Permissão:** Role `servidor|admin`
* **Nota de Implementação:** Entidade possui **CRUD completo** no backend, incluindo criação, atualização e remoção.

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/series` | Lista todas as séries cadastradas |
| `POST` | `/api/series` | Cria uma nova série |
| `GET` | `/api/series/{id}` | Detalhes de uma série |
| `PUT/PATCH` | `/api/series/{id}` | Atualiza uma série |
| `DELETE` | `/api/series/{id}` | Deleta uma série |
| `GET` | `/api/series/{periodo_letivo_id}/series-por-periodo-letivo` | Lista séries vinculadas ao período letivo informado |
| `GET` | `/api/series/{id}/matriz` | Retorna disciplinas da série (matriz curricular) |
| `GET` | `/api/series/value/{value}` | Pesquisa séries por nome |
| `GET` | `/api/series/show-series-for-course/{course_id}` | Lista períodos/séries escolares de um curso |

---

## 5. Turma (`Classroom`)
* **Controller:** [ClassroomController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/ClassroomController.php)
* **Permissão:** Role `servidor|admin`

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/classrooms` | Lista todas as turmas (o JSON envelopa a paginação dentro de `data`) |
| `POST` | `/api/classrooms` | Cria turma manualmente |
| `GET` | `/api/classrooms/{id}` | Detalhes da turma |
| `PUT/PATCH` | `/api/classrooms/{id}` | Atualiza turma |
| `DELETE` | `/api/classrooms/{id}` | Exclui turma |
| `GET` | `/api/series/{series_id}/generate-classrooms` | **Enturmação Automática:** distribui alunos sem turmas da série informada |
| `GET` | `/api/classrooms/{series_id}/turmas-por-serie` | Retorna turmas vinculadas a uma série |
| `GET` | `/api/classrooms/value/{value}` | Pesquisa turmas por nome |

### Regras de Validação (Request Body - `StoreClassroomRequest`):
* `serie_id` (integer, obrigatório).
* `name` (string, obrigatório, min: 5, max: 30, deve ser único).
* `max_students` (integer, min: 5, max: 60).
* `shift` (string, obrigatório, min: 3, max: 15 - ex: "Matutino").
* `status` (boolean, obrigatório).

### Formato de Erro de Validação:
* **Tipo:** `ApiResquest` -> Retorna chave `"mensagem"`.

---

## 6. Disciplina (`Disciplina`)
* **Controller:** [DisciplinaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/DisciplinaController.php)
* **Permissão:** Role `servidor|admin`

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/disciplinas` | Lista disciplinas paginadas |
| `POST` | `/api/disciplinas` | Cria uma nova disciplina |
| `GET` | `/api/disciplinas/{id}` | Busca disciplina por ID |
| `PUT/PATCH` | `/api/disciplinas/{id}` | Atualiza disciplina por ID |
| `DELETE` | `/api/disciplinas/{id}` | Remove disciplina (HTTP 204) |
| `GET` | `/api/disciplinas/value/{value}` | Pesquisa disciplinas por nome |

### Regras de Validação (Request Body - `StoreDisciplinaRequest`):
* `name` (string, obrigatório, min: 3, max: 35).
* `area_conhecimento` (string, obrigatório, max: 35).
* `carga_horaria` (string, obrigatório - ex: "120 horas").
* `ementa` (string, obrigatório, max: 500).
* `status` (boolean, obrigatório).

> [!NOTE]
> As associações de disciplinas com turma e professor foram removidas da tabela de disciplinas e migradas para a tabela de ofertas (`OfertaDisciplina`).

### Formato de Erro de Validação:
* **Tipo:** `ApiResquest` -> Retorna chave `"mensagem"`.

---

## 7. Matrícula (`Matricula`)
* **Controller:** [MatriculaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/MatriculaController.php)
* **Permissão:** Role `servidor|admin`

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/matriculas` | Lista matrículas paginadas |
| `POST` | `/api/matriculas` | Cria uma matrícula |
| `GET` | `/api/matriculas/{id}` | Busca matrícula por ID |
| `PUT/PATCH` | `/api/matriculas/{id}` | Atualiza matrícula por ID |
| `DELETE` | `/api/matriculas/{id}` | Remove matrícula (**Retorna HTTP 200** com JSON de sucesso, diferente de outras exclusões) |
| `GET` | `/api/matriculas/value/{value}` | Pesquisa matrícula por código único (`codigo_matricula`) |

### Regras de Validação (Request Body - `StoreMatriculaRequest`):
* `aluno_id` (integer, obrigatório, deve existir em `alunos`).
* `serie_id` (integer, obrigatório, deve existir em `series`).
* `data_matricula` (date, obrigatório).
* `data_cancelamento` (date, opcional, igual ou após `data_matricula`).
* `codigo_matricula` (string, obrigatório, único na tabela `matriculas`).
* `status` (boolean, obrigatório).

### Formato de Erro de Validação:
* **Tipo:** `FormRequest` nativo do Laravel -> Retorna chave `"errors"`.

---

## 8. Frequência (`Frequencia`)
* **Controller:** [FrequenciaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/FrequenciaController.php)
* **Permissão:** Role `professor|admin` (Apenas professores ou administradores)

### Estado de Implementação:
> [!WARNING]
> **NÃO IMPLEMENTADO!**
> A tabela não existe no banco de dados, o modelo está vazio e os métodos do controlador apenas retornam strings JSON estáticas contendo `"message": "Controller de Frequencia: ..."` para testes.

---

## 9. Usuários do Sistema (Servidor e Professor)
Essas duas entidades compartilham uma tabela base comum de dados cadastrais (`users`) gerenciada pelo [UserProfileService.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Services/UserProfileService.php).

### A. Servidor (`Servidor`)
* **Controller:** [ServidorController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/ServidorController.php)
* **Permissão:** Role `servidor|admin`

#### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/servidors` | Lista servidores paginados |
| `POST` | `/api/servidors` | Cria servidor + cria credenciais associadas na tabela `users` |
| `GET` | `/api/servidors/{id}` | Busca servidor por ID |
| `PUT/PATCH` | `/api/servidors/{id}` | Atualiza servidor e usuário associado |
| `DELETE` | `/api/servidors/{id}` | Exclui servidor e usuário associado |
| `GET` | `/api/servidors/value/{value}` | Pesquisa servidores por nome ou CPF |

#### Regras de Validação (Campos de Usuário + Específicos):
* **Campos do Usuário (`getUserRules`):** `name`, `cpf`, `rg`, `data_nascimento`, `nome_mae`, `deficiencia`, `logradouro`, `bairro`, `cidade`, `estado`, `celular`, `email`, `password`.
* **Específicos do Servidor (`StoreServidorRequest`):**
  * `cargo` (string, obrigatório).
  * `setor` (string, obrigatório).

---

### B. Professor (`Professor`)
* **Controller:** [ProfessorController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/ProfessorController.php)
* **Permissão:** Role `servidor|admin`

#### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/professors` | Lista professores paginados |
| `POST` | `/api/professors` | Cria professor + cria credenciais associadas na tabela `users` |
| `GET` | `/api/professors/{id}` | Busca professor por ID |
| `PUT/PATCH` | `/api/professors/{id}` | Atualiza professor e usuário associado |
| `DELETE` | `/api/professors/{id}` | Exclui professor e usuário associado |
| `GET` | `/api/professors/value/{value}` | Pesquisa professores por nome ou CPF |

#### Regras de Validação (Campos de Usuário + Específicos):
* **Campos do Usuário (`getUserRules`):** `name`, `cpf`, `rg`, `data_nascimento`, `nome_mae`, `deficiencia`, `logradouro`, `bairro`, `cidade`, `estado`, `celular`, `email`, `password`.
* **Específicos do Professor (`StoreProfessorRequest`):**
  * `matricula_adpm` (string, obrigatório, deve ser único).
  * `codigo_disciplina` (string, obrigatório).

---

## 10. Aluno (`Aluno`)
* **Controller:** [AlunoController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/AlunoController.php)
* **Permissão:** Role `servidor|admin`

### Rotas Disponíveis:
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/alunos` | Lista alunos paginados |
| `POST` | `/api/alunos` | Cria um aluno |
| `GET` | `/api/alunos/{id}` | Busca aluno por ID |
| `PUT/PATCH` | `/api/alunos/{id}` | Atualiza dados do aluno |
| `DELETE` | `/api/alunos/{id}` | Exclui aluno (HTTP 204) |
| `GET` | `/api/alunos/value/{value}` | Pesquisa alunos por nome ou CPF |

### Regras de Validação (Request Body - `StoreAlunoRequest`):
* `name` (string, obrigatório, min: 5, max: 255).
* `cpf` (string, obrigatório, único, validação PT-BR de CPF active).
* `rg` (string, obrigatório, max: 20).
* `data_nascimento` (date, obrigatório).
* `nome_mae` (string, obrigatório, max: 100).
* `nome_pai` (string, opcional, max: 100).
* `genero` (string, opcional, max: 10).
* `deficiencia` (string, obrigatório, max: 50).
* `logradouro` (string, obrigatório, max: 255).
* `numero` (string, obrigatório, max: 10).
* `bairro` (string, obrigatório, max: 100).
* `cidade` (string, obrigatório, max: 100).
* `estado` (string, obrigatório, de 2 dígitos).
* `celular` (string, obrigatório, max: 15).
* `email` (string, obrigatório, formato email, único).
* `matricula` (string, obrigatório, único).
* `status` (boolean, opcional).

### Formato de Erro de Validação:
* **Tipo:** `ApiResquest` -> Retorna chave `"mensagem"`.
