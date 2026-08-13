#include <cassert>
#include <cstdlib>
#include <iostream>
#include <memory>
#include <string>

#include <drogon/orm/DbClient.h>
#include <drogon/utils/coroutine.h>

#include "guido/progress/postgres_progress_repository.h"

namespace {

drogon::Task<void> create_test_user(const drogon::orm::DbClientPtr& client,
                                    const std::string& user_id) {
  static_cast<void>(co_await client->execSqlCoro(
      "insert into auth.users (id) values ($1::uuid) on conflict (id) do nothing", user_id));
  co_return;
}

drogon::Task<void> delete_test_user(const drogon::orm::DbClientPtr& client,
                                    const std::string& user_id) {
  static_cast<void>(co_await client->execSqlCoro(
      "delete from auth.users where id = $1::uuid", user_id));
  co_return;
}

}  // namespace

int main() {
  const auto* database_url = std::getenv("GUIDO_TEST_DATABASE_URL");
  if (database_url == nullptr || std::string{database_url}.empty()) {
    std::cout << "Skipped: GUIDO_TEST_DATABASE_URL is not configured\n";
    return 77;
  }

  constexpr std::string_view user_id = "50000000-0000-4000-8000-000000000001";
  constexpr std::string_view guide_id = "40000000-0000-4000-8000-000000000001";
  const auto client = drogon::orm::DbClient::newPgClient(database_url, 1);

  drogon::sync_wait(create_test_user(client, std::string{user_id}));

  const guido::progress::PostgresProgressRepository repository{client, true};
  const auto started = drogon::sync_wait(repository.upsert(
      std::string{user_id}, std::string{guide_id}, 0,
      guido::progress::ProgressStatus::in_progress));
  assert(started.has_value());
  assert(started->current_step == 0);

  const auto saved = drogon::sync_wait(repository.upsert(
      std::string{user_id}, std::string{guide_id}, 3,
      guido::progress::ProgressStatus::in_progress));
  assert(saved.has_value());
  assert(saved->current_step == 3);

  const auto loaded =
      drogon::sync_wait(repository.get(std::string{user_id}, std::string{guide_id}));
  assert(loaded.has_value());
  assert(loaded->status == guido::progress::ProgressStatus::in_progress);

  const auto invalid_step = drogon::sync_wait(repository.upsert(
      std::string{user_id}, std::string{guide_id}, 6,
      guido::progress::ProgressStatus::in_progress));
  assert(!invalid_step.has_value());

  drogon::sync_wait(delete_test_user(client, std::string{user_id}));
  std::cout << "PostgreSQL progress integration tests passed\n";
  return 0;
}
