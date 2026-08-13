#include "guido/progress/postgres_progress_repository.h"

#include <drogon/orm/Result.h>

#include <optional>
#include <stdexcept>
#include <utility>

namespace guido::progress {
namespace {

[[nodiscard]] std::optional<std::string> optional_text(const drogon::orm::Field& field) {
  return field.isNull() ? std::nullopt : std::optional{field.as<std::string>()};
}

[[nodiscard]] UserProgress progress_from_row(const drogon::orm::Row& row) {
  const auto status = progress_status_from_string(row["status"].as<std::string>());
  if (!status) throw std::runtime_error("invalid progress status stored in database");
  return {
      .guide_version_id = row["guide_version_id"].as<std::string>(),
      .current_step = row["current_step"].as<std::uint16_t>(),
      .status = *status,
      .last_accessed_at = row["last_accessed_at"].as<std::string>(),
      .completed_at = optional_text(row["completed_at"]),
  };
}

}  // namespace

PostgresProgressRepository::PostgresProgressRepository(drogon::orm::DbClientPtr client,
                                                       const bool allow_demo_content)
    : client_(std::move(client)), allow_demo_content_(allow_demo_content) {
  if (!client_) throw std::invalid_argument("PostgreSQL client is required");
}

drogon::Task<std::optional<UserProgress>> PostgresProgressRepository::get(
    std::string user_id, std::string guide_version_id) const {
  constexpr std::string_view sql = R"sql(
    select guide_version_id::text, current_step, status::text,
           last_accessed_at::text, completed_at::text
    from public.user_progress
    where user_id = $1::uuid and guide_version_id = $2::uuid
    limit 1
  )sql";
  const auto result =
      co_await client_->execSqlCoro(std::string{sql}, std::move(user_id), std::move(guide_version_id));
  if (result.empty()) co_return std::nullopt;
  co_return progress_from_row(result.front());
}

drogon::Task<std::optional<UserProgress>> PostgresProgressRepository::upsert(
    std::string user_id,
    std::string guide_version_id,
    const std::uint16_t current_step,
    const ProgressStatus status) const {
  // A CTE valida publicação, conteúdo demonstrativo e limite real de passos na
  // mesma operação do upsert. Assim não existe janela entre validar e gravar.
  constexpr std::string_view sql = R"sql(
    with valid_guide as (
      select g.id
      from public.guide_versions g
      join public.tutorials t on t.id = g.tutorial_id
      where g.id = $2::uuid
        and (g.status = 'published' or ($5::boolean and t.is_demo))
        and $3::smallint between 0 and (
          select count(*) - 1 from public.steps s where s.guide_version_id = g.id
        )
    )
    insert into public.user_progress (
      user_id, guide_version_id, current_step, status, last_accessed_at, completed_at
    )
    select $1::uuid, valid_guide.id, $3::smallint, $4::public.guido_progress_status, now(),
           case when $4 = 'completed' then now() else null end
    from valid_guide
    on conflict (user_id, guide_version_id) do update set
      current_step = excluded.current_step,
      status = excluded.status,
      last_accessed_at = excluded.last_accessed_at,
      completed_at = excluded.completed_at
    returning guide_version_id::text, current_step, status::text,
              last_accessed_at::text, completed_at::text
  )sql";
  const auto result = co_await client_->execSqlCoro(
      std::string{sql}, std::move(user_id), std::move(guide_version_id), current_step,
      to_string(status), allow_demo_content_);
  if (result.empty()) co_return std::nullopt;
  co_return progress_from_row(result.front());
}

}  // namespace guido::progress
