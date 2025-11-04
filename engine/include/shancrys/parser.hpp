#pragma once

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <nlohmann/json.hpp>

namespace shancrys {

using json = nlohmann::json;

enum class FileFormat {
    IFC,
    DGN,
    RVT,
    Unknown
};

enum class Discipline {
    Architecture,
    Structure,
    Electrical,
    Plumbing,
    HVAC,
    Unknown
};

struct Element {
    std::string id;
    std::string guid;
    Discipline discipline;
    std::string type;
    double volumeEstimated;
    double costEstimated;
    json attributes;
    
    // Geometry reference (simplified for MVP)
    std::string geometryRef;
};

struct ModelMetadata {
    std::string fileHash;
    FileFormat format;
    size_t totalElements;
    std::unordered_map<Discipline, size_t> elementsByDiscipline;
    std::string originalFileName;
};

class BIMParser {
public:
    virtual ~BIMParser() = default;
    
    virtual bool parse(const std::string& filePath) = 0;
    virtual ModelMetadata getMetadata() const = 0;
    virtual std::vector<Element> getElements() const = 0;
    virtual json exportToJson() const = 0;
};

class IFCParser : public BIMParser {
public:
    IFCParser();
    ~IFCParser() override;
    
    bool parse(const std::string& filePath) override;
    ModelMetadata getMetadata() const override;
    std::vector<Element> getElements() const override;
    json exportToJson() const override;

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};

class ParserFactory {
public:
    static std::unique_ptr<BIMParser> create(FileFormat format);
    static FileFormat detectFormat(const std::string& filePath);
};

} // namespace shancrys
