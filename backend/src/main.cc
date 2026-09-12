#include <drogon/drogon.h>

#include <algorithm>
#include <charconv>
#include <cstdlib>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <system_error>
#include <thread>

#include "guido/application/catalog_service.h"
#include "guido/http/api_controller.h"
#include "guido/infrastructure/in_memory_catalog_repository.h"
#include "guido/infrastructure/postgres_catalog_repository.h"
#include "guido/progress/postgres_progress_repository.h"
#include "guido/progress/progress_service.h"

namespace {

[[nodiscard]] std::string environment_or(std::string_view name, std::string fallback) {
  const auto* value = std::getenv(std::string{name}.c_str());
  return value == nullptr || std::string_view{value}.empty() ? std::move(fallback) : value;
}

[[nodiscard]] std::uint16_t port_from_environment() {
  const auto raw = environment_or("GUIDO_API_PORT", "8080");
  unsigned int value = 0;
  const auto [position, error] = std::from_chars(raw.data(), raw.data() + raw.size(), value);
  if (error != std::errc{} || position != raw.data() + raw.size() || value == 0 || value > 65535) {
    throw std::invalid_argument("GUIDO_API_PORT must be between 1 and 65535");
  }
  return static_cast<std::uint16_t>(value);
}

[[nodiscard]] std::size_t database_pool_size() {
  const auto raw = environment_or("GUIDO_DATABASE_POOL_SIZE", "4");
  unsigned int value = 0;
  const auto [position, error] = std::from_chars(raw.data(), raw.data() + raw.size(), value);
  if (error != std::errc{} || position != raw.data() + raw.size() || value == 0 || value > 20) {
    throw std::invalid_argument("GUIDO_DATABASE_POOL_SIZE must be between 1 and 20");
  }
  return value;
}

}  // namespace

int main() {
  const auto environment = environment_or("GUIDO_ENV", "development");
  const auto database_url = environment_or("GUIDO_DATABASE_URL", "");
  guido::domain::CatalogRepositoryPtr repository;
  drogon::orm::DbClientPtr database_client;
  std::string repository_name;

  // O modo em memória mantém o projeto executável sem credenciais durante o
  // desenvolvimento. Em produção o fallback é proibido para evitar servir
  // conteúdo demonstrativo como se viesse do catálogo oficial.
  if (!database_url.empty()) {
    database_client = drogon::orm::DbClient::newPgClient(database_url, database_pool_size());
    repository = std::make_shared<const guido::infrastructure::PostgresCatalogRepository>(
        database_client, environment != "production");
    repository_name = "postgresql";
  } else if (environment == "production") {
    throw std::runtime_error(
        "The in-memory repository is disabled in production; configure PostgreSQL first");
  } else {
    repository = std::make_shared<const guido::infrastructure::InMemoryCatalogRepository>();
    repository_name = "in-memory";
  }
  const auto service = std::make_shared<const guido::application::CatalogService>(repository);
  std::shared_ptr<const guido::auth::AuthGateway> auth_gateway;
  std::shared_ptr<const guido::progress::ProgressService> progress_service;
  // Next.js owns authentication. This historical C++ service remains optional
  // and no longer contacts an external authentication provider.
  if (database_client) {
    const auto progress_repository =
        std::make_shared<const guido::progress::PostgresProgressRepository>(
            database_client, environment != "production");
    progress_service =
        std::make_shared<const guido::progress::ProgressService>(progress_repository);
  } else if (environment == "production") {
    throw std::runtime_error(
        "Production requires PostgreSQL configuration");
  }

  const guido::http::ApiController controller{service, repository_name, auth_gateway,
                                               progress_service};
  controller.register_routes();

  const auto hardware_threads = std::max(1U, std::thread::hardware_concurrency());
  const auto thread_count = std::min(4U, hardware_threads);
  const auto host = environment_or("GUIDO_API_HOST", "127.0.0.1");
  const auto port = port_from_environment();

  LOG_INFO << "Starting Guido API on " << host << ':' << port << " with " << thread_count
           << " I/O threads";
  // O limite reduz o impacto de corpos abusivos: nesta versão a maior escrita
  // válida contém apenas a etapa e o status do progresso.
  drogon::app()
      .enableServerHeader(false)
      .setClientMaxBodySize(64 * 1024)
      .addListener(host, port)
      .setThreadNum(thread_count)
      .run();
  return 0;
}
