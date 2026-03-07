import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { ArrowLeft, User, Mail, Phone, Camera, Save, Scale, Banknote, TrendingUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCurrency } from '../context/CurrencyContext';

export const ProfileSettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { currencySymbol } = useCurrency();

  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [profileImage, setProfileImage] = useState(profile.profileImage || '');
  const [findeksScore, setFindeksScore] = useState(profile.findeksScore?.toString() || '');
  const [salary, setSalary] = useState(profile.salary?.toString() || '');
  const [additionalIncome, setAdditionalIncome] = useState(profile.additionalIncome?.toString() || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      name !== (profile.name || '') ||
      email !== (profile.email || '') ||
      phone !== (profile.phone || '') ||
      profileImage !== (profile.profileImage || '') ||
      (findeksScore ? Number(findeksScore) : undefined) !== profile.findeksScore ||
      (salary ? Number(salary) : undefined) !== profile.salary ||
      (additionalIncome ? Number(additionalIncome) : undefined) !== profile.additionalIncome;
    setHasChanges(changed);
  }, [name, email, phone, profileImage, findeksScore, salary, additionalIncome, profile]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.', [{ text: 'Tamam' }], 'warning');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gereklidir.', [{ text: 'Tamam' }], 'warning');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleImageOptions = () => {
    showAlert(
      'Profil Fotoğrafı',
      'Nasıl bir fotoğraf eklemek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: handlePickImage },
        { text: 'Kamera', onPress: handleTakePhoto },
      ],
      'info'
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profileImage,
        findeksScore: findeksScore ? Number(findeksScore) : undefined,
        salary: salary ? Number(salary) : undefined,
        additionalIncome: additionalIncome ? Number(additionalIncome) : undefined,
      });
      showAlert('Başarılı', 'Profil bilgileriniz güncellendi.', [{ text: 'Tamam' }], 'success');
      setHasChanges(false);
    } catch (error) {
      showAlert('Hata', 'Profil güncellenirken bir hata oluştu.', [{ text: 'Tamam' }], 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header with Dashboard Style Gradient - Edge to Edge */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={['#FF0080', '#7928CA', '#0070F3', '#00DFD8']}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.decorativePattern}>
            <View style={styles.patternCircle1} />
            <View style={styles.patternCircle2} />
            <View style={styles.patternCircle3} />
          </View>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.backButtonCircle}>
                <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.subtitle}>Kullanıcı</Text>
              <Text style={styles.screenTitle}>Profil Ayarları</Text>
            </View>
            <View style={styles.headerIcon}>
              <User size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleImageOptions} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.purple.primary + '20' }]}>
                <User size={60} color={colors.purple.primary} strokeWidth={2} />
              </View>
            )}
            <View style={[styles.cameraButton, { backgroundColor: colors.purple.primary }]}>
              <Camera size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.imageHint, { color: colors.text.tertiary }]}>
            Profil fotoğrafınızı değiştirmek için dokunun
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>İsim</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <User size={20} color={colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={name}
                onChangeText={setName}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          {/* Email - Artık Düzenlenebilir */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>E-posta</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Mail size={20} color={colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Telefon</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Phone size={20} color={colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+90 555 123 45 67"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Findeks Score */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Findeks Puanı</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Scale size={20} color={colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={findeksScore}
                onChangeText={setFindeksScore}
                placeholder="Findeks kredi notunuz"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Salary */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Maaş</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Banknote size={20} color={colors.text.tertiary} strokeWidth={2} />
              <Text style={[styles.currencySymbolText, { color: colors.text.primary }]}>{currencySymbol}</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={salary}
                onChangeText={setSalary}
                placeholder="Aylık net maaşınız"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Additional Income */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Ek Gelir</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <TrendingUp size={20} color={colors.text.tertiary} strokeWidth={2} />
              <Text style={[styles.currencySymbolText, { color: colors.text.primary }]}>{currencySymbol}</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                value={additionalIncome}
                onChangeText={setAdditionalIncome}
                placeholder="Aylık ek gelirleriniz"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveButtonContainer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Alert */}
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  modernHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#7928CA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  headerGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -50,
    left: -40,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 50,
    left: '40%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  imageHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    gap: 20,
    paddingBottom: 150,
  },
  section: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  labelHint: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '600',
  },
  currencySymbolText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.1)',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
