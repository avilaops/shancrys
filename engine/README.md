# Shancrys Engine (C++)

Motor nativo para parsing de modelos BIM e cálculos de simulação 4D.

## Funcionalidades

- Parse IFC (via ifcopenshell)
- Parse DGN (via Bentley MicroStation SDK - futuro)
- Extração de metadados e geometria
- Normalização e simplificação LOD
- Export JSON para consumo da API

## Dependências

- C++20 compiler (MSVC 19.30+, GCC 11+, Clang 14+)
- CMake 3.20+
- nlohmann/json
- ifcopenshell (a integrar)

## Build

### Windows

```powershell
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022"
cmake --build . --config Release
```

### Linux/macOS

```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

## Uso

```powershell
.\build\Release\shancrys_cli.exe parse modelo.ifc
```

Gera `modelo.ifc.json` com elementos normalizados.

## Estrutura

```
include/shancrys/  → Headers públicos
src/               → Implementação
src/cli/           → CLI tool
tests/             → Testes unitários
```

## Próximos Passos

- [ ] Integrar ifcopenshell real
- [ ] Implementar extração de geometria (mesh simplificada)
- [ ] Parser DGN (Bentley SDK)
- [ ] Indexação espacial (BVH)
- [ ] Bindings WebAssembly
