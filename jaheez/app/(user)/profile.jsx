import React from 'react';
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import SideMenu from '../../components/SideMenu';
import styles from '../../styles/user/profile.styles.js';

const Profile = () => {
  const user = useSelector((state) => state.userController.user);
  const router = useRouter();
  const displayName = user?.username || 'مالك محمد';
  const displayPhone = user?.phoneNumber || '091-2345678';
  const numberOfTrips = user?.numberOfTrips || 0;
  const warrnings = user?.warrnings || 0;
  const isBanned = user?.isBanned || false;
  const isVerified = user?.isVerified || false;
  // const displayPhone = user?.phoneNumber || '091-2345678';
  // const displayPhone = user?.phoneNumber || '091-2345678';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <SideMenu />

      <View style={styles.avatarWrap}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : require('../../assets/images/profile.png')}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>البيانات</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>
            رقم الهاتف
          </Text>
          <Text style={styles.dataValue}>{displayPhone}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>
            عدد الرحلات
          </Text>
          <Text style={styles.dataValue}>{numberOfTrips}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>
            عدد التحذيرات
          </Text>
          <Text style={styles.dataValue}>{warrnings}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>
            محظور
          </Text>
          <Text style={styles.dataValue}>{isBanned ? 'نعم' : 'لا'}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.dataLabel}>
             رقم هاتف موثق 
          </Text>
          <Text style={styles.dataValue}>{isVerified ? 'نعم' : 'لا'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        <TouchableOpacity
          style={styles.listRow}
          activeOpacity={0.85}
          onPress={() => router.push('/(user)/resetPassword')}
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
        onPress={() => router.replace('/(user)/report')}
      >
        <Text style={styles.supportButtonText}>الاتصال بالدعم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
export default Profile;
