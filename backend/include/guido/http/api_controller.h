#pragma once

#include <memory>
#include <string>

#include "guido/application/catalog_service.h"
#include "guido/auth/auth_gateway.h"
#include "guido/progress/progress_service.h"

namespace guido::http {

class ApiController final {
 public:
  ApiController(std::shared_ptr<const application::CatalogService> catalog_service,
                std::string repository_name,
                std::shared_ptr<const auth::AuthGateway> auth_gateway = nullptr,
                std::shared_ptr<const progress::ProgressService> progress_service = nullptr);
  void register_routes() const;

 private:
  std::shared_ptr<const application::CatalogService> catalog_service_;
  std::string repository_name_;
  std::shared_ptr<const auth::AuthGateway> auth_gateway_;
  std::shared_ptr<const progress::ProgressService> progress_service_;
};

}  // namespace guido::http
