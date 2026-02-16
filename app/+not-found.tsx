import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This page doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
    backgroundColor: Colors.cream,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    fontWeight: "600" as const,
  },
});
