#include "guido/infrastructure/postgres_catalog_repository.h"

#include <drogon/orm/Exception.h>
#include <drogon/orm/Result.h>

#include <cstdint>
#include <optional>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace guido::infrastructure {
namespace {

[[nodiscard]] domain::PublicationStatus publication_status(const std::string& value) {
  if (value == "published") return domain::PublicationStatus::published;
  if (value == "under_review") return domain::PublicationStatus::under_review;
  if (value == "outdated") return domain::PublicationStatus::outdated;
  return domain::PublicationStatus::draft;
}

[[nodiscard]] domain::Platform platform(const std::string& value) {
  return value == "ios" ? domain::Platform::ios : domain::Platform::android;
}

[[nodiscard]] std::optional<std::string> optional_text(const drogon::orm::Field& field) {
  return field.isNull() ? std::nullopt : std::optional{field.as<std::string>()};
}

[[nodiscard]] domain::Application application_from_row(const drogon::orm::Row& row) {
  return {
      .id = row["application_id"].as<std::string>(),
      .name = row["application_name"].as<std::string>(),
      .slug = row["application_slug"].as<std::string>(),
      .description = row["application_description"].as<std::string>(),
      .category = row["category_name"].as<std::string>(),
      .logo_url = std::nullopt,
      .status = publication_status(row["application_status"].as<std::string>()),
  };
}

[[nodiscard]] domain::TutorialSummary tutorial_from_row(const drogon::orm::Row& row) {
  return {
      .id = row["tutorial_id"].as<std::string>(),
      .application_id = row["application_id"].as<std::string>(),
      .application_name = row["application_name"].as<std::string>(),
      .title = row["tutorial_title"].as<std::string>(),
      .slug = row["tutorial_slug"].as<std::string>(),
      .description = row["tutorial_description"].as<std::string>(),
      .difficulty = row["tutorial_difficulty"].as<std::string>(),
      .safety_warning = row["tutorial_safety_warning"].as<std::string>(),
      .search_terms = {},
      .status = publication_status(row["tutorial_status"].as<std::string>()),
      .is_demo = row["tutorial_is_demo"].as<bool>(),
  };
}

constexpr std::string_view application_columns = R"sql(
  a.id::text as application_id,
  a.name as application_name,
  a.slug as application_slug,
  a.description as application_description,
  a.status::text as application_status,
  c.name as category_name
)sql";

constexpr std::string_view tutorial_columns = R"sql(
  t.id::text as tutorial_id,
  t.application_id::text as application_id,
  a.name as application_name,
  t.title as tutorial_title,
  t.slug as tutorial_slug,
  t.description as tutorial_description,
  t.difficulty as tutorial_difficulty,
  t.safety_warning as tutorial_safety_warning,
  t.status::text as tutorial_status,
  t.is_demo as tutorial_is_demo
)sql";

}  // namespace

PostgresCatalogRepository::PostgresCatalogRepository(drogon::orm::DbClientPtr client,
                                                     const bool allow_demo_content)
    : client_(std::move(client)), allow_demo_content_(allow_demo_content) {
  if (!client_) {
    throw std::invalid_argument("PostgreSQL client is required");
  }
}

drogon::Task<bool> PostgresCatalogRepository::ready() const {
  try {
    const auto result = co_await client_->execSqlCoro("select 1 as ready");
    co_return !result.empty() && result.front()["ready"].as<int>() == 1;
  } catch (const std::exception&) {
    co_return false;
  }
}

drogon::Task<std::vector<domain::Application>> PostgresCatalogRepository::list_applications(
    const std::size_t limit, const std::size_t offset) const {
  const auto sql = std::string{"select "} + std::string{application_columns} + R"sql(
    from public.applications a
    join public.categories c on c.id = a.category_id
    where a.status = 'published' or ($1::boolean and a.is_demo)
    order by c.sort_order, a.name
    limit $2 offset $3
  )sql";
  // Todos os valores externos seguem como parâmetros posicionais. Somente a
  // lista fixa de colunas é composta no código, portanto não há SQL do usuário.
  const auto result = co_await client_->execSqlCoro(
      sql, allow_demo_content_, static_cast<std::int64_t>(limit), static_cast<std::int64_t>(offset));
  std::vector<domain::Application> applications;
  applications.reserve(result.size());
  for (const auto& row : result) {
    applications.push_back(application_from_row(row));
  }
  co_return applications;
}

drogon::Task<std::optional<domain::Application>>
PostgresCatalogRepository::find_application_by_slug(std::string slug) const {
  const auto sql = std::string{"select "} + std::string{application_columns} + R"sql(
    from public.applications a
    join public.categories c on c.id = a.category_id
    where a.slug = $1 and (a.status = 'published' or ($2::boolean and a.is_demo))
    limit 1
  )sql";
  const auto result = co_await client_->execSqlCoro(sql, std::move(slug), allow_demo_content_);
  if (result.empty()) co_return std::nullopt;
  co_return application_from_row(result.front());
}

drogon::Task<std::vector<domain::TutorialSummary>>
PostgresCatalogRepository::list_tutorials_for_application(std::string application_id) const {
  const auto sql = std::string{"select "} + std::string{tutorial_columns} + R"sql(
    from public.tutorials t
    join public.applications a on a.id = t.application_id
    where t.application_id = $1::uuid
      and (t.status = 'published' or ($2::boolean and t.is_demo))
    order by t.title
  )sql";
  const auto result =
      co_await client_->execSqlCoro(sql, std::move(application_id), allow_demo_content_);
  std::vector<domain::TutorialSummary> tutorials;
  tutorials.reserve(result.size());
  for (const auto& row : result) {
    tutorials.push_back(tutorial_from_row(row));
  }
  co_return tutorials;
}

