import { KeyboardChatLegendList } from "@legendapp/list/keyboard-chat";
import { cn } from "@zenncore/utils";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import {
  KeyboardGestureArea,
  KeyboardProvider,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useAnimatedScrollHandler } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timeStamp: number;
};

let idCounter = 0;
const MS_PER_SECOND = 1000;

const defaultChatMessages: Message[] = [
  {
    id: String(idCounter++),
    sender: "user",
    text: "Hi, I have a question about your product",
    timeStamp: Date.now() - MS_PER_SECOND * 5,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "Hello there! How can I assist you today?",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "user",
    text: "I'm looking for information about pricing plans",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "We offer several pricing tiers based on your needs",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "Our basic plan starts at $9.99 per month",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "user",
    text: "Do you offer any discounts for annual billing?",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "Yes! You can save 20% with our annual billing option",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "user",
    text: "That sounds great. What features are included?",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "The basic plan includes all core features plus 10GB storage",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "Premium plans include priority support and additional tools",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "user",
    text: "I think the basic plan would work for my needs",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "Perfect! I can help you get set up with that",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "user",
    text: "Thanks for your help so far",
    timeStamp: Date.now() - MS_PER_SECOND * 4,
  },
  {
    id: String(idCounter++),
    sender: "bot",
    text: "You're welcome! Is there anything else I can assist with today?",
    timeStamp: Date.now() - MS_PER_SECOND * 3,
  },
];

const ChatMessage = ({ item }: { item: Message }) => {
  return (
    <>
      <View
        className={cn(
          "max-w-3/4 rounded-[16px] p-4",
          item.sender === "bot" ? "bg-[#f1f1f1]" : "self-end bg-[#007AFF]",
        )}
      >
        <Text
          className={cn("text-[16px]", item.sender === "user" && "text-white")}
        >
          {item.text}
        </Text>
      </View>
      <View
        className={cn("my-1.5 max-w-3/4", item.sender === "user" && "self-end")}
      >
        <Text className="text-[#888] text-[12px]">
          {new Date(item.timeStamp).toLocaleTimeString()}
        </Text>
      </View>
    </>
  );
};

export default () => {
  const [messages, setMessages] = useState<Message[]>(defaultChatMessages);
  const [inputText, setInputText] = useState("");
  const insets = useSafeAreaInsets();

  const sendMessage = () => {
    const text = inputText || "Empty message";
    if (text.trim()) {
      setMessages((messagesNew) => [
        ...messagesNew,
        {
          id: String(idCounter++),
          sender: "user",
          text: text,
          timeStamp: Date.now(),
        },
      ]);
      setInputText("");
      setTimeout(() => {
        setMessages((messagesNew) => [
          ...messagesNew,
          {
            id: String(idCounter++),
            sender: "bot",
            text: `Answer: ${text.toUpperCase()}`,
            timeStamp: Date.now(),
          },
        ]);
      }, 300);
    }
  };

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (_event) => {},
  });

  const toolbarHeight = 60;
  const toolbarKeyboardAdditionalOffset = 5;
  const toolbarKeyboardOffset = insets.bottom - toolbarKeyboardAdditionalOffset;
  const listAdditionalOffset = 10;

  return (
    <KeyboardProvider>
      <KeyboardGestureArea
        interpolator="ios"
        offset={toolbarHeight + toolbarKeyboardOffset}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "white",
        }}
      >
        <KeyboardChatLegendList
          // alignItemsAtEnd
          data={messages}
          estimatedItemSize={80}
          initialScrollAtEnd
          renderItem={ChatMessage}
          keyboardDismissMode="interactive"
          keyExtractor={(item) => item.id}
          maintainScrollAtEnd={{ animated: true }}
          maintainVisibleContentPosition
          offset={toolbarKeyboardOffset}
          className="flex-1"
          //TODO: vertical padding only work reliably when using contentContainerStyle
          // contentContainerClassName="pb-safe-offset-10 pt-safe-offset-10 px-4"
          contentContainerClassName="px-4"
          contentContainerStyle={{
            paddingBottom: insets.bottom + toolbarHeight + listAdditionalOffset,
            paddingTop: insets.top + 10,
          }}
          onScroll={handleScroll}
        />
        <KeyboardStickyView
          offset={{
            opened: toolbarKeyboardOffset,
          }}
          className="absolute bottom-safe z-10 w-full"
        >
          <View className="mx-4 flex-row items-center rounded-2xl border border-[#ccc] bg-white p-3">
            <TextInput
              value={inputText}
              placeholder="Type a message"
              className="mr-3 flex-1 rounded-md border border-[#ccc] p-3"
              onChangeText={setInputText}
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        </KeyboardStickyView>
      </KeyboardGestureArea>
    </KeyboardProvider>
  );
};
