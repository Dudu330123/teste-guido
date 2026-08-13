#include "guido/http/json_response.h"

#include <string>

namespace guido::http {

drogon::HttpResponsePtr json_response(Json::Value body, const drogon::HttpStatusCode status) {
  auto response = drogon::HttpResponse::newHttpJsonResponse(std::move(body));
  response->setStatusCode(status);
  response->addHeader("Cache-Control", "no-store");
  response->addHeader("X-Content-Type-Options", "nosniff");
  response->addHeader("X-Frame-Options", "DENY");
  response->addHeader("Referrer-Policy", "no-referrer");
  response->addHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  return response;
}

drogon::HttpResponsePtr error_response(const std::string_view code,
                                       const std::string_view message,
                                       const drogon::HttpStatusCode status,
                                       const std::string_view request_id) {
  Json::Value body;
  body["error"]["code"] = std::string{code};
  body["error"]["message"] = std::string{message};
  body["error"]["requestId"] = std::string{request_id};
  auto response = json_response(std::move(body), status);
  response->addHeader("X-Request-Id", std::string{request_id});
  return response;
}

}  // namespace guido::http
