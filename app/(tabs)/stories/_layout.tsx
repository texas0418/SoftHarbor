import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/colors";

export default function StoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Stories" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
      <Stack.Screen name="community" options={{ title: "Community Wall" }} />
    </Stack>
  );
}