drogon::Task<std::optional<domain::GuideContent>> PostgresCatalogRepository::find_guide_by_id(
    std::string id) const {
  const auto sql = std::string{"select "} + std::string{application_columns} + "," +
                   std::string{tutorial_columns} + R"sql(,
      g.id::text as guide_id,
      g.platform::text as guide_platform,
      g.app_version,
      g.guide_version,
      g.reviewed_at::text as reviewed_at,
      g.status::text as guide_status,
      g.estimated_minutes
    from public.guide_versions g
    join public.tutorials t on t.id = g.tutorial_id
    join public.applications a on a.id = t.application_id
    join public.categories c on c.id = a.category_id
    where g.id = $1::uuid
      and (g.status = 'published' or ($2::boolean and t.is_demo))
    limit 1
  )sql";
  const auto result = co_await client_->execSqlCoro(sql, std::move(id), allow_demo_content_);
  co_return co_await assemble_guide(result);
}

drogon::Task<std::optional<domain::GuideContent>>
PostgresCatalogRepository::find_guide_by_tutorial_slug(std::string tutorial_slug,
                                                       const domain::Platform requested_platform) const {
  const auto sql = std::string{"select "} + std::string{application_columns} + "," +
                   std::string{tutorial_columns} + R"sql(,
      g.id::text as guide_id,
      g.platform::text as guide_platform,
      g.app_version,
      g.guide_version,
      g.reviewed_at::text as reviewed_at,
      g.status::text as guide_status,
      g.estimated_minutes
    from public.guide_versions g
    join public.tutorials t on t.id = g.tutorial_id
    join public.applications a on a.id = t.application_id
    join public.categories c on c.id = a.category_id
    where t.slug = $1 and g.platform = $2::public.guido_platform
      and (g.status = 'published' or ($3::boolean and t.is_demo))
    order by g.published_at desc nulls last, g.updated_at desc
    limit 1
  )sql";
  const auto result = co_await client_->execSqlCoro(
      sql, std::move(tutorial_slug), domain::to_string(requested_platform), allow_demo_content_);
  co_return co_await assemble_guide(result);
}

drogon::Task<std::vector<domain::TutorialSummary>> PostgresCatalogRepository::search(
    std::string query, const std::size_t limit) const {
  // A busca combina full-text em português com correspondência parcial. Isso
  // preserva resultados úteis para termos curtos e vocabulário informal.
  const auto sql = std::string{"select "} + std::string{tutorial_columns} + R"sql(
    from public.tutorials t
    join public.applications a on a.id = t.application_id
    where (t.status = 'published' or ($2::boolean and t.is_demo))
      and (
        t.search_document @@ websearch_to_tsquery('portuguese', $1)
        or lower(t.title) like '%' || lower($1) || '%'
        or exists (
          select 1 from public.tutorial_search_terms term
          where term.tutorial_id = t.id and term.normalized_term like '%' || lower($1) || '%'
        )
      )
    order by ts_rank(t.search_document, websearch_to_tsquery('portuguese', $1)) desc, t.title
    limit $3
  )sql";
  const auto result = co_await client_->execSqlCoro(
      sql, std::move(query), allow_demo_content_, static_cast<std::int64_t>(limit));
  std::vector<domain::TutorialSummary> tutorials;
  tutorials.reserve(result.size());
  for (const auto& row : result) {
    tutorials.push_back(tutorial_from_row(row));
  }
  co_return tutorials;
}

drogon::Task<std::optional<domain::GuideContent>> PostgresCatalogRepository::assemble_guide(
    const drogon::orm::Result& result) const {
  if (result.empty()) co_return std::nullopt;
  const auto& row = result.front();
  domain::GuideContent content{
      .application = application_from_row(row),
      .tutorial = tutorial_from_row(row),
      .guide = {.id = row["guide_id"].as<std::string>(),
                .tutorial_id = row["tutorial_id"].as<std::string>(),
                .platform = platform(row["guide_platform"].as<std::string>()),
                .app_version = row["app_version"].as<std::string>(),
                .guide_version = row["guide_version"].as<std::string>(),
                .last_reviewed_at = optional_text(row["reviewed_at"]),
                .status = publication_status(row["guide_status"].as<std::string>()),
                .estimated_minutes = row["estimated_minutes"].as<std::uint16_t>()},
      .steps = {},
  };

  constexpr std::string_view steps_sql = R"sql(
    select
      s.id::text as step_id,
      s.guide_version_id::text as guide_id,
      s.position,
      s.title,
      s.instruction,
      s.image_alt,
      s.warning,
      s.confirmation_message,
      null::text as image_url,
      null::text as audio_url
    from public.steps s
    where s.guide_version_id = $1::uuid
    order by s.position
  )sql";
  const auto steps = co_await client_->execSqlCoro(std::string{steps_sql}, content.guide.id);
  content.steps.reserve(steps.size());
  for (const auto& step : steps) {
    content.steps.push_back({
        .id = step["step_id"].as<std::string>(),
        .guide_version_id = step["guide_id"].as<std::string>(),
        .position = step["position"].as<std::uint16_t>(),
        .title = step["title"].as<std::string>(),
        .instruction = step["instruction"].as<std::string>(),
        .image_url = optional_text(step["image_url"]),
        .image_alt = step["image_alt"].as<std::string>(),
        .audio_url = optional_text(step["audio_url"]),
        .warning = optional_text(step["warning"]),
        .confirmation_message = optional_text(step["confirmation_message"]),
    });
  }
  if (content.steps.empty()) co_return std::nullopt;
  co_return content;
}

}  // namespace guido::infrastructure
