import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";

const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),

  username: yup
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),

  age: yup
    .number()
    .typeError("Age must be a number")
    .integer("Age must be a whole number")
    .min(5, "Age must be at least 5")
    .max(100, "Please enter a valid age")
    .required("Age is required"),

  class_name: yup.string().trim().required("Class is required"),

  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),

  school_id: yup.string().trim().required("School ID is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

type SignupFormData = yup.InferType<typeof signupSchema>;

export default function SignupCompo() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      age: undefined,
      class_name: "",
      email: "",
      school_id: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            username: data.username,
            age: data.age,
            class_name: data.class_name,
            email: data.email,
            school_id: data.school_id,
            password: data.password,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.detail || result?.message || "Registration failed",
        );
      }
      Toast.show({
        type: "success",
        text1: "Registration successful",
        text2: "Your account has been created.",
      });
      setTimeout(() => {
        router.push("/face_reg/faceReg");
      }, 800);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-4">
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">Name</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                  errors.name ? "border-red-500" : "border-[#EDF1F3]"
                }`}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your name"
                autoCapitalize="words"
                editable={!loading}
              />
            )}
          />

          {errors.name && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Username */}
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">Username</Text>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                  errors.username ? "border-red-500" : "border-[#EDF1F3]"
                }`}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            )}
          />

          {errors.username && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </Text>
          )}
        </View>

        {/* Age */}
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">Age</Text>

          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                  errors.age ? "border-red-500" : "border-[#EDF1F3]"
                }`}
                value={value?.toString() ?? ""}
                onChangeText={(text) =>
                  onChange(text === "" ? undefined : Number(text))
                }
                onBlur={onBlur}
                placeholder="Enter your age"
                keyboardType="numeric"
                editable={!loading}
              />
            )}
          />

          {errors.age && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.age.message}
            </Text>
          )}
        </View>

        {/* Class */}
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">Class</Text>

          <Controller
            control={control}
            name="class_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                  errors.class_name ? "border-red-500" : "border-[#EDF1F3]"
                }`}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your class"
                editable={!loading}
              />
            )}
          />

          {errors.class_name && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.class_name.message}
            </Text>
          )}
        </View>

        {/* Email */}
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

        {/* School ID */}
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">School ID</Text>

          <Controller
            control={control}
            name="school_id"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full rounded-md border-[1.5px] px-4 py-3 text-sm ${
                  errors.school_id ? "border-red-500" : "border-[#EDF1F3]"
                }`}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter school ID"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            )}
          />

          {errors.school_id && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.school_id.message}
            </Text>
          )}
        </View>

        {/* Password */}
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
              onPress={() => setShowPassword((prev) => !prev)}
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

        {/* Confirm Password */}
        <View className="w-full">
          <Text className="text-lg font-bold text-[#6C7278]">
            Confirm Password
          </Text>

          <View
            className={`flex-row items-center rounded-md border-[1.5px] ${
              errors.confirmPassword ? "border-red-500" : "border-[#EDF1F3]"
            }`}
          >
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="flex-1 px-4 py-3 text-sm"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              )}
            />

            <Pressable
              className="px-4"
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              disabled={loading}
            >
              <Text className="font-semibold text-[#1D61E7]">
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          {errors.confirmPassword && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        {/* Register */}
        <Pressable
          className={`mt-6 w-full items-center justify-center rounded-md bg-[#1D61E7] ${
            loading ? "opacity-60" : ""
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text className="py-4 text-sm font-semibold text-white">
            {loading ? "Creating account..." : "Register"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
