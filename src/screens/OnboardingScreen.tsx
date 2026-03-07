import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../theme/colors';
import {
  Wallet,
  TrendingUp,
  Brain,
  Target,
  Shield,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  icon: any;
  title: string;
  description: string;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: Wallet,
    title: 'Finansal Özgürlüğe Hoş Geldiniz',
    description: 'Tüm varlıklarınızı, borçlarınızı ve alacaklarınızı tek bir yerden yönetin. Akıllı finansal asistanınız ile tanışın.',
    gradient: gradients.purple,
  },
  {
    id: 2,
    icon: TrendingUp,
    title: 'Gelişmiş Finansal Takip',
    description: 'Net değerinizi, güvenli harcama limitinizi ve finansal sağlığınızı anlık olarak görün. Grafiklerle durumunuzu analiz edin.',
    gradient: ['#10B981', '#059669', '#047857'],
  },
  {
    id: 3,
    icon: Brain,
    title: 'AI Destekli CFO Analizi',
    description: 'Gemini AI ile kişiselleştirilmiş finansal öneriler alın. Riskleri tespit edin, stratejiler geliştirin.',
    gradient: ['#F59E0B', '#F97316', '#EA580C'],
  },
  {
    id: 4,
    icon: Target,
    title: 'Akıllı Hedef Yönetimi',
    description: 'Finansal hedeflerinizi belirleyin, ilerleyişinizi takip edin. Her küçük adımda başarınızı kutlayın.',
    gradient: ['#06B6D4', '#0891B2', '#0E7490'],
  },
  {
    id: 5,
    icon: Shield,
    title: 'Güvenli ve Gizli',
    description: 'Verileriniz cihazınızda güvenle saklanır. İstediğiniz zaman yedekleyin, geri yükleyin.',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  },
];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      animateTransition(() => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: SCREEN_WIDTH * nextIndex,
          animated: true,
        });
      });
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition(() => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        scrollViewRef.current?.scrollTo({
          x: SCREEN_WIDTH * prevIndex,
          animated: true,
        });
      });
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      if (onComplete) {
        onComplete();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      if (onComplete) {
        onComplete();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.purple.primary }]}>Financial AI</Text>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.text.secondary }]}>Atla</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Animated.View
              style={[
                styles.slideContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Icon with Gradient Background */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={currentSlide.gradient}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {React.createElement(slide.icon, {
                    size: 80,
                    color: '#FFFFFF',
                    strokeWidth: 2,
                  })}
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {slide.title}
              </Text>

              {/* Description */}
              <Text style={[styles.description, { color: colors.text.secondary }]}>
                {slide.description}
              </Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? colors.purple.primary
                    : colors.border.secondary,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={handlePrev}
            style={[styles.navButton, { backgroundColor: colors.cardBackground, borderColor: colors.border.secondary }]}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
        >
          <LinearGradient
            colors={currentSlide.gradient}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {currentIndex === slides.length - 1 ? (
              <Text style={styles.nextButtonText}>Başla</Text>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Devam</Text>
                <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 48,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
    lineHeight: 40,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
    letterSpacing: 0.2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  nextButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
