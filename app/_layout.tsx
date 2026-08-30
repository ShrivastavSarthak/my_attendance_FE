import "@/global.css";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast />
    </SafeAreaView>
  );
}
