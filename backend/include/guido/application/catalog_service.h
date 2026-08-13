#pragma once

#include <cstddef>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "guido/domain/catalog_repository.h"

namespace guido::application {

class ValidationError final : public std::invalid_argument {
 public:
  using std::invalid_argument::invalid_argument;
};

class CatalogService final {
 public:
  explicit CatalogService(domain::CatalogRepositoryPtr repository);

  [[nodiscard]] drogon::Task<bool> ready() const;

  [[nodiscard]] drogon::Task<std::vector<domain::Application>> list_applications(
      std::size_t limit, std::size_t offset) const;
  [[nodiscard]] drogon::Task<std::optional<domain::Application>> find_application(
      std::string slug) const;
  [[nodiscard]] drogon::Task<std::vector<domain::TutorialSummary>> list_tutorials(
      std::string application_slug) const;
  [[nodiscard]] drogon::Task<std::optional<domain::GuideContent>> find_guide(std::string id) const;
  [[nodiscard]] drogon::Task<std::optional<domain::GuideContent>> find_tutorial_guide(
      std::string tutorial_slug, std::string platform) const;
  [[nodiscard]] drogon::Task<std::vector<domain::TutorialSummary>> search(std::string query,
                                                                          std::size_t limit) const;

  static constexpr std::size_t kDefaultPageSize = 20;
  static constexpr std::size_t kMaxPageSize = 50;
  static constexpr std::size_t kMaxOffset = 10'000;
  static constexpr std::size_t kMaxQueryLength = 120;

 private:
  domain::CatalogRepositoryPtr repository_;
};

}  // namespace guido::application
