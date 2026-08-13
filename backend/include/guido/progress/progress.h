#pragma once

#include <cstdint>
#include <optional>
#include <string>

namespace guido::progress {

enum class ProgressStatus { not_started, in_progress, completed };

struct UserProgress {
  std::string guide_version_id;
  std::uint16_t current_step{1};
  ProgressStatus status{ProgressStatus::not_started};
  std::string last_accessed_at;
  std::optional<std::string> completed_at;
};

[[nodiscard]] std::string to_string(ProgressStatus status);
[[nodiscard]] std::optional<ProgressStatus> progress_status_from_string(const std::string& value);

}  // namespace guido::progress

