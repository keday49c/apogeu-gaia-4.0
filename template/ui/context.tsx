import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Platform, Alert, Modal, View, Text, TouchableOpacity, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { AlertButton, AlertState } from './types';
import { colors, typography, spacing } from '@/constants/theme';

// Context type definition
interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

// Create Context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// AlertProvider - unified platform handling
interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AlertButton[]
    ) => {
      const normalizedMessage = message || '';
      const normalizedButtons = buttons?.length ? buttons : [{ 
        text: 'OK',
        onPress: () => {}
      }];

      if (Platform.OS === 'web') {
        setAlertState({
          visible: true,
          title,
          message: normalizedMessage,
          buttons: normalizedButtons
        });
      } else {
        const alertButtons = normalizedButtons.map(button => ({
          text: button.text,
          onPress: button.onPress,
          style: button.style
        }));
        
        Alert.alert(title, normalizedMessage, alertButtons);
      }
    },
    []
  );

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleButtonPress = useCallback((button: AlertButton) => {
    try {
      if (typeof button.onPress === 'function') {
        button.onPress();
      }
      hideAlert();
    } catch (error) {
      console.warn('[Template:AlertProvider] Button press error:', error);
      hideAlert();
    }
  }, [hideAlert]);

  const contextValue = React.useMemo(() => ({
    showAlert
  }), [showAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {Platform.OS === 'web' && (
        <WebAlertModal
          alertState={alertState}
          onButtonPress={handleButtonPress}
          onHide={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlertContext(): AlertContextType {
  const context = useContext(AlertContext);
  
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  
  return context;
}

interface WebAlertModalProps {
  alertState: AlertState;
  onButtonPress: (button: AlertButton) => void;
  onHide: () => void;
}

function WebAlertModal({ alertState, onButtonPress, onHide }: WebAlertModalProps) {
  if (!alertState.visible) {
    return null;
  }

  const getButtonStyle = useCallback((button: AlertButton, index: number): ViewStyle[] => {
    const isLast = index === alertState.buttons.length - 1;
    const baseStyle: ViewStyle[] = [styles.button];
    
    if (alertState.buttons.length > 1 && !isLast) {
      baseStyle.push(styles.buttonWithBorder);
    }
    
    return baseStyle;
  }, [alertState.buttons]);

  const getButtonTextStyle = useCallback((button: AlertButton): TextStyle => {
    switch (button.style) {
      case 'cancel':
        return styles.cancelButtonText;
      case 'destructive':
        return styles.destructiveButtonText;
      default:
        return styles.defaultButtonText;
    }
  }, []);

  return (
    <Modal visible={alertState.visible} transparent animationType="fade" onRequestClose={onHide}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{alertState.title}</Text>
            {alertState.message ? (
              <Text style={styles.message}>{alertState.message}</Text>
            ) : null}
          </View>
          
          <View style={styles.buttonContainer}>
            {alertState.buttons.length === 1 ? (
              <TouchableOpacity 
                style={[styles.button, styles.singleButton]}
                onPress={() => onButtonPress(alertState.buttons[0])}
                activeOpacity={0.8}
              >
                <Text style={getButtonTextStyle(alertState.buttons[0])}>
                  {alertState.buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.multiButtonContainer}>
                {alertState.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(button, index)}
                    onPress={() => onButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={getButtonTextStyle(button)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    minWidth: 280,
    maxWidth: 420,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },
  multiButtonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    flex: 1,
    backgroundColor: 'transparent',
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  buttonWithBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border.light,
  },
  defaultButtonText: {
    ...typography.button,
    color: colors.action.primary,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.action.primary,
    fontWeight: Platform.OS === 'ios' ? '400' : '400',
  },
  destructiveButtonText: {
    ...typography.button,
    color: colors.action.danger,
  },
});

