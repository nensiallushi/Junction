import {
  composePlugins,
  withTurborepo,
  withZenncoreIcon,
} from "@zenncore/mobile/config/metro";
import { getDefaultConfig } from "expo/metro-config";
import { withUniwindConfig } from "uniwind/metro";

const config = getDefaultConfig(__dirname);

const withZenncore = composePlugins(
  (config) => withTurborepo(config, __dirname),
  (config) => withZenncoreIcon(config),
  (config) =>
    //@ts-expect-error
    withUniwindConfig(config, {
      cssEntryFile: "./src/globals.css",
      dtsFile: "./declarations/uniwind.d.ts",
    }),
);

export default withZenncore(config);
