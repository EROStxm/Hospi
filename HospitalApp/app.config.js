// app.config.js
export default {
  expo: {
    name: "Hospital Militar",
    slug: "hospital-militar",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hospital.militar"
    },
    android: {
      package: "com.hospital.militar",
      permissions: [
        "android.permission.USE_BIOMETRIC",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    plugins: [
      "expo-local-authentication"
    ],
    extra: {
      eas: {
        projectId: "94bcd7c0-4340-48fa-905d-8a4517d66edd"
      }
    }
  }
};