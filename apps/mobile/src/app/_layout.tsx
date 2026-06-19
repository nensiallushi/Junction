import { UIProvider } from "@zenncore/mobile/components/ui-provider";
import { Stack } from "expo-router";
import "../globals.css";

export default () => {
  return (
    <UIProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UIProvider>
  );
};
