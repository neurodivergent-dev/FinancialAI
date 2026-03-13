import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemeSelectionCard = () => {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, colors, isDarkMode } = useTheme();

  const themeOptions = [
    { mode: 'light', label: t('settings.themeSelection.light'), icon: Sun },
    { mode: 'dark', label: t('settings.themeSelection.dark'), icon: Moon },
    { mode: 'system', label: t('settings.themeSelection.system'), icon: Smartphone },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{t('settings.themeSelection.title')}</Text>
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => {
          const isActive = themeMode === option.mode;
          const Icon = option.icon;

          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.optionCard,
                { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: isActive ? colors.purple.primary : 'transparent',
                  borderWidth: 2,
                },
                isActive && { backgroundColor: colors.purple.primary + '15' }
              ]}
              onPress={() => setThemeMode(option.mode)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconCircle, 
                { backgroundColor: isActive ? colors.purple.primary : 'rgba(150, 150, 150, 0.1)' }
              ]}>
                <Icon 
                  size={20} 
                  color={isActive ? '#FFFFFF' : colors.text.tertiary} 
                  strokeWidth={2.5}
                />
              </View>
              <Text style={[
                styles.optionText, 
                { color: isActive ? colors.purple.primary : colors.text.secondary },
                isActive && { fontWeight: '700' }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
