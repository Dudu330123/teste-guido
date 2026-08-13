import { describe, expect, it } from "vitest";
import { getSignupErrorMessage } from "./auth-error-message";

describe("mensagens públicas de erro no cadastro", () => {
  it("explica quando o SMTP padrão não autoriza o endereço", () => {
    expect(getSignupErrorMessage({ code: "email_address_not_authorized", status: 500 }))
      .toContain("entrega de e-mail");
  });

  it("orienta a aguardar quando o limite é atingido", () => {
    expect(getSignupErrorMessage({ code: "over_email_send_rate_limit", status: 429 }))
      .toContain("Aguarde");
  });

  it("não expõe detalhes internos em falhas desconhecidas", () => {
    expect(getSignupErrorMessage({ code: "internal_detail", status: 500 }))
      .toBe("Não foi possível criar a conta. Revise os dados e tente novamente.");
  });
});
