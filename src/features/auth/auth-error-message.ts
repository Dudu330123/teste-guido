interface AuthErrorLike {
  code?: string;
  status?: number;
}

/**
 * Traduz somente códigos públicos e acionáveis do Supabase Auth. A mensagem não
 * confirma se uma conta existe, evitando facilitar enumeração de usuários.
 */
export function getSignupErrorMessage(error: AuthErrorLike): string {
  switch (error.code) {
    case "email_address_not_authorized":
      return "Este e-mail ainda não pode receber mensagens do Guido. A entrega de e-mail precisa ser configurada.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Foram feitas muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "email_address_invalid":
      return "Use um endereço de e-mail real e válido.";
    case "weak_password":
      return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
    case "user_already_exists":
      return "Não foi possível criar a conta. Se você já se cadastrou, use Entrar ou Esqueci minha senha.";
    case "unexpected_failure":
      return "O cadastro não pôde ser salvo. Tente novamente mais tarde ou peça ajuda.";
    default:
      return error.status === 429
        ? "Foram feitas muitas tentativas. Aguarde alguns minutos e tente novamente."
        : "Não foi possível criar a conta. Revise os dados e tente novamente.";
  }
}
