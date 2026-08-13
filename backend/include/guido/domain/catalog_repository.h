#pragma once

#include <cstddef>
#include <memory>
#include <optional>
#include <string_view>
#include <vector>

#include <drogon/utils/coroutine.h>

#include "guido/domain/content.h"

namespace guido::domain {

/**
 * Porta de leitura do catálogo.
 *
 * A camada de aplicação depende somente deste contrato para que PostgreSQL e o
 * catálogo demonstrativo em memória possam ser trocados sem alterar as regras
 * de busca, paginação ou publicação.
 */
class CatalogRepository {
 public:
  virtual ~CatalogRepository() = default;

  [[nodiscard]] virtual drogon::Task<bool> ready() const = 0;

  [[nodiscard]] virtual drogon::Task<std::vector<Application>> list_applications(
      std::size_t limit, std::size_t offset) const = 0;
  [[nodiscard]] virtual drogon::Task<std::optional<Application>> find_application_by_slug(
      std::string slug) const = 0;
  [[nodiscard]] virtual drogon::Task<std::vector<TutorialSummary>> list_tutorials_for_application(
      std::string application_id) const = 0;
  [[nodiscard]] virtual drogon::Task<std::optional<GuideContent>> find_guide_by_id(
      std::string id) const = 0;
  [[nodiscard]] virtual drogon::Task<std::optional<GuideContent>> find_guide_by_tutorial_slug(
      std::string tutorial_slug, Platform platform) const = 0;
  [[nodiscard]] virtual drogon::Task<std::vector<TutorialSummary>> search(std::string query,
                                                                          std::size_t limit) const = 0;
};

using CatalogRepositoryPtr = std::shared_ptr<const CatalogRepository>;

}  // namespace guido::domain
