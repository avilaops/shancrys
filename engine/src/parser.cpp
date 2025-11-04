#include "shancrys/parser.hpp"
#include <fstream>
#include <filesystem>
#include <stdexcept>

namespace shancrys {

// IFCParser Implementation (stub for now)
class IFCParser::Impl {
public:
    ModelMetadata metadata;
    std::vector<Element> elements;
    
    bool parse(const std::string& filePath) {
        // TODO: Integrate ifcopenshell
        // For now, basic validation only
        
        if (!std::filesystem::exists(filePath)) {
            throw std::runtime_error("File not found: " + filePath);
        }
        
        // Placeholder: read file and extract basic info
        std::ifstream file(filePath);
        if (!file.is_open()) {
            return false;
        }
        
        metadata.format = FileFormat::IFC;
        metadata.originalFileName = std::filesystem::path(filePath).filename().string();
        
        // TODO: Actual IFC parsing
        // - Use ifcopenshell to open model
        // - Extract IfcProduct entities
        // - Extract geometry (simplified mesh)
        // - Extract properties
        // - Classify by discipline
        
        return true;
    }
};

IFCParser::IFCParser() : pImpl(std::make_unique<Impl>()) {}
IFCParser::~IFCParser() = default;

bool IFCParser::parse(const std::string& filePath) {
    return pImpl->parse(filePath);
}

ModelMetadata IFCParser::getMetadata() const {
    return pImpl->metadata;
}

std::vector<Element> IFCParser::getElements() const {
    return pImpl->elements;
}

json IFCParser::exportToJson() const {
    json output;
    
    output["metadata"] = {
        {"fileHash", pImpl->metadata.fileHash},
        {"format", "IFC"},
        {"totalElements", pImpl->metadata.totalElements},
        {"originalFileName", pImpl->metadata.originalFileName}
    };
    
    json elementsJson = json::array();
    for (const auto& elem : pImpl->elements) {
        elementsJson.push_back({
            {"id", elem.id},
            {"guid", elem.guid},
            {"type", elem.type},
            {"volumeEstimated", elem.volumeEstimated},
            {"costEstimated", elem.costEstimated},
            {"attributes", elem.attributes}
        });
    }
    
    output["elements"] = elementsJson;
    return output;
}

// Factory
std::unique_ptr<BIMParser> ParserFactory::create(FileFormat format) {
    switch (format) {
        case FileFormat::IFC:
            return std::make_unique<IFCParser>();
        case FileFormat::DGN:
            // TODO: Implement DGNParser with Bentley SDK
            throw std::runtime_error("DGN parser not yet implemented");
        default:
            throw std::runtime_error("Unsupported format");
    }
}

FileFormat ParserFactory::detectFormat(const std::string& filePath) {
    std::filesystem::path path(filePath);
    auto ext = path.extension().string();
    
    if (ext == ".ifc" || ext == ".IFC") return FileFormat::IFC;
    if (ext == ".dgn" || ext == ".DGN") return FileFormat::DGN;
    if (ext == ".rvt" || ext == ".RVT") return FileFormat::RVT;
    
    return FileFormat::Unknown;
}

} // namespace shancrys
