#include "guido/application/catalog_service.h"

#include <algorithm>
#include <cctype>
#include <utility>

namespace guido::application {
namespace {

[[nodiscard]] bool is_safe_slug(std::string_view value) {
  return !value.empty() && value.size() <= 100 &&
         std::ranges::all_of(value, [](const unsigned char character) {
           return std::isalnum(character) != 0 || character == '-';
         });
}

}  // namespace

CatalogService::CatalogService(domain::CatalogRepositoryPtr repository)
    : repository_(std::move(repository)) {
  if (!repository_) {
    throw std::invalid_argument("catalog repository is required");
  }
}

drogon::Task<bool> CatalogService::ready() const {
  co_return co_await repository_->ready();
}

drogon::Task<std::vector<domain::Application>> CatalogService::list_applications(
    const std::size_t limit, const std::size_t offset) const {
  if (limit == 0 || limit > kMaxPageSize) {
    throw ValidationError("O limite deve estar entre 1 e 50.");
  }
  if (offset > kMaxOffset) {
    throw ValidationError("O deslocamento não pode ultrapassar 10000.");
  }
  co_return co_await repository_->list_applications(limit, offset);
}

drogon::Task<std::optional<domain::Application>> CatalogService::find_application(
    std::string slug) const {
  if (!is_safe_slug(slug)) {
    throw ValidationError("O identificador do aplicativo é inválido.");
  }
  co_return co_await repository_->find_application_by_slug(std::move(slug));
}

drogon::Task<std::vector<domain::TutorialSummary>> CatalogService::list_tutorials(
    std::string application_slug) const {
  const auto application = co_await find_application(application_slug);
  if (!application) {
    co_return std::vector<domain::TutorialSummary>{};
  }
  co_return co_await repository_->list_tutorials_for_application(application->id);
}

drogon::Task<std::optional<domain::GuideContent>> CatalogService::find_guide(std::string id) const {
  if (!is_safe_slug(id)) {
    throw ValidationError("O identificador do guia é inválido.");
  }
  co_return co_await repository_->find_guide_by_id(std::move(id));
}

drogon::Task<std::optional<domain::GuideContent>> CatalogService::find_tutorial_guide(
    std::string tutorial_slug, std::string platform) const {
  if (!is_safe_slug(tutorial_slug)) {
    throw ValidationError("O identificador do tutorial é inválido.");
  }
  if (platform == "android") {
    co_return co_await repository_->find_guide_by_tutorial_slug(std::move(tutorial_slug),
                                                                 domain::Platform::android);
  }
  if (platform == "ios") {
    co_return co_await repository_->find_guide_by_tutorial_slug(std::move(tutorial_slug),
                                                                 domain::Platform::ios);
  }
  throw ValidationError("A plataforma deve ser android ou ios.");
}

drogon::Task<std::vector<domain::TutorialSummary>> CatalogService::search(
    std::string query, const std::size_t limit) const {
  if (query.empty()) {
    throw ValidationError("Informe o texto da pesquisa.");
  }
  if (query.size() > kMaxQueryLength) {
    throw ValidationError("A pesquisa deve ter no máximo 120 caracteres.");
  }
  if (limit == 0 || limit > kMaxPageSize) {
    throw ValidationError("O limite deve estar entre 1 e 50.");
  }
  co_return co_await repository_->search(std::move(query), limit);
}

}  // namespace guido::application
