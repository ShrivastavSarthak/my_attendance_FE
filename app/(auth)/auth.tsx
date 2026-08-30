import LoginCompo from "@/components/authComponents/login";
import SignupCompo from "@/components/authComponents/signup";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);

  const handleSignupBtn = () => {
    setIsSignup(!isSignup);
  };
  return (
    <View className="h-full p-6 bg-white">
      <View className="w-full h-full">
        <View className="flex justify-start items-center">
          <Text className="text-[32px] font-bold">Get Started now</Text>
          <Text className="text-[12px] color-[#6C7278]">
            Create an account or log in to explore about our app
          </Text>
        </View>
        <View className="w-full bg-[#EFF0F6] flex-row rounded-md mt-5 p-2 gap-3 mb-6 ">
          <Pressable
            onPress={handleSignupBtn}
            className={`w-full ${isSignup && "bg-white"} rounded-md flex-1 justify-center items-center px-4 py-3`}
          >
            <Text
              className={`${isSignup ? "text-black" : "text-[#7D7D91]"} text-[14px] font-semibold`}
            >
              Sign Up
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSignupBtn}
            className={`w-full ${!isSignup && "bg-white"} rounded-md flex-1 justify-center items-center px-4 py-3`}
          >
            <Text
              className={`${!isSignup ? "text-black" : "text-[#7D7D91]"} text-[14px] font-semibold`}
            >
              Login Up
            </Text>
          </Pressable>
        </View>
        {isSignup ? <SignupCompo /> : <LoginCompo />}
      </View>
    </View>
  );
}
