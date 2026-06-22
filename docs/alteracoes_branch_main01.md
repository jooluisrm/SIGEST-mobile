# Guia de Alterações e Migração para a Branch `main01` (Impactos no Frontend)

Este documento detalha o que mudou no backend ao migrar da branch `main` para a branch `main01`, destacando as refatorações de rotas, novos módulos e o que precisa ser ajustado/criado no frontend (React Native).

---

## 1. Refatoração de Série (`Period` ➔ `Serie`)

A entidade que representa a série ou período escolar (ex: "1ª ano", "6ª ano") foi renomeada e seu comportamento foi atualizado.

### O que mudou no backend:
* **Renomeação de tabelas e modelos:** O modelo `Period` virou `Serie` (tabela `series` no banco).
* **Renomeação de rotas:** `/api/periods` agora é **`/api/series`**.
* **CRUD Completo:** Na branch `main`, a Série era apenas leitura. Na branch `main01`, o controller `SerieController` possui suporte completo e funcional para criação (`POST`), edição (`PUT`), exclusão (`DELETE`) e busca por texto (`GET /api/series/value/{value}`).

### O que alterar no frontend:
* **Endpoints:** Atualizar todas as chamadas de `/api/periods` para **`/api/series`**.
  * Rota de matriz curricular: `/api/series/{id}/matriz`.
  * Rota de séries por período letivo: `/api/series/{periodo_letivo_id}/series-por-periodo-letivo`.
* **Payloads:** Onde antes se usava a chave `period_id` (em Turmas e Matrículas), agora deve-se usar a chave **`serie_id`**.
* **Novas Telas (Opcional):** Se o seu app gerenciar séries, agora você pode implementar formulários para Criar/Editar/Excluir séries.

---

## 2. Modificações em Turmas e Matrículas

### O que mudou no backend:
* **Chave Estrangeira:** A referência de série foi alterada de `period_id` para **`serie_id`** nas tabelas `classrooms` (Turmas) e `matriculas` (Matrículas).
* **Parâmetros de Rotas:** Os endpoints extras de Turma foram atualizados:
  * Geração automática de turmas: `GET /api/series/{series_id}/generate-classrooms`.
  * Turmas por série: `GET /api/classrooms/{series_id}/turmas-por-serie`.
* **Correção no `MatriculaResource`:**
  * O retorno de matrículas (`GET /api/matriculas`) agora inclui corretamente a chave **`serie_id`** (anteriormente havia um bug retornando `curso_id: null`).
  * O campo **`codigo_matricula`** agora é retornado no JSON da resposta.

### O que alterar no frontend:
* **Payloads de Criação/Edição:**
  * No cadastro de Turmas, envie `serie_id` no lugar de `period_id`.
  * No cadastro de Matrícula, envie `serie_id` no lugar de `period_id`.
* **Consumo de API:** Atualize as chamadas de listagem de turmas por série para o novo parâmetro `/api/classrooms/{series_id}/turmas-por-serie`.

---

## 3. Desacoplamento de Disciplinas (`OfertaDisciplina`)

Na branch `main`, a Disciplina continha as referências diretas de professor e turma. Na branch `main01`, essa relação foi normalizada.

```
[Disciplina] ➔ Modelo simples (Template da Matéria)
      |
[OfertaDisciplina] (Nova Relação: Une Disciplina, Professor, Turma e Período Letivo)
```

### O que mudou no backend:
* **Simplificação de Disciplinas:** O cadastro de disciplinas `/api/disciplinas` agora requer apenas dados básicos da matéria: `name`, `area_conhecimento`, `carga_horaria`, `ementa`, `status`. O backend **não aceita mais** `classroom_id` ou `professor_id` nesta rota.
* **Nova Entidade `OfertaDisciplina` (`/api/oferta-disciplinas`):** Nova rota criada para realizar a distribuição de professores nas turmas e matérias.
  * **Payload (`POST`):**
    ```json
    {
      "disciplina_id": 1,
      "classroom_id": 2,
      "professor_id": 3,
      "periodo_letivo_id": 4,
      "status": true
    }
    ```

### O que alterar no frontend:
* **Tela de Disciplina:** Remova os campos "Professor" e "Turma" do formulário de criação de Disciplinas.
* **Nova Tela de Gerenciamento ("Oferta de Disciplinas"):** Crie uma tela para que o servidor possa ofertar uma matéria para uma turma, selecionando qual professor irá lecioná-la.
* **Endpoints Extras Úteis:**
  * Filtrar ofertas por Turma: `GET /api/oferta-disciplinas/turma/{classroomId}`
  * Filtrar ofertas por Disciplina: `GET /api/oferta-disciplinas/disciplina/{disciplinaId}`

---

## 4. Vínculo de Aluno à Disciplina (`MatriculaDisciplina`)

Nova relação criada para determinar quais alunos estão matriculados em quais ofertas de disciplinas.

