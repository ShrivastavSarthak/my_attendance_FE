import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function FaceReg() {
  const [permission, requestPermission] = useCameraPermissions();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>("front");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<{
    id: number;
    email: string;
    is_face_added: boolean;
    name: string;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("user");

        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          setUserData(user);
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
      }
    };

    getUserData();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(["user", "token"]);

    router.replace("/auth");
  };

  const openCamera = async () => {
    if (!permission) return;

    if (!permission.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        console.log("Camera permission denied");
        return;
      }
    }

    setCameraReady(false);
    setCameraVisible(true);
  };

  const flipCamera = () => {
    setFacing((current) => (current === "front" ? "back" : "front"));
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (photo?.uri) {
        console.log("Captured image:", photo.uri);

        setImageUri(photo.uri);
        setCameraVisible(false);
      }
    } catch (error) {
      console.error("Failed to capture image:", error);
    }
  };

  const sendImage = async () => {
    if (!imageUri || !userData?.id) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: "face.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/face/register/${userData.id}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || `Upload failed: ${response.status}`,
        );
      }

      console.log("Server response:", data);

      // ========================================
      // UPDATE USER DATA
      // ========================================

      const updatedUserData = {
        ...userData,
        is_face_added: true,
      };

      // ========================================
      // UPDATE ASYNC STORAGE
      // ========================================

      await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));

      // ========================================
      // UPDATE USER STATE
      // ========================================

      setUserData(updatedUserData);

      // ========================================
      // RESET COMPONENT STATE
      // ========================================

      setImageUri(null);
      setCameraVisible(false);
      setCameraReady(false);
      setFacing("front");

      // ========================================
      // SUCCESS TOAST
      // ========================================

      Toast.show({
        type: "success",
        text1: "Face registered successfully",
        text2: "Your face has been added to your account.",
        position: "top",
      });

      console.log("Face registered successfully");
      console.log("Updated user:", updatedUserData);
    } catch (error) {
      console.error("Upload failed:", error);

      Toast.show({
        type: "error",
        text1: "Face registration failed",
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

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Checking camera permission...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* TOP BAR */}

      <View className="flex-row items-center justify-between px-6 pt-14">
        <Text className="text-xl font-bold">Face Registration</Text>

        <Pressable onPress={logout} className="rounded-lg bg-red-500 px-4 py-2">
          <Text className="font-semibold text-white">Logout</Text>
        </Pressable>
      </View>

      {/* CONTENT */}

      <View className="flex-1 items-center justify-center px-6">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="mb-6 h-64 w-64 rounded-2xl"
            resizeMode="cover"
          />
        ) : (
          <View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-gray-100">
            <Text className="text-gray-500">No photo captured</Text>
          </View>
        )}

        <Pressable
          onPress={openCamera}
          className="w-full rounded-2xl border border-gray-200 bg-white p-6"
        >
          <Text className="text-center text-xl font-bold">
            Register Your Face
          </Text>

          <Text className="mt-2 text-center text-gray-500">
            Tap here to open the camera
          </Text>
        </Pressable>

        {imageUri && (
          <Pressable
            onPress={sendImage}
            disabled={loading}
            className={`mt-5 w-full items-center justify-center rounded-xl bg-[#1D61E7] ${
              loading ? "opacity-60" : ""
            }`}
          >
            {loading ? (
              <View className="flex-row items-center py-4">
                <ActivityIndicator color="white" />

                <Text className="ml-2 text-base font-semibold text-white">
                  Sending...
                </Text>
              </View>
            ) : (
              <Text className="py-4 text-base font-semibold text-white">
                Send
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* CAMERA */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            onCameraReady={() => setCameraReady(true)}
            onMountError={(error) => {
              console.log("Camera mount error:", error);
            }}
          />

          <Pressable
            onPress={() => setCameraVisible(false)}
            className="absolute right-5 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/60"
          >
            <Text className="text-xl text-white">✕</Text>
          </Pressable>

          <Pressable
            onPress={flipCamera}
            className="absolute right-5 top-24 h-12 w-12 items-center justify-center rounded-full bg-black/60"
          >
            <Text className="text-2xl text-white">🔄</Text>
          </Pressable>

          <View className="absolute bottom-10 w-full items-center">
            <Pressable
              onPress={takePhoto}
              disabled={!cameraReady}
              className="h-20 w-20 items-center justify-center rounded-full bg-white"
            >
              <View className="h-16 w-16 rounded-full border-4 border-gray-400" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
