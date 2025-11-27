import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '../styles/index.styles';

export default function DriverLoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    // Login logic will be implemented later
    console.log('Driver Login pressed');
  };

  const handleSignup = () => {
    // Signup logic will be implemented later
    console.log('Driver Signup pressed');
  };


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
              placeholder="+218-920000000"
              placeholderTextColor="#B7B7B7"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          {!isLogin && (
            <>
              {/* Birth Date */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>تاريخ الميلاد</Text>
                <View style={styles.dateInputContainer}>
                  <Ionicons name="calendar-outline" size={24} color="#B7B7B7" style={styles.dateIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="27/07/1998"
                    placeholderTextColor="#B7B7B7"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    textAlign="right"
                  />
                </View>
              </View>
            </>
          )}

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
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={isLogin ? handleLogin : handleSignup}
          >
            <Text style={styles.submitButtonText}>
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}