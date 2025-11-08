#include "shancrys/parser.hpp"
#include <iostream>
#include <fstream>

using namespace shancrys;

void printUsage() {
    std::cout << "Shancrys Engine CLI\n";
    std::cout << "Usage: shancrys_cli <command> [options]\n\n";
    std::cout << "Commands:\n";
    std::cout << "  parse <file>     Parse BIM file and output metadata\n";
    std::cout << "  help             Show this help\n";
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printUsage();
        return 1;
    }
    
    std::string command = argv[1];
    
    if (command == "help") {
        printUsage();
        return 0;
    }
    
    if (command == "parse") {
        if (argc < 3) {
            std::cerr << "Error: missing file path\n";
            return 1;
        }
        
        std::string filePath = argv[2];
        
        try {
            auto format = ParserFactory::detectFormat(filePath);
            auto parser = ParserFactory::create(format);
            
            std::cout << "Parsing " << filePath << "...\n";
            
            if (parser->parse(filePath)) {
                auto metadata = parser->getMetadata();
                std::cout << "Parse successful!\n";
                std::cout << "Total elements: " << metadata.totalElements << "\n";
                
                // Export to JSON
                auto jsonOutput = parser->exportToJson();
                std::string outputPath = filePath + ".json";
                
                std::ofstream outFile(outputPath);
                outFile << jsonOutput.dump(2);
                
                std::cout << "Output written to: " << outputPath << "\n";
            } else {
                std::cerr << "Parse failed\n";
                return 1;
            }
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << "\n";
            return 1;
        }
        
        return 0;
    }
    
    std::cerr << "Unknown command: " << command << "\n";
    printUsage();
    return 1;
}
