#include "guido/auth/supabase_auth_gateway.h"

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>

#include <stdexcept>
#include <utility>

namespace guido::auth {

SupabaseAuthGateway::SupabaseAuthGateway(std::string supabase_url, std::string publishable_key)
    : client_(drogon::HttpClient::newHttpClient(supabase_url)),
      publishable_key_(std::move(publishable_key)) {
  if (supabase_url.empty() || publishable_key_.empty()) {
    throw std::invalid_argument("Supabase URL and publishable key are required");
  }
}

drogon::Task<std::optional<AuthenticatedUser>> SupabaseAuthGateway::authenticate(
    std::string access_token) const {
  if (access_token.empty() || access_token.size() > 4096) co_return std::nullopt;

  try {
    auto request = drogon::HttpRequest::newHttpRequest();
    request->setMethod(drogon::Get);
    // Validar em /auth/v1/user evita confiar apenas no conteúdo decodificado do
    // JWT. O Supabase confirma assinatura, expiração e estado atual da sessão.
    request->setPath("/auth/v1/user");
    request->addHeader("Accept", "application/json");
    request->addHeader("apikey", publishable_key_);
    request->addHeader("Authorization", "Bearer " + access_token);
    const auto response = co_await client_->sendRequestCoro(std::move(request), 3.0);
    if (!response || response->statusCode() != drogon::k200OK) co_return std::nullopt;

    const auto json = response->getJsonObject();
    if (!json || !json->isMember("id") || !(*json)["id"].isString()) co_return std::nullopt;
    const auto id = (*json)["id"].asString();
    if (id.empty() || id.size() > 100) co_return std::nullopt;
    std::optional<std::string> email;
    if (json->isMember("email") && (*json)["email"].isString()) {
      email = (*json)["email"].asString();
    }
    co_return AuthenticatedUser{.id = id, .email = std::move(email)};
  } catch (const std::exception&) {
    // Indisponibilidade do provedor é tratada como sessão não autenticada. Não
    // registramos o token nem devolvemos detalhes potencialmente sensíveis.
    co_return std::nullopt;
  }
}

}  // namespace guido::auth
