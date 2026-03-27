import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/colors";

export default function ResourcesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Resources" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
