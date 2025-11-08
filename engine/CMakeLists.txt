cmake_minimum_required(VERSION 3.20)
project(ShancrysEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Options
option(BUILD_TESTS "Build test suite" ON)
option(BUILD_WASM "Build WebAssembly bindings" OFF)

# Dependencies
find_package(nlohmann_json 3.11 REQUIRED)

# IfcOpenShell (add as external dependency or submodule)
# For now, assume installed or will be added later
# find_package(IfcOpenShell REQUIRED)

# Sources
file(GLOB_RECURSE SOURCES 
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

file(GLOB_RECURSE HEADERS 
    "${CMAKE_CURRENT_SOURCE_DIR}/include/*.h"
    "${CMAKE_CURRENT_SOURCE_DIR}/include/*.hpp"
)

# Library
add_library(shancrys_engine STATIC ${SOURCES} ${HEADERS})

target_include_directories(shancrys_engine
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(shancrys_engine
    PUBLIC
        nlohmann_json::nlohmann_json
    # PRIVATE
        # IfcOpenShell::IfcOpenShell
)

# CLI tool
add_executable(shancrys_cli src/cli/main.cpp)
target_link_libraries(shancrys_cli PRIVATE shancrys_engine)

# Tests
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Install
install(TARGETS shancrys_engine shancrys_cli
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY include/ DESTINATION include)
