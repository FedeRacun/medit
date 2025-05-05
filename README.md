# 🎬 M E D I T - Media Editor Tracker (V0.2)

**medit** is a command-line tool (CLI) for version-controlling multimedia projects. It currently only supports **Premiere Pro** and **Google Drive**. It's designed for small teams that need to track changes, sync files, and work in an organized way without relying on systems like Git.

---

## 🚀 Installation

### Requirements

- PowerShell (pre-installed on Windows) or any Terminal on macOS 
- [Bun](https://bun.sh) (installed in step 1)

### Steps

1. Install **Bun**,open any terminal and paste:
- Windows:

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
- macOS
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Download and unzip the `medit-master.zip` file [(click here)](https://github.com/FedeRacun/medit/archive/refs/heads/master.zip).

3. Open the unzipped folder, right-click on the background, and choose **"Open in Terminal"**. Or navigate through the console if you don't see this option.

4. Install project dependencies:

   ```bash
   bun install
   ```

5. Register the command globally:

   ```bash
   bun link
   ```

 ✅ You should see: `Success! Registered "medit"`


 ⚠️ If you are a Mac user, you may need to restart your computer for the changes to take effect.

---

## 🛠️ Basic Usage

1. Open a terminal inside the folder where your `.prproj` file is located.

2. Initialize the project:

   ```bash
   medit init
   ```

3. Log in with your Google account:

   ```bash
   medit login
   ```

4. Sync your files with the cloud:

   ```bash
   medit sync
   ```

   > 🎉 Done! Your project is now synced and tracked.

---

## 📁 Project Structure

```bash
medit/
├── auth/                  # Authentication and Google Drive connection
│   ├── drive.ts
│   ├── google-oauth.json
│   └── login.ts
├── bin/                   # CLI entry point
│   └── medit.ts
├── commands/              # CLI available commands
│   ├── init.ts
│   ├── login.ts
│   ├── scan.ts
│   ├── sync.ts
│   └── user.ts
├── core/                  # Core project logic
│   ├── config.ts
│   ├── manifest.ts
│   ├── prprojParser.ts
│   └── sync.ts
├── utils/                 # General utilities
│   ├── findFileRecursively.ts
│   └── getUser.ts
├── bun.lock
├── bun.lockb
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✨ Upcoming Features

- `.prproj` version comparison
- Visual change history
- Integration with Photoshop and After Effects
- Browser-based visualization

---

## 🤝 Contribute

This project is under development. If you have ideas or want to join, feel free to reach out!

---
