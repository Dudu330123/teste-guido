#pragma once

#include <drogon/utils/coroutine.h>

#include <cstdint>
#include <optional>
#include <string>

#include "guido/progress/progress.h"

namespace guido::progress {

/**
 * Persistência do progresso de usuários autenticados.
 *
 * Visitantes continuam usando o armazenamento local do navegador. Este
 * contrato existe para sincronizar somente os campos mínimos permitidos quando
 * uma sessão autenticada estiver disponível.
 */
class ProgressRepository {
 public:
  virtual ~ProgressRepository() = default;

  [[nodiscard]] virtual drogon::Task<std::optional<UserProgress>> get(
      std::string user_id, std::string guide_version_id) const = 0;
  [[nodiscard]] virtual drogon::Task<std::optional<UserProgress>> upsert(
      std::string user_id,
      std::string guide_version_id,
      std::uint16_t current_step,
      ProgressStatus status) const = 0;
};

}  // namespace guido::progress
