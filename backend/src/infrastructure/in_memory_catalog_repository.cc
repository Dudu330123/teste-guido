#include "guido/infrastructure/in_memory_catalog_repository.h"

#include <algorithm>
#include <cctype>
#include <iterator>
#include <string>

namespace guido::domain {

std::string to_string(const Platform platform) {
  return platform == Platform::android ? "android" : "ios";
}

std::string to_string(const PublicationStatus status) {
  switch (status) {
    case PublicationStatus::draft:
      return "draft";
    case PublicationStatus::under_review:
      return "under_review";
    case PublicationStatus::published:
      return "published";
    case PublicationStatus::outdated:
      return "outdated";
  }
  return "draft";
}

}  // namespace guido::domain

namespace guido::infrastructure {
namespace {

[[nodiscard]] std::string normalize(std::string_view value) {
  std::string result;
  result.reserve(value.size());
  for (const unsigned char character : value) {
    result.push_back(static_cast<char>(std::tolower(character)));
  }
  return result;
}

[[nodiscard]] bool contains_normalized(std::string_view value, const std::string& query) {
  return normalize(value).find(query) != std::string::npos;
}

[[nodiscard]] std::optional<std::string> copy_optional(
    const std::optional<std::string_view>& value) {
  return value ? std::optional{std::string{*value}} : std::nullopt;
}

[[nodiscard]] std::vector<domain::GuideStep> demo_steps(std::string_view guide_id) {
  struct StepSeed {
    std::string_view title;
    std::string_view instruction;
    std::string_view image_alt;
    std::optional<std::string_view> warning;
    std::optional<std::string_view> confirmation;
  };

  constexpr std::string_view financial_warning =
      "Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca "
      "pede sua senha e nunca confirma pagamentos por você.";

  const std::vector<StepSeed> seeds{
      {"Abra o aplicativo", "Toque no aplicativo oficial do seu banco para abri-lo.",
       "Tela inicial fictícia de celular com um aplicativo genérico de banco destacado.",
       std::nullopt, std::nullopt},
      {"Procure Pagamentos",
       "Na tela inicial do banco, procure uma opção com o texto Pagamentos.",
       "Tela bancária fictícia com a opção Pagamentos destacada.", std::nullopt, std::nullopt},
      {"Escolha boleto", "Toque na opção relacionada a pagamento de boleto.",
       "Menu fictício de pagamentos com a opção Boleto destacada.", std::nullopt, std::nullopt},
      {"Escolha como informar o código",
       "Escolha entre usar a câmera ou digitar o código. Não informe nenhum dado neste guia.",
       "Tela fictícia oferecendo leitura por câmera ou digitação, sem dados reais.", std::nullopt,
       std::nullopt},
      {"Confira as informações",
       "Antes de continuar no banco, confira com calma todos os dados mostrados.",
       "Tela fictícia de conferência com campos genéricos e sem valores ou pessoas reais.",
       std::nullopt, std::nullopt},
      {"Pare antes de confirmar",
       "O guia termina aqui. Volte ao aplicativo do banco somente se estiver seguro.",
       "Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.",
       financial_warning, "Demonstração concluída sem realizar qualquer operação bancária."},
  };

  std::vector<domain::GuideStep> steps;
  steps.reserve(seeds.size());
  for (std::size_t index = 0; index < seeds.size(); ++index) {
    const auto& seed = seeds[index];
    steps.push_back({
        .id = std::string{guide_id} + "-step-" + std::to_string(index + 1),
        .guide_version_id = std::string{guide_id},
        .position = static_cast<std::uint16_t>(index + 1),
        .title = std::string{seed.title},
        .instruction = std::string{seed.instruction},
        .image_url = std::nullopt,
        .image_alt = std::string{seed.image_alt},
        .audio_url = std::nullopt,
        .warning = copy_optional(seed.warning),
        .confirmation_message = copy_optional(seed.confirmation),
    });
  }
  return steps;
}

}  // namespace

InMemoryCatalogRepository::InMemoryCatalogRepository()
    : applications_{{.id = "app-demo-bancos",
                     .name = "Banco — demonstração",
                     .slug = "banco-demonstracao",
                     .description = "Exemplo educativo genérico, sem vínculo com qualquer banco.",
                     .category = "Serviços financeiros",
                     .logo_url = std::nullopt,
                     .status = domain::PublicationStatus::draft}},
      tutorials_{{.id = "tutorial-pagar-boleto-demo",
                  .application_id = "app-demo-bancos",
                  .application_name = "Banco — demonstração",
                  .title = "Pagar um boleto",
                  .slug = "pagar-boleto",
                  .description =
                      "Aprenda a reconhecer as etapas comuns, sem realizar um pagamento.",
                  .difficulty = "medium",
                  .safety_warning =
                      "Conteúdo demonstrativo, não oficial e pendente de validação humana.",
                  .search_terms = {"boleto", "pagar conta", "código de barras", "linha digitável"},
                  .status = domain::PublicationStatus::draft,
                  .is_demo = true}},
      guides_{} {
  const auto& tutorial = tutorials_.front();
  for (const auto platform : {domain::Platform::android, domain::Platform::ios}) {
    const auto guide_id = "guide-pagar-boleto-" + domain::to_string(platform);
    guides_.push_back({
        .application = applications_.front(),
        .tutorial = tutorial,
        .guide = {.id = guide_id,
                  .tutorial_id = tutorial.id,
                  .platform = platform,
                  .app_version = "genérica",
                  .guide_version = "0.1-demo",
                  .last_reviewed_at = std::nullopt,
                  .status = domain::PublicationStatus::draft,
                  .estimated_minutes = 4},
        .steps = demo_steps(guide_id),
    });
  }
}

drogon::Task<bool> InMemoryCatalogRepository::ready() const {
  co_return true;
}

drogon::Task<std::vector<domain::Application>> InMemoryCatalogRepository::list_applications(
    const std::size_t limit, const std::size_t offset) const {
  if (offset >= applications_.size()) {
    co_return std::vector<domain::Application>{};
  }
  const auto begin = applications_.begin() + static_cast<std::ptrdiff_t>(offset);
  const auto remaining = applications_.size() - offset;
  const auto count = std::min(limit, remaining);
  co_return std::vector<domain::Application>{begin,
                                             begin + static_cast<std::ptrdiff_t>(count)};
}

drogon::Task<std::optional<domain::Application>>
InMemoryCatalogRepository::find_application_by_slug(std::string slug) const {
  const auto match = std::ranges::find(applications_, slug, &domain::Application::slug);
  co_return match == applications_.end() ? std::nullopt : std::optional{*match};
}

drogon::Task<std::vector<domain::TutorialSummary>>
InMemoryCatalogRepository::list_tutorials_for_application(std::string application_id) const {
  std::vector<domain::TutorialSummary> result;
  std::ranges::copy_if(tutorials_, std::back_inserter(result), [&](const auto& tutorial) {
    return tutorial.application_id == application_id;
  });
  co_return result;
}

drogon::Task<std::optional<domain::GuideContent>> InMemoryCatalogRepository::find_guide_by_id(
    std::string id) const {
  const auto match = std::ranges::find(guides_, id, [](const auto& value) { return value.guide.id; });
  co_return match == guides_.end() ? std::nullopt : std::optional{*match};
}

drogon::Task<std::optional<domain::GuideContent>>
InMemoryCatalogRepository::find_guide_by_tutorial_slug(std::string tutorial_slug,
                                                        const domain::Platform platform) const {
  const auto match = std::ranges::find_if(guides_, [&](const auto& value) {
    return value.tutorial.slug == tutorial_slug && value.guide.platform == platform;
  });
  co_return match == guides_.end() ? std::nullopt : std::optional{*match};
}

drogon::Task<std::vector<domain::TutorialSummary>> InMemoryCatalogRepository::search(
    std::string query, const std::size_t limit) const {
  const auto normalized_query = normalize(query);
  std::vector<domain::TutorialSummary> matches;
  matches.reserve(std::min(limit, tutorials_.size()));
  for (const auto& tutorial : tutorials_) {
    const bool text_match = contains_normalized(tutorial.title, normalized_query) ||
                            contains_normalized(tutorial.description, normalized_query) ||
                            std::ranges::any_of(tutorial.search_terms, [&](const auto& term) {
                              return contains_normalized(term, normalized_query);
                            });
    if (text_match) {
      matches.push_back(tutorial);
      if (matches.size() == limit) {
        break;
      }
    }
  }
  co_return matches;
}

}  // namespace guido::infrastructure
