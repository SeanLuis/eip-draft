#!/bin/bash

# Crear directorios principales
mkdir -p resource-manager-dapp/{contracts,scripts,test,frontend}
mkdir -p resource-manager-dapp/frontend/{src,public}
mkdir -p resource-manager-dapp/frontend/src/{components,contracts,hooks,utils}

# Crear archivos de contratos
touch resource-manager-dapp/contracts/{IResourceManager.sol,ResourceManager.sol,ResourceMetrics.sol}

# Crear archivos de scripts
touch resource-manager-dapp/scripts/{deploy.ts,verify.ts}

# Crear archivos de test
touch resource-manager-dapp/test/ResourceManager.test.ts

# Crear archivos de configuración
touch resource-manager-dapp/{.env.example,.gitignore,hardhat.config.ts,package.json}
touch resource-manager-dapp/frontend/{index.html,package.json,tsconfig.json,vite.config.ts}

# Crear archivos del frontend
touch resource-manager-dapp/frontend/src/{App.vue,main.ts,vite-env.d.ts}

# Imprimir mensaje de finalización
echo "Estructura de directorios y archivos creada en './resource-manager-dapp'"
echo "Puede proceder con la inicialización del proyecto según sus necesidades"