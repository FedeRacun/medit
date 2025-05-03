# 🎬 M E D I T - Media Editor Tracker

**medit** es una herramienta de línea de comandos (CLI) para controlar versiones de proyectos multimedia. Actualmente solo soporta trabajar con **Premiere Pro** y **Google Drive**. Está pensada para equipos pequeños que necesitan rastrear cambios, sincronizar archivos y trabajar de forma organizada sin depender de sistemas como Git.

---

## 🚀 Instalación

### Requisitos

- PowerShell (preinstalado en Windows)
- [Bun](https://bun.sh) (se instala en el paso 1)

### Pasos

1. Instalar **Bun** ejecutando en PowerShell:

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. Descargar y descomprimir el archivo `medit-master.zip`.

3. Abrir la carpeta descomprimida, hacer clic derecho sobre el fondo y elegir **"Abrir en Terminal"**.

4. Instalar dependencias del proyecto:

   ```bash
   bun install
   ```

5. Registrar el comando globalmente:

   ```bash
   bun link
   ```

   > ✅ Deberías ver: `Success! Registered "medit"`

---

## 🛠️ Uso Básico

1. Abrí una terminal dentro de la carpeta donde esté tu archivo `.prproj`.

2. Inicializá el proyecto:

   ```bash
   medit init
   ```

3. Iniciá sesión con tu cuenta de Google:

   ```bash
   medit login
   ```

4. Sincronizá los archivos con tu nube:

   ```bash
   medit sync
   ```

   > 🎉 ¡Listo! Tu proyecto está sincronizado y rastreado.

---

## 📁 Estructura del Proyecto

``` bash
medit/
├── auth/                  # Autenticación y conexión con Google Drive
│   ├── drive.ts
│   ├── google-oauth.json
│   └── login.ts
├── bin/                   # Entry point del CLI
│   └── medit.ts
├── commands/              # Comandos disponibles en el CLI
│   ├── init.ts
│   ├── login.ts
│   ├── scan.ts
│   ├── sync.ts
│   └── user.ts
├── core/                  # Lógica principal del proyecto
│   ├── config.ts
│   ├── manifest.ts
│   ├── prprojParser.ts
│   └── sync.ts
├── utils/                 # Utilidades generales
│   ├── findFileRecursively.ts
│   └── getUser.ts
├── bun.lock
├── bun.lockb
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✨ Próximas Funcionalidades

- Comparación de versiones de proyectos `.prproj`
- Historial visual de cambios
- Integración con Photoshop y After Effects
- Visualización en navegador

---

## 🤝 Contribuir

Este proyecto está en desarrollo. Si tenés ideas o querés sumarte, ¡contactanos!

---
