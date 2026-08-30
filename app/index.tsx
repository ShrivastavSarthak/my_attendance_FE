import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const handleLogin = () => {
    router.push("/(auth)/auth");
  };

  const handleMarkAttendance = () => {
    router.push("/class/attend");
  };

  return (
    <View className="flex-1 items-center justify-center bg-blue-500 px-6">
      <Text className="mb-3 text-3xl font-bold text-white">Welcome</Text>

      <Text className="mb-12 text-center text-base text-white/80">
        Choose an option to continue
      </Text>

      <View className="w-full gap-4">
        {/* LOGIN */}

        <Pressable
          onPress={handleLogin}
          className="w-full rounded-xl bg-white py-4"
        >
          <Text className="text-center text-lg font-bold text-blue-500">
            Login
          </Text>
        </Pressable>

        {/* MARK ATTENDANCE */}

        <Pressable
          onPress={handleMarkAttendance}
          className="w-full rounded-xl border-2 border-white py-4"
        >
          <Text className="text-center text-lg font-bold text-white">
            Mark Attendance
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
