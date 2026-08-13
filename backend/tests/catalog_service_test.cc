#include <cassert>
#include <iostream>
#include <memory>

#include "guido/application/catalog_service.h"
#include "guido/infrastructure/in_memory_catalog_repository.h"
#include "guido/progress/progress_service.h"

namespace {

class FakeProgressRepository final : public guido::progress::ProgressRepository {
 public:
  drogon::Task<std::optional<guido::progress::UserProgress>> get(
      std::string, std::string guide_version_id) const override {
    if (!saved_) co_return std::nullopt;
    auto result = *saved_;
    result.guide_version_id = std::move(guide_version_id);
    co_return result;
  }

  drogon::Task<std::optional<guido::progress::UserProgress>> upsert(
      std::string,
      std::string guide_version_id,
      const std::uint16_t current_step,
      const guido::progress::ProgressStatus status) const override {
    saved_ = guido::progress::UserProgress{
        .guide_version_id = std::move(guide_version_id),
        .current_step = current_step,
        .status = status,
        .last_accessed_at = "2026-08-10T00:00:00Z",
        .completed_at = status == guido::progress::ProgressStatus::completed
                            ? std::optional<std::string>{"2026-08-10T00:00:00Z"}
                            : std::nullopt,
    };
    co_return saved_;
  }

 private:
  mutable std::optional<guido::progress::UserProgress> saved_;
};

template <typename Function>
void expects_validation_error(Function&& function) {
  bool raised = false;
  try {
    function();
  } catch (const guido::application::ValidationError&) {
    raised = true;
  }
  assert(raised);
}

}  // namespace

int main() {
  const auto repository =
      std::make_shared<const guido::infrastructure::InMemoryCatalogRepository>();
  const guido::application::CatalogService service{repository};

  assert(drogon::sync_wait(service.ready()));

  const auto applications = drogon::sync_wait(service.list_applications(20, 0));
  assert(applications.size() == 1);
  assert(applications.front().slug == "banco-demonstracao");

  const auto missing_page = drogon::sync_wait(service.list_applications(20, 100));
  assert(missing_page.empty());
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.list_applications(0, 0))); });
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.list_applications(51, 0))); });
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.list_applications(20, 10'001))); });

  const auto application = drogon::sync_wait(service.find_application("banco-demonstracao"));
  assert(application.has_value());
  assert(application->name == "Banco — demonstração");
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.find_application("../segredo"))); });

  const auto tutorials = drogon::sync_wait(service.list_tutorials("banco-demonstracao"));
  assert(tutorials.size() == 1);
  assert(tutorials.front().is_demo);

  const auto android_guide =
      drogon::sync_wait(service.find_tutorial_guide("pagar-boleto", "android"));
  assert(android_guide.has_value());
  assert(android_guide->steps.size() == 6);
  assert(android_guide->steps.back().warning.has_value());
  assert(android_guide->steps.back().warning->find("nunca pede sua senha") != std::string::npos);

  const auto ios_guide = drogon::sync_wait(service.find_tutorial_guide("pagar-boleto", "ios"));
  assert(ios_guide.has_value());
  assert(ios_guide->guide.platform == guido::domain::Platform::ios);
  expects_validation_error(
      [&] {
        static_cast<void>(
            drogon::sync_wait(service.find_tutorial_guide("pagar-boleto", "windows")));
      });

  const auto search_results = drogon::sync_wait(service.search("boleto", 10));
  assert(search_results.size() == 1);
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.search("", 10))); });
  expects_validation_error(
      [&] { static_cast<void>(drogon::sync_wait(service.search("boleto", 100))); });

  const auto progress_repository = std::make_shared<const FakeProgressRepository>();
  const guido::progress::ProgressService progress_service{progress_repository};
  const auto saved_progress = drogon::sync_wait(
      progress_service.save("user-1", "guide-1", 3, "in_progress"));
  assert(saved_progress.has_value());
  assert(saved_progress->current_step == 3);
  assert(saved_progress->status == guido::progress::ProgressStatus::in_progress);
  const auto loaded_progress =
      drogon::sync_wait(progress_service.get("user-1", "guide-1"));
  assert(loaded_progress.has_value());
  assert(loaded_progress->current_step == 3);

  bool invalid_progress_raised = false;
  try {
    static_cast<void>(
        drogon::sync_wait(progress_service.save("user-1", "guide-1", 500, "in_progress")));
  } catch (const guido::progress::ProgressValidationError&) {
    invalid_progress_raised = true;
  }
  assert(invalid_progress_raised);

  invalid_progress_raised = false;
  try {
    static_cast<void>(
        drogon::sync_wait(progress_service.save("user-1", "guide-1", 1, "unknown")));
  } catch (const guido::progress::ProgressValidationError&) {
    invalid_progress_raised = true;
  }
  assert(invalid_progress_raised);

  std::cout << "All Guido core tests passed\n";
  return 0;
}
