import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  icon = null,
  style,
  textStyle,
  ...props
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    else if (size === 'large') baseStyle.push(styles.buttonLarge);
    else baseStyle.push(styles.buttonMedium);
    
    // Variant styles
    if (variant === 'primary') baseStyle.push(styles.buttonPrimary);
    else if (variant === 'secondary') baseStyle.push(styles.buttonSecondary);
    else if (variant === 'outline') baseStyle.push(styles.buttonOutline);
    else if (variant === 'danger') baseStyle.push(styles.buttonDanger);
    
    // State styles
    if (disabled || loading) baseStyle.push(styles.buttonDisabled);
    
    // Custom style
    if (style) baseStyle.push(style);
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Size styles
    if (size === 'small') baseStyle.push(styles.textSmall);
    else if (size === 'large') baseStyle.push(styles.textLarge);
    else baseStyle.push(styles.textMedium);
    
    // Variant styles
    if (variant === 'primary') baseStyle.push(styles.textPrimary);
    else if (variant === 'secondary') baseStyle.push(styles.textSecondary);
    else if (variant === 'outline') baseStyle.push(styles.textOutline);
    else if (variant === 'danger') baseStyle.push(styles.textDanger);
    
    // Custom text style
    if (textStyle) baseStyle.push(textStyle);
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (variant === 'outline') return '#de6b22';
    if (variant === 'secondary') return '#666';
    return '#fff';
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            color={getIconColor()} 
            size={size === 'small' ? 'small' : 'small'} 
          />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                color={getIconColor()}
                style={styles.icon}
              />
            )}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Size styles
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  
  // Variant styles
  buttonPrimary: {
    backgroundColor: '#de6b22',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#de6b22',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  
  // State styles
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Content wrapper
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Icon styles
  icon: {
    marginRight: 8,
  },
  
  // Text styles
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Text size styles
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  
  // Text variant styles
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#666',
  },
  textOutline: {
    color: '#de6b22',
  },
  textDanger: {
    color: '#fff',
  },
});