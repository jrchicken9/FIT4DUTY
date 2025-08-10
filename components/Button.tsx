import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import Colors from "@/constants/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testId?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
};

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  testId,
  icon,
  iconPosition = "left",
}: ButtonProps) => {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};

    // Variant styles
    switch (variant) {
      case "primary":
        buttonStyle = {
          backgroundColor: disabled ? Colors.gray[300] : Colors.primary,
        };
        break;
      case "secondary":
        buttonStyle = {
          backgroundColor: disabled ? Colors.gray[200] : Colors.secondary,
        };
        break;
      case "outline":
        buttonStyle = {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: disabled ? Colors.gray[300] : Colors.primary,
        };
        break;
      case "text":
        buttonStyle = {
          backgroundColor: "transparent",
        };
        break;
    }

    // Size styles
    switch (size) {
      case "small":
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
        break;
      case "medium":
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
        break;
      case "large":
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
        };
        break;
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyleObj: TextStyle = {};

    // Variant text styles
    switch (variant) {
      case "primary":
      case "secondary":
        textStyleObj = {
          color: Colors.white,
        };
        break;
      case "outline":
      case "text":
        textStyleObj = {
          color: disabled ? Colors.gray[400] : Colors.primary,
        };
        break;
    }

    // Size text styles
    switch (size) {
      case "small":
        textStyleObj = {
          ...textStyleObj,
          fontSize: 14,
        };
        break;
      case "medium":
        textStyleObj = {
          ...textStyleObj,
          fontSize: 16,
        };
        break;
      case "large":
        textStyleObj = {
          ...textStyleObj,
          fontSize: 18,
        };
        break;
    }

    return textStyleObj;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testId}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? Colors.white
              : Colors.primary
          }
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;