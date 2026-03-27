import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/colors";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="check-in" options={{ title: "Daily Check-in" }} />
      <Stack.Screen name="breathing" options={{ title: "Calm & Ground" }} />
      <Stack.Screen name="milestones" options={{ title: "Milestones" }} />
      <Stack.Screen name="favorites" options={{ title: "Saved" }} />
      <Stack.Screen name="emergency" options={{ title: "Get Help Now" }} />
      <Stack.Screen name="night-content" options={{ title: "Quiet Hours" }} />
    </Stack>
  );
}
