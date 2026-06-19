import { EyeIcon } from "@zenncore/icons";
import { Button } from "@zenncore/mobile/components/button";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useResolveClassNames } from "uniwind";
import { CustomDrawer } from "@/components/custom-drawer";
import { DrawerTest } from "@/components/drawer-test";

// const StyledSafeAreaView = withUniwind(SafeAreaView);

export default () => {
  const headerStyle = useResolveClassNames("bg-blue-500");

  console.log("headerStyle", headerStyle);

  return (
    <View className="gap-8 bg-red-500 pt-safe">
      <Button>
        <EyeIcon className="pointer-events-none size-12 bg-blue-500 fill-red-500" />
        <Text className="text-center text-2xl">Hello</Text>
      </Button>
      <Link href={"/chat"}>Chat</Link>
      <View
        data-hello="world"
        // data-test="123"
        className="bg-green-500 p-4 data-[test=123]:data-[hello=world]:bg-yellow-500"
      >
        <Text>Hello</Text>
      </View>
      {/* <DrawerTest /> */}
      <CustomDrawer />
    </View>
  );
};
