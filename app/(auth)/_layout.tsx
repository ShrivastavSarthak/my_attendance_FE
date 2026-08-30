import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type UserData = {
  id: number;
  name: string;
  email: string;
  is_face_added: boolean;
};

const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp <= currentTime;
  } catch {
    return true;
  }
};

export default function AuthLayout() {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState<
    "/face_reg/faceReg" | "/class/attend" | null
  >(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        // No token → stay on auth page
        if (!token) {
          setLoading(false);
          return;
        }

        // Token expired → remove session
        if (isTokenExpired(token)) {
          await AsyncStorage.multiRemove(["token", "user"]);

          setLoading(false);
          return;
        }
        setRedirect("/face_reg/faceReg");
      } catch (error) {
        console.error("Auth check failed:", error);

        await AsyncStorage.multiRemove(["token", "user"]);

        setRedirect(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Wait until AsyncStorage check finishes
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // User is already logged in
  if (redirect) {
    return <Redirect href={redirect} />;
  }

  // User is not logged in
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
