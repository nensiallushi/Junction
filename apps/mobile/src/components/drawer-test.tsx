import { CheckIcon, ChevronRightIcon, EyeIcon } from "@zenncore/icons";
import { Button } from "@zenncore/mobile/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHandle,
  DrawerTrigger,
} from "@zenncore/mobile/components/drawer";
import { Text } from "@zenncore/mobile/components/text";
import { View } from "react-native";

export const DrawerTest = () => {
  return (
    <Drawer dynamicSnapPoint scaleRoot={false} overDragResistanceFactor={30}>
      <DrawerTrigger>
        <View className={"flex-row items-center gap-2"}>
          <EyeIcon className="size-12 text-primary" />
          <View className="flex-1">
            <Text className="font-medium text-foreground text-xl">
              100 Euro(s)
            </Text>
            <Text className="-mt-1 font-body text-foreground-dimmed text-lg">
              Payment Method in hand (venue)
            </Text>
          </View>
          <ChevronRightIcon className="size-10 text-foreground-dimmed" />
        </View>
      </DrawerTrigger>
      <DrawerContent
        className="bg-transparent px-2"
        classList={{ content: "pb-2" }}
      >
        <View className="flex flex-col gap-2 rounded-t-4xl rounded-b-device bg-background px-4 pb-safe">
          <DrawerHandle className={"pb-2"} />
          <Text className="mb-2 font-body font-medium text-4xl text-primary">
            Payment Method
          </Text>
          {/* <Button
            // variant="default"
            // color="background"
            className="flex-row items-center gap-2"
          >
            <EyeIcon className="size-10 text-primary" />
            <Text className="flex-1 font-medium text-primary text-xl">
              By Cash (Venue)
            </Text>
            <View className="ml-auto size-10 rounded-full bg-primary/20 p-1">
              <CheckIcon className="size-8 text-primary" />
            </View>
          </Button> */}
          {/* <Button
            // variant="default"
            // color="background"
            className="flex-row items-center gap-2"
          >
            <EyeIcon className="size-10 text-primary" />
            <Text className="flex-1 font-medium text-primary text-xl">
              By Card (Online)
            </Text>
            <View className="ml-auto size-10 rounded-full bg-primary/20 p-1">
              <CheckIcon className="size-8 text-primary" />
            </View>
          </Button> */}
        </View>
      </DrawerContent>
    </Drawer>
  );
};
