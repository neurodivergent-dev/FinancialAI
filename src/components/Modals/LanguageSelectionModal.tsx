import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Check, Globe } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelect: (languageCode: string) => void;
}

const LANGUAGES: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  onClose,
  currentLanguage,
  onSelect,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const handleSelect = (languageCode: string) => {
    onSelect(languageCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Globe size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {t('settings.language')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: colors.text.tertiary }]}>
            {t('settings.selectLanguage')}
          </Text>

          <View style={styles.languageList}>
            {LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    {
                      backgroundColor: isSelected 
                        ? (isDarkMode ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.08)')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                      borderColor: isSelected ? colors.purple.primary : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(lang.code)}
                >
                  <View style={styles.languageInfo}>
                    <View style={[
                      styles.langBadge, 
                      { backgroundColor: isSelected ? colors.purple.primary : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') }
                    ]}>
                      <Text style={[
                        styles.langBadgeText, 
                        { color: isSelected ? '#FFFFFF' : colors.text.secondary }
                      ]}>
                        {lang.code.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.languageNames}>
                      <Text style={[styles.nativeName, { color: colors.text.primary }]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.englishName, { color: colors.text.tertiary }]}>
                        {lang.name}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.purple.primary }]}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    marginLeft: 52,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  langBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  languageNames: {
    gap: 2,
  },
  nativeName: {
    fontSize: 17,
    fontWeight: '700',
  },
  englishName: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
