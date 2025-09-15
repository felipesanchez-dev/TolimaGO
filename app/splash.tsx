import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 2,
      tension: 80,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      router.replace("/auth/login");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [bounceAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/tolimago.png")}
        style={[
          styles.logo,
          {
            transform: [
              {
                scale: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9f8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
});
