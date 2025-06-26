import React from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
  GestureResponderEvent
} from 'react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/store/ThemeContext';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  onPress,
  ...props
}: ButtonProps) {
  const { hapticFeedback } = useSettingsStore();
  const { theme } = useTheme();

  const handlePress = (event: GestureResponderEvent) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const getContainerStyle = () => {
    const styles = [
      baseStyles.container,
      size === 'small' && baseStyles.containerSmall,
      size === 'large' && baseStyles.containerLarge,
      {
        backgroundColor: variant === 'primary' ? theme.primary :
                        variant === 'secondary' ? theme.secondary :
                        'transparent'
      },
      variant === 'outline' && { borderWidth: 1, borderColor: theme.primary },
      (disabled || isLoading) && baseStyles.containerDisabled,
      style,
    ];
    return styles;
  };

  const getTextStyle = () => {
    const styles = [
      baseStyles.text,
      size === 'small' && baseStyles.textSmall,
      size === 'large' && baseStyles.textLarge,
      {
        color: variant === 'outline' || variant === 'ghost' ? theme.primary : theme.text
      },
      (disabled || isLoading) && { color: theme.textSecondary },
      textStyle,
    ];
    return styles;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        ...getContainerStyle(),
        pressed && baseStyles.pressed,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.primary : theme.text} />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  containerSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  containerLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
});