### O que mudou no backend:
* **Nova Rota:** `/api/matricula-disciplinas` (CRUD básico, exceto o método de atualização `update`).
* **Payload (`POST`):**
  ```json
  {
    "matricula_id": 1,
    "oferta_disciplina_id": 2
  }
  ```

### O que alterar no frontend:
* **Nova Tela/Fluxo ("Enturmação do Aluno"):** Fluxo no frontend para vincular o aluno (através de sua matrícula) às disciplinas ofertadas para a turma dele.
* **Endpoints Extras Úteis:**
  * Listar matérias que o aluno cursa: `GET /api/matricula-disciplinas/matricula/{matriculaId}`
  * Listar alunos matriculados em uma oferta: `GET /api/matricula-disciplinas/oferta/{ofertaDisciplinaId}`

---

## 5. Implementação Real do Diário de Classe (`Frequencia`)

### O que mudou no backend:
* **100% Funcional:** O backend agora possui tabela física e lógica real de frequências.
* **Mudança de Associação:** A frequência agora vincula-se a uma matrícula em disciplina (`matricula_disciplina_id`).
* **Payload (`POST`):**
  ```json
  {
    "matricula_disciplina_id": 1,
    "data": "2026-06-22",
    "situacao": true, // true = Presente, false = Ausente
    "justificativa": "Atestado médico..." // opcional
  }
  ```

### O que alterar no frontend:
* **Nova Tela ("Lançar Frequência"):** Tela voltada para o perfil **Professor/Admin** (rotas protegidas). Nela, o professor escolhe a matéria ofertada, seleciona a data e lista os alunos cadastrados naquela oferta (obtidos da rota `/api/matricula-disciplinas/oferta/{ofertaId}`) para dar presença ou falta.
* **Visualização de Histórico:** Rota para buscar o histórico de faltas de um aluno na matéria: `GET /api/frequencias/matricula-disciplina/{matriculaDisciplinaId}`.

---

## 6. Lançamento de Atividades e Notas (Novo Módulo)

Novos módulos para o controle acadêmico completo e emissão de notas.

### A. Atividades (`Atividade`)
* **Rota base:** `/api/atividades`
* **Payload (`POST`):**
  ```json
  {
    "oferta_disciplina_id": 1,
    "titulo": "Prova Bimestral 1",
    "tipo": "Prova", // ou Trabalho, Exercício, etc.
    "data_inicio": "2026-06-22",
    "data_fim": "2026-06-25",
    "descricao": "Conteúdo dos capítulos 1 a 3."
  }
  ```
* **Endpoint Extra:** Listar atividades daquela disciplina/turma: `GET /api/atividades/oferta/{ofertaDisciplinaId}`.

### B. Notas (`NotaAtividade`)
* **Rota base:** `/api/nota-atividades`
* **Payload (`POST`):**
  ```json
  {
    "matricula_disciplina_id": 1,
    "atividade_id": 2,
    "nota": 8.5 // Numérico de 0 a 10
  }
  ```
* **Endpoints Extras Úteis:**
  * Listar notas de todos os alunos em uma atividade: `GET /api/nota-atividades/atividade/{atividadeId}`.
  * Listar boletim completo do aluno naquela disciplina: `GET /api/nota-atividades/matricula-disciplina/{matriculaDisciplinaId}`.

---

## Resumo dos Arquivos Novos / Alterados no Backend

Se você precisar de referências rápidas dos arquivos no código PHP:

| Entidade | Arquivo de Solicitação (Request) | Arquivo de Resposta (Resource) | Controlador |
| :--- | :--- | :--- | :--- |
| **Série** | [StoreSerieRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreSerieRequest.php) | [SerieResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/SerieResource.php) | [SerieController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/SerieController.php) |
| **Oferta** | [StoreOfertaDisciplinaRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreOfertaDisciplinaRequest.php) | [OfertaDisciplinaResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/OfertaDisciplinaResource.php) | [OfertaDisciplinaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/OfertaDisciplinaController.php) |
| **Matrícula Disc.** | [StoreMatriculaDisciplinaRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreMatriculaDisciplinaRequest.php) | [MatriculaDisciplinaResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/MatriculaDisciplinaResource.php) | [MatriculaDisciplinaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/MatriculaDisciplinaController.php) |
| **Frequência** | [StoreFrequenciaRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreFrequenciaRequest.php) | [FrequenciaResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/FrequenciaResource.php) | [FrequenciaController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/FrequenciaController.php) |
| **Atividade** | [StoreAtividadeRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreAtividadeRequest.php) | [AtividadeResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/AtividadeResource.php) | [AtividadeController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/AtividadeController.php) |
| **Nota** | [StoreNotaAtividadeRequest.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Requests/StoreNotaAtividadeRequest.php) | [NotaAtividadeResource.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Resources/NotaAtividadeResource.php) | [NotaAtividadeController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/NotaAtividadeController.php) |
