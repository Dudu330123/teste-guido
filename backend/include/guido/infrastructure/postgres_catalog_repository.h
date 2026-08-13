#pragma once

#include <drogon/orm/DbClient.h>

#include <memory>
#include <string>

#include "guido/domain/catalog_repository.h"

namespace guido::infrastructure {

class PostgresCatalogRepository final : public domain::CatalogRepository {
 public:
  PostgresCatalogRepository(drogon::orm::DbClientPtr client, bool allow_demo_content);

  [[nodiscard]] drogon::Task<bool> ready() const override;

  [[nodiscard]] drogon::Task<std::vector<domain::Application>> list_applications(
      std::size_t limit, std::size_t offset) const override;
  [[nodiscard]] drogon::Task<std::optional<domain::Application>> find_application_by_slug(
      std::string slug) const override;
  [[nodiscard]] drogon::Task<std::vector<domain::TutorialSummary>> list_tutorials_for_application(
      std::string application_id) const override;
  [[nodiscard]] drogon::Task<std::optional<domain::GuideContent>> find_guide_by_id(
      std::string id) const override;
  [[nodiscard]] drogon::Task<std::optional<domain::GuideContent>> find_guide_by_tutorial_slug(
      std::string tutorial_slug, domain::Platform platform) const override;
  [[nodiscard]] drogon::Task<std::vector<domain::TutorialSummary>> search(
      std::string query, std::size_t limit) const override;

 private:
  [[nodiscard]] drogon::Task<std::optional<domain::GuideContent>> assemble_guide(
      const drogon::orm::Result& result) const;

  drogon::orm::DbClientPtr client_;
  bool allow_demo_content_;
};

}  // namespace guido::infrastructure
