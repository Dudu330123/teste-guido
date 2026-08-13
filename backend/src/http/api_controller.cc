#include "guido/http/api_controller.h"

#include <drogon/drogon.h>
#include <drogon/utils/Utilities.h>

#include <charconv>
#include <algorithm>
#include <cctype>
#include <cstddef>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <system_error>
#include <utility>

#include "guido/http/json_response.h"

namespace guido::http {
namespace {

[[nodiscard]] std::string request_id(const drogon::HttpRequestPtr& request) {
  const auto supplied = request->getHeader("x-request-id");
  // Aceitamos o identificador do cliente somente em um formato seguro para
  // logs. Entradas arbitrárias poderiam forjar linhas ou poluir observabilidade.
  const bool safe = !supplied.empty() && supplied.size() <= 100 &&
                    std::ranges::all_of(supplied, [](const unsigned char character) {
                      return std::isalnum(character) != 0 || character == '-' || character == '_' ||
                             character == '.';
                    });
  if (safe) {
    return supplied;
  }
  return drogon::utils::getUuid();
}

[[nodiscard]] std::size_t parse_size_parameter(const drogon::HttpRequestPtr& request,
                                               const std::string& name,
                                               const std::size_t fallback) {
  const auto raw = request->getParameter(name);
  if (raw.empty()) {
    return fallback;
  }
  std::size_t value = 0;
  const auto [position, error] = std::from_chars(raw.data(), raw.data() + raw.size(), value);
  if (error != std::errc{} || position != raw.data() + raw.size()) {
    throw application::ValidationError("O parâmetro " + name + " deve ser um número inteiro.");
  }
  return value;
}

[[nodiscard]] Json::Value optional_string(const std::optional<std::string>& value) {
  return value ? Json::Value{*value} : Json::Value{};
}

[[nodiscard]] Json::Value application_json(const domain::Application& application) {
  Json::Value result;
  result["id"] = application.id;
  result["name"] = application.name;
  result["slug"] = application.slug;
  result["description"] = application.description;
  result["category"] = application.category;
  result["logoUrl"] = optional_string(application.logo_url);
  result["status"] = domain::to_string(application.status);
  return result;
}

[[nodiscard]] Json::Value tutorial_json(const domain::TutorialSummary& tutorial) {
  Json::Value result;
  result["id"] = tutorial.id;
  result["applicationId"] = tutorial.application_id;
  result["applicationName"] = tutorial.application_name;
  result["title"] = tutorial.title;
  result["slug"] = tutorial.slug;
  result["description"] = tutorial.description;
  result["difficulty"] = tutorial.difficulty;
  result["safetyWarning"] = tutorial.safety_warning;
  result["status"] = domain::to_string(tutorial.status);
  result["isDemo"] = tutorial.is_demo;
  Json::Value terms{Json::arrayValue};
  for (const auto& term : tutorial.search_terms) {
    terms.append(term);
  }
  result["searchTerms"] = std::move(terms);
  return result;
}

[[nodiscard]] Json::Value guide_json(const domain::GuideContent& content) {
  Json::Value result;
  result["application"] = application_json(content.application);
  result["tutorial"] = tutorial_json(content.tutorial);
  result["guide"]["id"] = content.guide.id;
  result["guide"]["tutorialId"] = content.guide.tutorial_id;
  result["guide"]["platform"] = domain::to_string(content.guide.platform);
  result["guide"]["appVersion"] = content.guide.app_version;
  result["guide"]["guideVersion"] = content.guide.guide_version;
  result["guide"]["lastReviewedAt"] = optional_string(content.guide.last_reviewed_at);
  result["guide"]["status"] = domain::to_string(content.guide.status);
  result["guide"]["estimatedMinutes"] = content.guide.estimated_minutes;

  Json::Value steps{Json::arrayValue};
  for (const auto& step : content.steps) {
    Json::Value value;
    value["id"] = step.id;
    value["guideId"] = step.guide_version_id;
    value["order"] = step.position;
    value["title"] = step.title;
    value["instruction"] = step.instruction;
    value["imageUrl"] = optional_string(step.image_url);
    value["imageAlt"] = step.image_alt;
    value["audioUrl"] = optional_string(step.audio_url);
    value["warning"] = optional_string(step.warning);
    value["confirmationMessage"] = optional_string(step.confirmation_message);
    steps.append(std::move(value));
  }
  result["steps"] = std::move(steps);
  return result;
}

[[nodiscard]] Json::Value progress_json(const progress::UserProgress& progress) {
  Json::Value result;
  result["guideId"] = progress.guide_version_id;
  result["currentStep"] = progress.current_step;
  result["status"] = progress::to_string(progress.status);
  result["lastAccessedAt"] = progress.last_accessed_at;
  result["completedAt"] = optional_string(progress.completed_at);
  return result;
}

[[nodiscard]] std::optional<std::string> bearer_token(const drogon::HttpRequestPtr& request) {
  constexpr std::string_view prefix = "Bearer ";
  const auto header = request->getHeader("authorization");
  // O teto acompanha o limite aplicado no gateway e evita encaminhar tokens
  // anormalmente grandes para o serviço externo de autenticação.
  if (!header.starts_with(prefix) || header.size() <= prefix.size() || header.size() > 4103) {
    return std::nullopt;
  }
  const auto token = header.substr(prefix.size());
  if (token.find_first_of(" \t\r\n") != std::string::npos) return std::nullopt;
  return token;
}

template <typename Function>
drogon::Task<drogon::HttpResponsePtr> handle(drogon::HttpRequestPtr request,
                                             Function function) {
  // Request e callable são recebidos por valor deliberadamente. As corrotinas
  // do Drogon são lazy; referências aqui poderiam sobreviver ao frame chamador.
  const auto id = request_id(request);
  try {
    auto response = co_await function(id);
    response->addHeader("X-Request-Id", id);
    co_return response;
  } catch (const application::ValidationError& error) {
    co_return error_response("invalid_request", error.what(), drogon::k400BadRequest, id);
  } catch (const progress::ProgressValidationError& error) {
    co_return error_response("invalid_request", error.what(), drogon::k400BadRequest, id);
  } catch (const std::exception& error) {
    // O detalhe técnico fica apenas no log associado ao request id. A resposta
    // pública não expõe SQL, stack trace ou configuração interna.
    LOG_ERROR << "request_id=" << id << " unhandled_error=" << error.what();
    co_return error_response("internal_error", "Não foi possível concluir a solicitação.",
                             drogon::k500InternalServerError, id);
  }
}

}  // namespace

ApiController::ApiController(std::shared_ptr<const application::CatalogService> catalog_service,
                             std::string repository_name,
                             std::shared_ptr<const auth::AuthGateway> auth_gateway,
                             std::shared_ptr<const progress::ProgressService> progress_service)
    : catalog_service_(std::move(catalog_service)),
      repository_name_(std::move(repository_name)),
      auth_gateway_(std::move(auth_gateway)),
      progress_service_(std::move(progress_service)) {
  if (!catalog_service_) {
    throw std::invalid_argument("catalog service is required");
  }
}

void ApiController::register_routes() const {
  const auto service = catalog_service_;
  const auto repository_name = repository_name_;
  const auto auth_gateway = auth_gateway_;
  const auto progress_service = progress_service_;

  drogon::app().registerHandler(
      "/healthz",
      [](const drogon::HttpRequestPtr request) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [](const std::string&) -> drogon::Task<drogon::HttpResponsePtr> {
          Json::Value body;
          body["status"] = "ok";
          body["service"] = "guido-api";
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/readyz",
      [service, repository_name](
          const drogon::HttpRequestPtr request) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, repository_name](const std::string&)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto ready = co_await service->ready();
          Json::Value body;
          body["status"] = ready ? "ready" : "not_ready";
          body["repository"] = repository_name;
          co_return json_response(std::move(body),
                                  ready ? drogon::k200OK : drogon::k503ServiceUnavailable);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/applications",
      [service](const drogon::HttpRequestPtr request) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, request](const std::string&)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto limit = parse_size_parameter(
              request, "limit", application::CatalogService::kDefaultPageSize);
          const auto offset = parse_size_parameter(request, "offset", 0);
          const auto applications = co_await service->list_applications(limit, offset);
          Json::Value body;
          body["items"] = Json::arrayValue;
          for (const auto& application : applications) {
            body["items"].append(application_json(application));
          }
          body["pagination"]["limit"] = Json::UInt64{limit};
          body["pagination"]["offset"] = Json::UInt64{offset};
          body["pagination"]["returned"] = Json::UInt64{applications.size()};
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/applications/{1}",
      [service](const drogon::HttpRequestPtr request,
                const std::string slug) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, slug](const std::string& id)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto application = co_await service->find_application(slug);
          if (!application) {
            co_return error_response("not_found", "Aplicativo não encontrado.",
                                     drogon::k404NotFound, id);
          }
          Json::Value body;
          body["data"] = application_json(*application);
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/applications/{1}/tutorials",
      [service](const drogon::HttpRequestPtr request,
                const std::string application_slug) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, application_slug](const std::string& id)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto application = co_await service->find_application(application_slug);
          if (!application) {
            co_return error_response("not_found", "Aplicativo não encontrado.",
                                     drogon::k404NotFound, id);
          }
          const auto tutorials = co_await service->list_tutorials(application_slug);
          Json::Value body;
          body["items"] = Json::arrayValue;
          for (const auto& tutorial : tutorials) {
            body["items"].append(tutorial_json(tutorial));
          }
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/tutorials/{1}",
      [service](const drogon::HttpRequestPtr request,
                const std::string tutorial_slug) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, request, tutorial_slug](const std::string& id)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto platform = request->getParameter("platform");
          const auto guide = co_await service->find_tutorial_guide(tutorial_slug, platform);
          if (!guide) {
            co_return error_response("not_found", "Tutorial não encontrado para esta plataforma.",
                                     drogon::k404NotFound, id);
          }
          Json::Value body;
          body["data"] = guide_json(*guide);
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/guides/{1}",
      [service](const drogon::HttpRequestPtr request,
                const std::string id) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, id](const std::string& request_id_value)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto guide = co_await service->find_guide(id);
          if (!guide) {
            co_return error_response("not_found", "Guia não encontrado.", drogon::k404NotFound,
                                     request_id_value);
          }
          Json::Value body;
          body["data"] = guide_json(*guide);
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/search",
      [service](const drogon::HttpRequestPtr request) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [service, request](const std::string&)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          const auto limit = parse_size_parameter(request, "limit", 10);
          const auto matches = co_await service->search(request->getParameter("q"), limit);
          Json::Value body;
          body["items"] = Json::arrayValue;
          for (const auto& tutorial : matches) {
            body["items"].append(tutorial_json(tutorial));
          }
          body["returned"] = Json::UInt64{matches.size()};
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/me/progress/{1}",
      [auth_gateway, progress_service](
          const drogon::HttpRequestPtr request,
          const std::string guide_id) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [auth_gateway, progress_service, request, guide_id](
                                   const std::string& request_id_value)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          if (!auth_gateway || !progress_service) {
            co_return error_response("service_unavailable",
                                     "O progresso com conta ainda não está configurado.",
                                     drogon::k503ServiceUnavailable, request_id_value);
          }
          const auto token = bearer_token(request);
          if (!token) {
            co_return error_response("unauthorized", "Entre na sua conta para continuar.",
                                     drogon::k401Unauthorized, request_id_value);
          }
          const auto user = co_await auth_gateway->authenticate(*token);
          if (!user) {
            co_return error_response("unauthorized", "Sua sessão é inválida ou expirou.",
                                     drogon::k401Unauthorized, request_id_value);
          }
          const auto saved_progress = co_await progress_service->get(user->id, guide_id);
          if (!saved_progress) {
            co_return error_response("not_found", "Progresso ainda não iniciado.",
                                     drogon::k404NotFound, request_id_value);
          }
          Json::Value body;
          body["data"] = progress_json(*saved_progress);
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Get});

  drogon::app().registerHandler(
      "/api/v1/me/progress/{1}",
      [auth_gateway, progress_service](
          const drogon::HttpRequestPtr request,
          const std::string guide_id) -> drogon::Task<drogon::HttpResponsePtr> {
        return handle(request, [auth_gateway, progress_service, request, guide_id](
                                   const std::string& request_id_value)
                                   -> drogon::Task<drogon::HttpResponsePtr> {
          if (!auth_gateway || !progress_service) {
            co_return error_response("service_unavailable",
                                     "O progresso com conta ainda não está configurado.",
                                     drogon::k503ServiceUnavailable, request_id_value);
          }
          const auto token = bearer_token(request);
          if (!token) {
            co_return error_response("unauthorized", "Entre na sua conta para continuar.",
                                     drogon::k401Unauthorized, request_id_value);
          }
          const auto user = co_await auth_gateway->authenticate(*token);
          if (!user) {
            co_return error_response("unauthorized", "Sua sessão é inválida ou expirou.",
                                     drogon::k401Unauthorized, request_id_value);
          }
          const auto json = request->getJsonObject();
          if (!json || !json->isMember("currentStep") || !(*json)["currentStep"].isUInt() ||
              !json->isMember("status") || !(*json)["status"].isString()) {
            throw progress::ProgressValidationError(
                "Informe currentStep e status em formato válido.");
          }
          const auto current_step = (*json)["currentStep"].asUInt();
          if (current_step > 499) {
            throw progress::ProgressValidationError("A etapa atual deve estar entre 0 e 499.");
          }
          const auto saved_progress = co_await progress_service->save(
              user->id, guide_id, static_cast<std::uint16_t>(current_step),
              (*json)["status"].asString());
          if (!saved_progress) {
            co_return error_response("not_found", "Guia ou etapa não encontrado.",
                                     drogon::k404NotFound, request_id_value);
          }
          Json::Value body;
          body["data"] = progress_json(*saved_progress);
          co_return json_response(std::move(body), drogon::k200OK);
        });
      },
      {drogon::Put});
}

}  // namespace guido::http
