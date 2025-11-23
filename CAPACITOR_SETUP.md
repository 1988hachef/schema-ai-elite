# Capacitor Android APK Setup Guide

This guide will help you generate a real Android APK for **HACHEF SCHÉMA ÉLECTRIQUE AI PRO**.

## Prerequisites

- Node.js and npm installed
- Android Studio installed
- Git installed

## Setup Steps

### 1. Export to GitHub

Click the "Export to GitHub" button in Lovable to transfer your project to your GitHub repository.

### 2. Clone and Install

```bash
git clone <your-github-url>
cd <your-project-name>
npm install
```

### 3. Initialize Capacitor (Already Done)

The Capacitor configuration is already set up in `capacitor.config.ts`. The app is configured as:
- **App ID**: app.lovable.db024d82319f432c9f61d1cbf4a1bf2e
- **App Name**: HACHEF SCHÉMA ÉLECTRIQUE AI PRO

### 4. Build the Web App

```bash
npm run build
```

### 5. Add Android Platform

```bash
npx cap add android
```

### 6. Sync the Project

```bash
npx cap sync android
```

### 7. Open in Android Studio

```bash
npx cap open android
```

This will open the project in Android Studio.

### 8. Configure for Production

In Android Studio:

1. **Change Package Name** (if needed):
   - Go to `app/build.gradle`
   - Find `applicationId` and ensure it matches your desired package name

2. **Update App Name**:
   - Go to `app/src/main/res/values/strings.xml`
   - Confirm the app_name is: HACHEF SCHÉMA ÉLECTRIQUE AI PRO

3. **Add App Icon** (optional):
   - Place your icon files in `app/src/main/res/mipmap-*` folders
   - Use Android Studio's Image Asset tool (right-click res → New → Image Asset)

4. **Sign the APK**:
   - Go to Build → Generate Signed Bundle / APK
   - Choose APK
   - Create a new keystore or use an existing one
   - Fill in the keystore details (keep this safe!)

### 9. Build APK

In Android Studio:
- Build → Generate Signed Bundle / APK → APK
- Select your keystore
- Choose "release" build variant
- Click Finish

Your APK will be generated in: `app/release/app-release.apk`

## Important Notes

- **Server URL**: The app is currently configured to connect to the Lovable project URL for development. For production, you should:
  1. Deploy your app
  2. Update the `server.url` in `capacitor.config.ts` to your production URL
  3. Or remove the server configuration to use the bundled files

- **Permissions**: Camera and file access permissions are automatically handled by Capacitor

- **Testing**: Test the APK on a real Android device before distribution

## Production Deployment

For production:

1. Remove or update the server URL in `capacitor.config.ts`:
```typescript
// Remove these lines for production:
server: {
  url: 'https://...',
  cleartext: true
}
```

2. Rebuild and sync:
```bash
npm run build
npx cap sync android
```

3. Generate signed APK in Android Studio

## Distribution

- Share the APK directly
- Or publish to Google Play Store (requires Google Play Developer account)

## Troubleshooting

- If you encounter build errors, run: `npx cap sync android --force`
- Make sure Android SDK is properly installed
- Check that all dependencies are installed: `npm install`

---

Developed by **HACHEF OUSSAMA**
