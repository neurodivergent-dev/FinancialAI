import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  type?: 'info' | 'success' | 'error' | 'warning';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  type = 'info',
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color="#22c55e" strokeWidth={2} />;
      case 'error':
        return <XCircle size={48} color="#ff4757" strokeWidth={2} />;
      case 'warning':
        return <AlertCircle size={48} color="#f59e0b" strokeWidth={2} />;
      default:
        return <Info size={48} color={colors.purple.primary} strokeWidth={2} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: colors.cardBackground }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isDestructive
                        ? 'rgba(255, 71, 87, 0.15)'
                        : isCancel
                        ? colors.background
                        : 'rgba(147, 51, 234, 0.15)',
                      borderColor: isDestructive
                        ? colors.error
                        : isCancel
                        ? colors.border.secondary
                        : colors.purple.primary,
                    },
                  ]}
                  onPress={button.onPress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: isDestructive
                          ? colors.error
                          : isCancel
                          ? colors.text.secondary
                          : colors.purple.primary,
                        fontWeight: isCancel ? '600' : '700',
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
