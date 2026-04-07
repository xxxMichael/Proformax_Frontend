# Proformax Frontend

Aplicacion SPA en React + Vite para la interfaz del sistema Proformax.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalacion

1. Instalar dependencias:

npm install

2. (Opcional) Crear archivo de entorno local para configurar la API:

Archivo sugerido: .env.local

Variable sugerida:

VITE_API_URL=http://localhost:3000/api/v1

Si no defines esta variable, usa la URL por defecto que tenga configurada el proyecto.

## Scripts disponibles

- npm run dev: inicia frontend en desarrollo
- npm run build: genera build de produccion
- npm run preview: sirve build localmente
- npm run lint: ejecuta ESLint
- npm test: ejecuta pruebas con Vitest

## Ejecucion local

1. Modo desarrollo:

npm run dev

2. Abrir en navegador:

http://localhost:5173


## Estructura principal

- src/App.jsx: pantalla principal
- src/main.jsx: punto de entrada React
- src/index.css: estilos globales minimos

## Build de produccion

npm run build

El resultado se genera en la carpeta dist.


