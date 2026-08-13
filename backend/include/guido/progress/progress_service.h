#pragma once

#include <cstdint>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>

#include "guido/progress/progress_repository.h"

namespace guido::progress {

class ProgressValidationError final : public std::invalid_argument {
 public:
  using std::invalid_argument::invalid_argument;
};

class ProgressService final {
 public:
  explicit ProgressService(std::shared_ptr<const ProgressRepository> repository);

  [[nodiscard]] drogon::Task<std::optional<UserProgress>> get(std::string user_id,
                                                              std::string guide_version_id) const;
  [[nodiscard]] drogon::Task<std::optional<UserProgress>> save(std::string user_id,
                                                               std::string guide_version_id,
                                                               std::uint16_t current_step,
                                                               std::string status) const;

 private:
  std::shared_ptr<const ProgressRepository> repository_;
};

}  // namespace guido::progress
