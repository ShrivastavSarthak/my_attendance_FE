import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginCompo() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        },
      );

      const result = await response.json();

      console.log("Login response:", result);

      if (!response.ok) {
        throw new Error(
          result?.detail || result?.message || "Invalid email or password",
        );
      }

      // =========================
      // SAVE USER DATA
      // =========================

      await AsyncStorage.setItem("user", JSON.stringify(result.user));

      // =========================
      // SAVE AUTH TOKEN
      // =========================

      await AsyncStorage.setItem("token", result.token);

      console.log("User saved:", result.user);
      console.log("Token saved");

      Toast.show({
        type: "success",
        text1: "Login successful",
        text2: "Welcome back!",
        position: "top",
      });

      setTimeout(() => {
        router.replace("/face_reg/faceReg");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-4">
      {/* =========================
          EMAIL
      ========================== */}

      <View className="w-full">
        <Text className="text-lg font-bold text-[#6C7278]">Email</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                errors.email ? "border-red-500" : "border-[#EDF1F3]"
              }`}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          )}
        />

        {errors.email && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </Text>
        )}
      </View>

      {/* =========================
          PASSWORD
      ========================== */}

      <View className="w-full">
        <Text className="text-lg font-bold text-[#6C7278]">Password</Text>

        <View
          className={`flex-row items-center rounded-md border-[1.5px] ${
            errors.password ? "border-red-500" : "border-[#EDF1F3]"
          }`}
        >
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="flex-1 px-4 py-3 text-sm"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            )}
          />

          <Pressable
            className="px-4"
            onPress={() => setShowPassword((previous) => !previous)}
            disabled={loading}
          >
            <Text className="font-semibold text-[#1D61E7]">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {errors.password && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </Text>
        )}
      </View>

      {/* =========================
          LOGIN BUTTON
      ========================== */}

      <Pressable
        className={`mt-6 w-full items-center justify-center rounded-md bg-[#1D61E7] ${
          loading ? "opacity-60" : ""
        }`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <View className="flex-row items-center py-4">
            <ActivityIndicator size="small" color="#FFFFFF" />

            <Text className="ml-2 text-sm font-semibold text-white">
              Logging in...
            </Text>
          </View>
        ) : (
          <Text className="py-4 text-sm font-semibold text-white">Login</Text>
        )}
      </Pressable>
    </View>
  );
}
