#include "guido/progress/progress_service.h"

#include <utility>

namespace guido::progress {

std::string to_string(const ProgressStatus status) {
  switch (status) {
    case ProgressStatus::not_started:
      return "not_started";
    case ProgressStatus::in_progress:
      return "in_progress";
    case ProgressStatus::completed:
      return "completed";
  }
  return "not_started";
}

std::optional<ProgressStatus> progress_status_from_string(const std::string& value) {
  if (value == "not_started") return ProgressStatus::not_started;
  if (value == "in_progress") return ProgressStatus::in_progress;
  if (value == "completed") return ProgressStatus::completed;
  return std::nullopt;
}

ProgressService::ProgressService(std::shared_ptr<const ProgressRepository> repository)
    : repository_(std::move(repository)) {
  if (!repository_) throw std::invalid_argument("progress repository is required");
}

drogon::Task<std::optional<UserProgress>> ProgressService::get(
    std::string user_id, std::string guide_version_id) const {
  if (user_id.empty() || guide_version_id.empty() || guide_version_id.size() > 100) {
    throw ProgressValidationError("O identificador do progresso é inválido.");
  }
  co_return co_await repository_->get(std::move(user_id), std::move(guide_version_id));
}

drogon::Task<std::optional<UserProgress>> ProgressService::save(
    std::string user_id,
    std::string guide_version_id,
    const std::uint16_t current_step,
    std::string status) const {
  if (user_id.empty() || guide_version_id.empty() || guide_version_id.size() > 100) {
    throw ProgressValidationError("O identificador do progresso é inválido.");
  }
  if (current_step > 499) {
    throw ProgressValidationError("A etapa atual deve estar entre 0 e 499.");
  }
  const auto parsed_status = progress_status_from_string(status);
  if (!parsed_status) {
    throw ProgressValidationError("O status do progresso é inválido.");
  }
  co_return co_await repository_->upsert(std::move(user_id), std::move(guide_version_id),
                                         current_step, *parsed_status);
}

}  // namespace guido::progress
