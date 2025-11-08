# Shancrys BIM - Mobile App 🏗️

Aplicativo móvel da plataforma Shancrys BIM para gestão de projetos de construção civil com visualização BIM.

## 📱 Tecnologias

- **React Native** com **Expo**
- **TypeScript**
- **Expo Router** (navegação baseada em arquivos)
- **Zustand** (state management)
- **Axios** (cliente HTTP)
- **Expo Secure Store** (armazenamento seguro)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go app (para testar no celular)
- Emulador Android/iOS (opcional)

### Instalação

1. Clone o repositório e navegue até a pasta mobile
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

4. Inicie o servidor de desenvolvimento:

```bash
npm start
```

## 📂 Estrutura do Projeto Implementada

shancrys-mobile/
├── app/                        # Expo Router (navegação baseada em arquivos)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── projects/
│   │   │   ├── index.tsx       # Lista de projetos
│   │   │   ├── [id].tsx        # Detalhes do projeto
│   │   │   └── viewer/
│   │   │       └── [modelId].tsx  # Visualizador 3D
│   │   ├── schedule/
│   │   │   ├── index.tsx       # Cronograma 4D
│   │   │   └── gantt.tsx
│   │   ├── materials/
│   │   │   └── index.tsx       # Catálogo de materiais
│   │   └── profile/
│   │       └── index.tsx
│   └──_layout.tsx
├── src/
│   ├── components/
│   │   ├── BIMViewer/
│   │   │   ├── IFCLoader.tsx
│   │   │   ├── Scene3D.tsx
│   │   │   └── Controls.tsx
│   │   ├── ProjectCard/
│   │   ├── MaterialItem/
│   │   └── GanttChart/
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── materials.ts
│   │   │   └── client.ts       # Axios instance com interceptors
│   │   ├── storage/
│   │   │   └── secure-storage.ts  # JWT tokens
│   │   ├── offline/
│   │   │   └── realm-db.ts
│   │   └── realtime/
│   │       └── signalr-hub.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useMaterials.ts
│   │   └── useRealtime.ts
│   ├── store/
│   │   └── zustand/            # State management
│   │       ├── authStore.ts
│   │       ├── projectsStore.ts
│   │       └── offlineStore.ts
│   └── types/
│       ├── api.types.ts
│       └── entities.ts         # TypeScript interfaces (gerados do C#)
├── assets/
│   ├── fonts/
│   ├── images/
│   └── lottie/                 # Animações
├── app.json
├── package.json
└── tsconfig.json
🎨 UI/UX Recommendations

1. Design System

# Opção 1: NativeWind (Tailwind para RN)

npm install nativewind
npm install --dev tailwindcss

# Opção 2: Tamagui (performance máxima)

npm install tamagui @tamagui/config

# Opção 3: React Native Paper (Material Design)

npm install react-native-paper
Recomendo: NativeWind + Expo (flexibilidade + produtividade)

2. Componentes Específicos BIM
// Example: BIM Viewer Component
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

export function BIMViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas camera={{ position: [10, 10, 10] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <IFCModel url={modelUrl} />
      <OrbitControls />
    </Canvas>
  );
}
🔐 Integração com Backend
API Client Example
// src/services/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: '<http://localhost:5000/api>',
  timeout: 10000,
});

// Interceptor para JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        // Refresh token logic
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        await SecureStore.setItemAsync('jwt_token', data.token);
        error.config.headers.Authorization = `Bearer ${data.token}`;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
// src/services/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: '<http://localhost:5000/api>',
  timeout: 10000,
});

// Interceptor para JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        // Refresh token logic
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        await SecureStore.setItemAsync('jwt_token', data.token);
        error.config.headers.Authorization = `Bearer ${data.token}`;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
📦 Package.json Essencial
{
  "dependencies": {
    "expo": "~50.0.0",
    "react-native": "0.73.0",

    // Navegação
    "expo-router": "^3.4.0",
    
    // UI
    "nativewind": "^4.0.0",
    "react-native-reanimated": "~3.6.0",
    
    // 3D/BIM
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "three": "^0.160.0",
    
    // Backend Integration
    "axios": "^1.6.5",
    "@microsoft/signalr": "^8.0.0",
    "expo-secure-store": "~12.8.1",
    
    // Offline
    "@realm/react": "^0.6.1",
    
    // Utils
    "expo-document-picker": "~11.10.0",
    "expo-file-system": "~16.0.6",
    "expo-camera": "~14.1.0",
    "react-native-maps": "1.10.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0",
    
    // State
    "zustand": "^4.5.0"
  }
}
🚀 Quick Start

# 1. Criar projeto

npx create-expo-app mobile -t expo-template-blank-typescript

cd shancrys-mobile

# 2. Instalar dependências essenciais

npx expo install expo-router react-native-safe-area-context \
  react-native-screens expo-linking expo-constants expo-status-bar

npx expo install axios expo-secure-store @microsoft/signalr

# 3. Configurar NativeWind

npm install nativewind
npm install --dev tailwindcss

npx tailwindcss init

# 4. Instalar 3D (quando necessário)

npm install three @react-three/fiber @react-three/drei

# 5. Rodar

npx expo start
