# Fluxo de Recuperação de Senha (Esqueceu a Senha)

Este documento descreve a integração técnica, as regras de validação e o comportamento do fluxo de recuperação de senha do aplicativo `sigest-mobile`, integrado com a API do Laravel.

---

## 1. Endpoints do Backend

O fluxo de recuperação de senha utiliza 3 endpoints públicos no Laravel:

1. **Solicitar Código por E-mail:**
   * **Rota:** `POST /api/forgot-password-code`
   * **Payload:** `{ email }`
   * **Resposta:** `{ status: true, message: 'Email de recuperação de senha enviado com sucesso' }` (Gera e envia o código de 6 dígitos ao email).
2. **Validar Código Recebido:**
   * **Rota:** `POST /api/reset-password-validate-code`
   * **Payload:** `{ email, code }`
   * **Resposta:** `{ status: true, message: 'Código de recuperação de senha válido' }` (Verifica a validade do código de 6 dígitos no banco).
3. **Definir Nova Senha:**
   * **Rota:** `POST /api/reset-password-code`
   * **Payload:** `{ email, code, password }`
   * **Resposta:** `{ status: true, user: {...}, message: 'Senha atualizada com sucesso!' }` (Redefine a senha).

---

## 2. Validação Client-Side (Zod)

As validações de campo do formulário estão localizadas em `src/schema/recuperar-senha.ts`:

* **`forgotPasswordSchema` (Etapa 1 - Email):**
  * O email é obrigatório e deve ter um formato de email válido.
* **`validateCodeSchema` (Etapa 2 - Código):**
  * O código é obrigatório, deve ter exatamente 6 dígitos e conter apenas números.
* **`resetPasswordSchema` (Etapa 3 - Nova Senha):**
  * A senha é obrigatória e deve ter no mínimo 8 caracteres.
  * A confirmação da senha deve ser idêntica ao campo de senha.

---

## 3. UI Flow e UX (Wizard Multi-Etapa)

Para evitar redirecionamentos complexos e problemas de estado de rota, o fluxo foi encapsulado em um Wizard multi-etapa dentro da rota única `/recuperar-senha`:

* **Etapa 1 (E-mail):** O usuário fornece o e-mail. Se for válido, o botão de "Enviar Código" é habilitado. Ao receber sucesso, avança para a Etapa 2.
* **Etapa 2 (Código):** Exibe instruções com o e-mail do usuário e um campo numérico de 6 dígitos. O usuário pode digitar o código recebido ou optar por voltar e alterar o e-mail.
* **Etapa 3 (Senha):** Inputs de nova senha e confirmação de senha, ambos com ícones de exibir/ocultar senha (eye icon) para uma experiência de usuário de alto nível.

Durante as chamadas de rede (`isLoading = true`), todos os botões e inputs são desabilitados para prevenir cliques repetidos.

---

## 4. Estrutura de Arquivos

* **Tipagem TypeScript:** `src/types/auth.ts`
* **Chamadas de API:** `src/api/auth.ts`
* **Validação de Formulário:** `src/schema/recuperar-senha.ts`
* **Layout e Fluxo Visual:** `app/(public)/recuperar-senha.tsx`
* **Configuração de Rota:** `app/_layout.tsx` (registro no Stack router)
* **Testes Automatizados:** `__tests__/api/auth/auth-api.test.ts`
