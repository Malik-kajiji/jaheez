import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import DriverSideMenu from '../../driverComponents/DriverSideMenu';
import styles from '../../styles/driver/profile.styles';

const DriverProfile = () => {
  const driver = useSelector((state) => state.driverController.driver);
  const router = useRouter();

  const displayName = driver?.driverName || 'مالك محمد';
  const displayPhone = driver?.phoneNumber || '091-2345678';
  const numberOfTrips = driver?.numberOfTrips || 0;
  const warrnings = driver?.warrnings || 0;
  const isBanned = driver?.isBanned || false;
  const isVerified = driver?.isVerified || false;
  const verificationStatus = driver?.verificationStatus || 'didnt-apply';
  const verificationReason = driver?.verificationReason || '';
  const carPlate = driver?.carPlate || 'غير متوفر';
  const vechicleType = driver?.vechicleType || 'غير متوفر';
  const vechicleModel = driver?.vechicleModel || 'غير متوفر';
  const ratings = driver?.ratings ?? '—';

//   console.log('driver', driver);

  const statusLabel = {
    'didnt-apply': 'الحساب غير موثق',
    pending: 'قيد المراجعة',
    rejected: 'مرفوض',
    approved: 'موثق',
  }[verificationStatus] || 'الحساب غير موثق';

  const statusMessage = {
    'didnt-apply': 'يرجى استكمال التحقق لبدء استقبال الطلبات.',
    pending: 'طلب التوثيق قيد المراجعة، وقد يستغرق حتى 24 ساعة. سنعلمك فور الانتهاء.',
    rejected: 'تم رفض طلب التوثيق، يرجى إعادة الإرسال بعد تصحيح البيانات.',
    approved: '',
  }[verificationStatus] || '';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <DriverSideMenu />

      <View style={styles.avatarWrap}>
        <Image
          source={driver?.carImage ? { uri: driver.carImage } : require('../../assets/images/driver.png')}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.phone}>{displayPhone}</Text>

      <View style={[styles.statusBadge, verificationStatus === 'approved' && styles.statusBadgeApproved]}>
        <Text style={[styles.statusBadgeText, verificationStatus === 'approved' && styles.statusBadgeTextApproved]}>{statusLabel}</Text>
      </View>

      {verificationStatus !== 'approved' && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>التوثيق مطلوب</Text>
          <Text style={styles.warningText}>{statusMessage}</Text>
          {verificationStatus === 'rejected' && verificationReason ? (
            <Text style={styles.warningReason}>سبب الرفض: {verificationReason}</Text>
          ) : null}
          {verificationStatus !== 'pending' && (
            <TouchableOpacity
              style={styles.warningButton}
              activeOpacity={0.85}
              onPress={() => router.push('/(driver)/verification')}
            >
              <Text style={styles.warningButtonText}>
                {verificationStatus === 'rejected' ? 'إعادة التحقق' : 'إكمال التحقق'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>البيانات</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>رقم الهاتف</Text>
          <Text style={styles.dataValue}>{displayPhone}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>عدد الرحلات</Text>
          <Text style={styles.dataValue}>{numberOfTrips}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>عدد التحذيرات</Text>
          <Text style={styles.dataValue}>{warrnings}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>محظور</Text>
          <Text style={styles.dataValue}>{isBanned ? 'نعم' : 'لا'}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>رقم هاتف موثق</Text>
          <Text style={styles.dataValue}>{isVerified ? 'نعم' : 'لا'}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>التقييم</Text>
          <Text style={styles.dataValue}>{ratings}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات المركبة</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>نوع المركبة</Text>
          <Text style={styles.dataValue}>{vechicleType}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>موديل المركبة</Text>
          <Text style={styles.dataValue}>{vechicleModel}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>رقم اللوحة</Text>
          <Text style={styles.dataValue}>{carPlate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        <TouchableOpacity
          style={styles.listRow}
          activeOpacity={0.85}
          onPress={() => router.push('/(driver)/resetPassword')}
        >
          <View style={styles.rowRight}>
            <FontAwesome5 name="key" size={18} color={styles.iconColor} />
            <Text style={styles.rowText}>تغيير كلمة المرور</Text>
          </View>
          <FontAwesome5 name="chevron-left" size={16} color={styles.iconColor} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.supportButton}
        activeOpacity={0.9}
        onPress={() => router.replace('/(driver)/report')}
      >
        <Text style={styles.supportButtonText}>الاتصال بالدعم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DriverProfile;
