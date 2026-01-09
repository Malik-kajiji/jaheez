import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import useLogin from '../driverHooks/useLogin';
import { styles } from '../styles/index.styles';
import { COLORS } from '../constants/constants';

export default function DriverLoginScreen() {
  const router = useRouter();
  const { loginAsDriver, signUp, isLoginLoading, isSignupLoading } = useLogin();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [expoToken, setExpoToken] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('expoToken').then((token) => {
      if (token) setExpoToken(token);
    });
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'ملاحظة',
        textBody: 'تأكد من ملئ الحقول!',
      });
      return;
    }
    await loginAsDriver(phoneNumber, password, expoToken);
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !phoneNumber || !password || !confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'ملاحظة',
        textBody: 'تأكد من ملئ الحقول!',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'ملاحظة',
        textBody: 'كلمة المرور غير متطابقة!',
      });
      return;
    }

    if (!agreeToTerms) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'ملاحظة',
        textBody: 'يجب الموافقة على الشروط والخصوصية!',
      });
      return;
    }

    await signUp(phoneNumber, firstName, lastName, password, expoToken);
  };

  const isLoading = isLogin ? isLoginLoading : isSignupLoading;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* User/Driver Switcher */}
        <TouchableOpacity
          style={styles.switcherButtonLeft}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={18} color="#fff" style={styles.switcherIcon} />
          <Text style={styles.switcherText}>الدخول كمستخدم</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/car-tow-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {isLogin ? 'أهلاً بك في جاهز' : 'إنشاء حساب جديد'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'أهلاً🚛 وصل خدمتك للناس' 
              : 'مرحبتين👋 اطلب ساحبة بسهولة'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
              إنشاء حساب
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={styles.label}>الاسم الأخير</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="لقب العائلة"
                    placeholderTextColor="#B7B7B7"
                    value={lastName}
                    onChangeText={setLastName}
                    textAlign="right"
                  />
                </View>
                <View style={styles.nameField}>
                  <Text style={styles.label}>الاسم الاول</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ادخل اسمك هنا"
                    placeholderTextColor="#B7B7B7"
                    value={firstName}
                    onChangeText={setFirstName}
                    textAlign="right"
                  />
                </View>
              </View>
            </>
          )}

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXX"
              placeholderTextColor="#B7B7B7"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>


          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.passwordContainer}>
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#B7B7B7" 
                />
              </TouchableOpacity>
              <TextInput
                style={styles.passwordInput}
                placeholder="*******"
                placeholderTextColor="#B7B7B7"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textAlign="right"
              />
            </View>
          </View>

          {!isLogin && (
            <>
              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>تأكيد كلمة السر</Text>
                <View style={styles.passwordContainer}>
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={24} 
                      color="#B7B7B7" 
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="*******"
                    placeholderTextColor="#B7B7B7"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>أوافق على الشروط والخصوصية</Text>
              </TouchableOpacity>
            </>
          )}

          {isLogin && (
            <View style={styles.loginOptionsContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>تذكرني</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(driver)/resetPassword')}>
                <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}