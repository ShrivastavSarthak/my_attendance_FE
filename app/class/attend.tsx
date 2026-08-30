import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Attend() {
  const [permission, requestPermission] = useCameraPermissions();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>("front");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const openCamera = async () => {
    if (!permission) return;

    if (!permission.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Toast.show({
          type: "error",
          text1: "Camera permission required",
          text2: "Please allow camera access to mark attendance.",
          position: "top",
        });

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
        setImageUri(photo.uri);
        setCameraVisible(false);
      }
    } catch (error) {
      console.error("Failed to capture image:", error);

      Toast.show({
        type: "error",
        text1: "Camera error",
        text2: "Unable to capture the photo. Please try again.",
        position: "top",
      });
    }
  };

  const sendImage = async () => {
    if (!imageUri) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: "attendance.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/face/mark`,
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

      // Reset state
      setImageUri(null);
      setCameraVisible(false);
      setCameraReady(false);
      setFacing("front");

      Toast.show({
        type: "success",
        text1: "Attendance marked!",
        text2:
          data?.message || "Your attendance has been recorded successfully.",
        position: "top",
      });

      console.log("Attendance response:", data);
    } catch (error) {
      console.error("Attendance upload failed:", error);

      Toast.show({
        type: "error",
        text1: "Attendance failed",
        text2:
          error instanceof Error
            ? error.message
            : "Unable to mark attendance. Please try again.",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />

        <Text className="mt-3 text-gray-500">
          Checking camera permission...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}

      <View className="px-6 pb-6 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-2xl text-gray-700">‹</Text>
        </Pressable>

        <Text className="text-3xl font-bold text-gray-900">
          Mark Attendance
        </Text>

        <Text className="mt-2 text-base leading-6 text-gray-500">
          Take a clear photo of your face to mark your attendance.
        </Text>
      </View>

      {/* CONTENT */}

      <View className="flex-1 items-center px-6 pt-6">
        {/* PHOTO PREVIEW */}

        <View className="mb-8 h-72 w-72 overflow-hidden rounded-3xl bg-gray-200">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white">
                <Text className="text-3xl">📷</Text>
              </View>

              <Text className="text-center text-base font-semibold text-gray-600">
                No photo captured
              </Text>

              <Text className="mt-1 text-center text-sm text-gray-400">
                Your photo will appear here
              </Text>
            </View>
          )}
        </View>

        {/* CAMERA BUTTON */}

        <Pressable
          onPress={openCamera}
          disabled={loading}
          className="w-full rounded-2xl bg-white p-5"
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-xl">📷</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {imageUri ? "Retake Photo" : "Take Photo"}
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Make sure your face is clearly visible
              </Text>
            </View>

            <Text className="text-2xl text-gray-400">›</Text>
          </View>
        </Pressable>

        {/* SEND BUTTON */}

        {imageUri && (
          <Pressable
            onPress={sendImage}
            disabled={loading}
            className={`mt-5 w-full rounded-2xl bg-[#1D61E7] ${
              loading ? "opacity-60" : ""
            }`}
          >
            {loading ? (
              <View className="flex-row items-center justify-center py-4">
                <ActivityIndicator color="white" />

                <Text className="ml-2 text-base font-bold text-white">
                  Marking Attendance...
                </Text>
              </View>
            ) : (
              <Text className="py-4 text-center text-base font-bold text-white">
                Mark Attendance
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* CAMERA MODAL */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View className="flex-1 bg-black">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            onCameraReady={() => setCameraReady(true)}
            onMountError={(error) => {
              console.log("Camera mount error:", error);
            }}
          />

          {/* CLOSE */}

          <Pressable
            onPress={() => setCameraVisible(false)}
            className="absolute right-5 top-12 h-11 w-11 items-center justify-center rounded-full bg-black/60"
          >
            <Text className="text-xl text-white">✕</Text>
          </Pressable>

          {/* FLIP */}

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
              className={`h-20 w-20 items-center justify-center rounded-full bg-white ${
                !cameraReady ? "opacity-50" : ""
              }`}
            >
              <View className="h-16 w-16 rounded-full border-4 border-gray-400" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
