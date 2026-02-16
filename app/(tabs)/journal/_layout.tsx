import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.cream },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Journal" }} />
      <Stack.Screen name="create" options={{ title: "New Entry", presentation: "modal" }} />
      <Stack.Screen name="[id]" options={{ title: "Entry" }} />
      <Stack.Screen name="community" options={{ title: "Community Stories" }} />
      <Stack.Screen name="shared-story" options={{ title: "Story" }} />
    </Stack>
  );
}
