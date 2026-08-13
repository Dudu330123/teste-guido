#pragma once

#include <drogon/utils/coroutine.h>

#include <optional>
#include <string>

namespace guido::auth {

struct AuthenticatedUser {
  std::string id;
  std::optional<std::string> email;
};

class AuthGateway {
 public:
  virtual ~AuthGateway() = default;
  [[nodiscard]] virtual drogon::Task<std::optional<AuthenticatedUser>> authenticate(
      std::string access_token) const = 0;
};

}  // namespace guido::auth

