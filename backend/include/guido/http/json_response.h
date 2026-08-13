#pragma once

#include <drogon/HttpResponse.h>

#include <string_view>

namespace guido::http {

[[nodiscard]] drogon::HttpResponsePtr json_response(Json::Value body,
                                                     drogon::HttpStatusCode status);
[[nodiscard]] drogon::HttpResponsePtr error_response(std::string_view code,
                                                      std::string_view message,
                                                      drogon::HttpStatusCode status,
                                                      std::string_view request_id);

}  // namespace guido::http

