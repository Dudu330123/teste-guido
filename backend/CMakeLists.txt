cmake_minimum_required(VERSION 3.24)

project(guido_backend VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(GUIDO_ENABLE_SANITIZERS "Enable AddressSanitizer and UndefinedBehaviorSanitizer" OFF)

# O Drogon distribuído pelo Ubuntu declara o cliente MySQL como dependência
# transitiva, mas seu FindMySQL não procura o nome `mysqlclient` fornecido pela
# própria distribuição. Detectamos esse nome antes para que uma configuração
# CMake limpa funcione sem parâmetros específicos da máquina. O Guido continua
# usando somente PostgreSQL; nenhuma conexão MySQL é criada pela aplicação.
find_library(GUIDO_DROGON_MYSQL_COMPAT_LIBRARY NAMES mysqlclient)
if(GUIDO_DROGON_MYSQL_COMPAT_LIBRARY AND NOT MYSQL_LIBRARIES)
  set(MYSQL_LIBRARIES "${GUIDO_DROGON_MYSQL_COMPAT_LIBRARY}" CACHE FILEPATH
      "Compatibility library required by Ubuntu's Drogon package")
endif()

find_package(Drogon CONFIG REQUIRED)

add_library(guido_core
  src/application/catalog_service.cc
  src/http/api_controller.cc
  src/http/json_response.cc
  src/infrastructure/in_memory_catalog_repository.cc
  src/infrastructure/postgres_catalog_repository.cc
  src/progress/postgres_progress_repository.cc
  src/progress/progress_service.cc
)

target_include_directories(guido_core PUBLIC include)
target_link_libraries(guido_core PUBLIC Drogon::Drogon)
target_compile_options(guido_core PRIVATE -Wall -Wextra -Wpedantic -Wconversion -Wshadow)

if(GUIDO_ENABLE_SANITIZERS AND CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(guido_core PUBLIC -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(guido_core PUBLIC -fsanitize=address,undefined)
endif()

add_executable(guido_api src/main.cc)
target_link_libraries(guido_api PRIVATE guido_core)
target_compile_options(guido_api PRIVATE -Wall -Wextra -Wpedantic -Wconversion -Wshadow)

include(CTest)
if(BUILD_TESTING)
  add_executable(guido_core_tests tests/catalog_service_test.cc)
  target_link_libraries(guido_core_tests PRIVATE guido_core)
  target_compile_options(guido_core_tests PRIVATE -Wall -Wextra -Wpedantic -Wconversion -Wshadow)
  add_test(NAME guido_core_tests COMMAND guido_core_tests)

  add_executable(guido_postgres_tests tests/postgres_integration_test.cc)
  target_link_libraries(guido_postgres_tests PRIVATE guido_core)
  target_compile_options(guido_postgres_tests PRIVATE -Wall -Wextra -Wpedantic -Wconversion -Wshadow)
  add_test(NAME guido_postgres_tests COMMAND guido_postgres_tests)
  set_tests_properties(guido_postgres_tests PROPERTIES SKIP_RETURN_CODE 77)
endif()
