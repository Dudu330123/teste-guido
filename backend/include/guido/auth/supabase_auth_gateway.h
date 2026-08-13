#pragma once

#include <drogon/HttpClient.h>

#include <string>

#include "guido/auth/auth_gateway.h"

namespace guido::auth {

class SupabaseAuthGateway final : public AuthGateway {
 public:
  SupabaseAuthGateway(std::string supabase_url, std::string publishable_key);

  [[nodiscard]] drogon::Task<std::optional<AuthenticatedUser>> authenticate(
      std::string access_token) const override;

 private:
  drogon::HttpClientPtr client_;
  std::string publishable_key_;
};

}  // namespace guido::auth
