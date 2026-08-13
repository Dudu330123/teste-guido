#pragma once

#include <cstdint>
#include <optional>
#include <string>
#include <vector>

namespace guido::domain {

enum class Platform { android, ios };
enum class PublicationStatus { draft, under_review, published, outdated };

struct Application {
  std::string id;
  std::string name;
  std::string slug;
  std::string description;
  std::string category;
  std::optional<std::string> logo_url;
  PublicationStatus status{PublicationStatus::draft};
};

struct TutorialSummary {
  std::string id;
  std::string application_id;
  std::string application_name;
  std::string title;
  std::string slug;
  std::string description;
  std::string difficulty;
  std::string safety_warning;
  std::vector<std::string> search_terms;
  PublicationStatus status{PublicationStatus::draft};
  bool is_demo{false};
};

struct GuideVersion {
  std::string id;
  std::string tutorial_id;
  Platform platform{Platform::android};
  std::string app_version;
  std::string guide_version;
  std::optional<std::string> last_reviewed_at;
  PublicationStatus status{PublicationStatus::draft};
  std::uint16_t estimated_minutes{0};
};

struct GuideStep {
  std::string id;
  std::string guide_version_id;
  std::uint16_t position{0};
  std::string title;
  std::string instruction;
  std::optional<std::string> image_url;
  std::string image_alt;
  std::optional<std::string> audio_url;
  std::optional<std::string> warning;
  std::optional<std::string> confirmation_message;
};

struct GuideContent {
  Application application;
  TutorialSummary tutorial;
  GuideVersion guide;
  std::vector<GuideStep> steps;
};

[[nodiscard]] std::string to_string(Platform platform);
[[nodiscard]] std::string to_string(PublicationStatus status);

}  // namespace guido::domain
