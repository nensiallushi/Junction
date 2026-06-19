import type { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.zennit.zenncore.dev";
  if (IS_PREVIEW) return "com.zennit.zenncore.preview";

  return "com.zennit.zenncore";
};

const getAppName = () => {
  if (IS_DEV) return "zenncore (Dev)";
  if (IS_PREVIEW) return "zenncore (Preview)";

  return "zenncore";
};

export default ({ config }: ConfigContext) =>
  ({
    ...config,
    name: getAppName(),
    slug: "zenncore",
    scheme: "zenncore",
    version: "0.1.0",
    owner: "zennit",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: getUniqueIdentifier(),
      supportsTablet: true,
      // icon: {
      //   light: "./assets/icon-light.png",
      //   dark: "./assets/icon-dark.png",
      // },
    },
    android: {
      package: getUniqueIdentifier(),
      adaptiveIcon: {
        //   foregroundImage: "./assets/icon-light.png",
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#1F104A",
      },
      // predictiveBackGestureEnabled: true,
    },
    // runtimeVersion: {
    //   policy: "appVersion",
    // },
    updates: {
      // url: "https://u.expo.dev/f54f90cd-bdf5-4f93-bcbd-615d7c7b2f13",
      enableBsdiffPatchSupport: true,
    },
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
      // reactCanary: true,
      reactCompiler: true,
      autolinkingModuleResolution: true,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FFFFFF",
          image: "./assets/images/icon.png",
          dark: {
            backgroundColor: "#E4E4E7",
            image: "./assets/images/icon.png",
          },
        },
      ],
    ],
    // extra: {
    //   eas: {
    //     projectId: "f54f90cd-bdf5-4f93-bcbd-615d7c7b2f13",
    //   },
    // },
  }) satisfies ExpoConfig;
