#pragma once

#include <drogon/orm/DbClient.h>

#include "guido/progress/progress_repository.h"

namespace guido::progress {

class PostgresProgressRepository final : public ProgressRepository {
 public:
  PostgresProgressRepository(drogon::orm::DbClientPtr client, bool allow_demo_content);

  [[nodiscard]] drogon::Task<std::optional<UserProgress>> get(
      std::string user_id, std::string guide_version_id) const override;
  [[nodiscard]] drogon::Task<std::optional<UserProgress>> upsert(
      std::string user_id,
      std::string guide_version_id,
      std::uint16_t current_step,
      ProgressStatus status) const override;

 private:
  drogon::orm::DbClientPtr client_;
  bool allow_demo_content_;
};

}  // namespace guido::progress

