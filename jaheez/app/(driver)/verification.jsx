import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import styles from '../../styles/driver/verification.styles';
import { COLORS } from '../../constants/constants';
import useLogin from '../../driverHooks/useLogin';
import { LinearGradient } from 'expo-linear-gradient';

const DriverVerification = () => {
  const driver = useSelector((state) => state.driverController.driver);
  const router = useRouter();
  const { submitDriverVerification, isVerificationLoading } = useLogin();

  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [carImageBase64, setCarImageBase64] = useState('');
  const [carImagePreview, setCarImagePreview] = useState('');


  const status = driver?.verificationStatus || 'didnt-apply';
  const statusValue = useMemo(() => ({
    'didnt-apply': 'غير موثق',
    pending: 'قيد المراجعة',
    rejected: 'مرفوض',
    approved: 'موثق',
  }[status] || 'غير موثق'), [status]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const imageString = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : '';
      if (imageString) {
        setCarImageBase64(imageString);
        setCarImagePreview(asset.uri);
      }
    }
  };

  const handleSubmit = async () => {
    const success = await submitDriverVerification({
      carPlate: plate.trim(),
      carImageBase64,
      vechicleType: vehicleType,
      vechicleModel: vehicleModel.trim(),
    });

    if (success) {
      setCarImageBase64('');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={styles.page}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, styles.contentSpacer]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color={COLORS.primary} />
          <Text style={styles.backText}>الرجوع</Text>
        </TouchableOpacity>
        <View style={styles.statusBar}>
          <Text style={styles.statusTitle}>حالة الحساب</Text>
          <Text style={styles.statusValue}>{statusValue}</Text>
        </View>
        {status === 'pending' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoTitle}>طلبك قيد المراجعة</Text>
            <Text style={styles.infoBody}>يستغرق التوثيق عادةً حتى 24 ساعة. سنعلمك فور الانتهاء.</Text>
          </View>
        )}
        <View style={styles.uploadCard}>
          <View style={styles.uploadHeader}>
            <Text style={styles.uploadLabel}>صورة المركبة</Text>
            {status === 'rejected' && <Text style={styles.reuploadHint}>يجب إعادة الرفع لإعادة التقديم</Text>}
          </View>
          <TouchableOpacity style={styles.uploadButton} activeOpacity={0.85} onPress={pickImage}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color={styles.uploadButtonText.color} />
            <Text style={styles.uploadButtonText}>ارفع الصورة هنا</Text>
          </TouchableOpacity>
          {carImagePreview ? (
            <Image source={{ uri: carImagePreview }} style={styles.previewImage} />
          ) : (
            <Text style={styles.helperText}>الصورة مطلوبة لبدء المراجعة</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>رقم اللوحة</Text>
          <TextInput
            style={styles.textInput}
            placeholder="5-2000000"
            placeholderTextColor="#c0c0c0"
            value={plate}
            onChangeText={setPlate}
            textAlign="right"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>نوع المركبة الخاص بك</Text>
          <View style={styles.vehicleOptionsRow}>
            {[
              {
                label: 'ساحبة',
                value: 'ساحبة',
                activeIcon: require('../../assets/icons/active-sa7eba.png'),
                inactiveIcon: require('../../assets/icons/inactive-sa7eba.png'),
              },
              {
                label: 'رافعة',
                value: 'رافعة',
                activeIcon: require('../../assets/icons/active-rafe3a.png'),
                inactiveIcon: require('../../assets/icons/inactive-rafe3a.png'),
              },
            ].map((option) => {
              const isActive = vehicleType === option.value;
              const CardContainer = isActive ? LinearGradient : View;
              const containerProps = isActive
                ? { colors: ['#ff7a1a', '#ff4d2e'], start: { x: 0, y: 0 }, end: { x: 1, y: 0 } }
                : {};

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                  activeOpacity={0.9}
                  onPress={() => setVehicleType(option.value)}
                >
                  <CardContainer style={[styles.vehicleCardInner, isActive && styles.vehicleCardInnerActive]} {...containerProps}>
                    <Image
                      source={isActive ? option.activeIcon : option.inactiveIcon}
                      style={styles.vehicleIcon}
                      resizeMode="contain"
                    />
                    <Text style={[styles.vehicleLabel, isActive && styles.vehicleLabelActive]}>{option.label}</Text>
                  </CardContainer>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>موديل المركبة</Text>
          <TextInput
            style={styles.textInput}
            placeholder="موديل المركبة"
            placeholderTextColor="#c0c0c0"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            textAlign="right"
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity style={[styles.submitButton, isVerificationLoading && styles.submitButtonDisabled]} activeOpacity={0.9} onPress={handleSubmit} disabled={isVerificationLoading}>
          {isVerificationLoading ? <ActivityIndicator color={COLORS.whiteTextColor} /> : <Text style={styles.submitText}>إرسال للمراجعة</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DriverVerification;
