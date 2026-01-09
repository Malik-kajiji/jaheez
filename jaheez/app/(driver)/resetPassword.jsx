
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, Keyboard, Animated, Dimensions, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import styles from '../../styles/user/resetPassword.styles.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/constants.js';
import useLogin from '../../driverHooks/useLogin';

const ResetPassword = () => {
	const router = useRouter();
	const { handleSendResetMessage, handleCheckResetCode, handleResetPassword, isResetLoading } = useLogin();

	const [phone, setPhone] = useState('');
	const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
	const [step, setStep] = useState(0); // 0 phone, 1 otp, 2 new pass
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNewPass, setShowNewPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);

	const screenWidth = useMemo(() => Dimensions.get('window').width, []);
	const slideX = useRef(new Animated.Value(0)).current;
	const otpRefs = useRef([]);

	const animateToStep = (nextStep) => {
		setStep(nextStep);
		Animated.timing(slideX, {
			toValue: -screenWidth * nextStep,
			duration: 240,
			useNativeDriver: true,
		}).start();
	};

	const handleSendCode = async () => {
		if (!phone || phone.length < 10 || !phone.startsWith('09')) {
			return;
		}
		const ok = await handleSendResetMessage(phone);
		if (ok) {
			animateToStep(1);
		}
	};

	const handleOtpChange = (value, idx) => {
		if (value.length > 1) {
			const digits = value.slice(0, 4).split('');
			const next = [...otpDigits];
			digits.forEach((digit, i) => {
				if (idx + i < 4) {
					next[idx + i] = digit;
				}
			});
			setOtpDigits(next);
			const nextIndex = Math.min(idx + digits.length, 3);
			setTimeout(() => {
				otpRefs.current[nextIndex]?.focus();
			}, 10);
			return;
		}

		const digit = value.slice(-1);
		const next = [...otpDigits];
		next[idx] = digit;
		setOtpDigits(next);
		if (digit && idx < otpRefs.current.length - 1) {
			setTimeout(() => {
				otpRefs.current[idx + 1]?.focus();
			}, 10);
		}
	};

	const handleOtpBackspace = (e, idx) => {
		if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
			otpRefs.current[idx - 1]?.focus();
		}
	};

	const handleVerifyCode = async () => {
		const code = otpDigits.join('');
		if (code.length < 4) return;
		const valid = await handleCheckResetCode(phone, code);
		if (valid) {
			animateToStep(2);
		}
	};

	const handleSubmitNewPassword = async () => {
		const code = otpDigits.join('');
		if (!newPassword || newPassword.length < 8) return;
		if (newPassword !== confirmPassword) return;
		await handleResetPassword(phone, code, newPassword);
	};

	return (
		<LinearGradient
			colors={['#fff6f3', '#fff8f5', '#ffffff']}
			start={[0, 0]}
			end={[1, 1]}
			style={styles.gradient}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<SafeAreaView style={styles.safeArea}>
						<TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
							<Ionicons name="chevron-back" size={30} color={COLORS.primary} />
							<Text style={styles.backText}>الرجوع</Text>
						</TouchableOpacity>

						<View style={styles.sliderWrapper}>
							<Animated.View
								style={{ flexDirection: 'row', width: screenWidth * 3, height: '100%', transform: [{ translateX: slideX }] }}
							>
							{/* Step 1: phone */}
							<View style={[styles.step, { width: screenWidth }]}>  
								<View style={styles.content}>
									<Text style={styles.title}>استرجاع كلمة المرور</Text>
									<View style={styles.fieldWrapper}>
										<Text style={styles.label}>رقم الهاتف</Text>
										<TextInput
											style={styles.input}
											placeholder="09XXXXXXXX"
											placeholderTextColor={styles.placeholderColor}
											keyboardType="phone-pad"
											textAlign="right"
											value={phone}
											onChangeText={setPhone}
										/>
									</View>
									<TouchableOpacity
										style={[styles.submitBtn, isResetLoading && { opacity: 0.7 }]}
										activeOpacity={0.9}
										onPress={handleSendCode}
										disabled={isResetLoading}
									>
										<LinearGradient
											colors={['#ffad61', '#f24c2d']}
											start={[0, 0]}
											end={[1, 0]}
											style={styles.submitGradient}
										>
											{isResetLoading ? (
												<ActivityIndicator color="#fff" />
											) : (
												<Text style={styles.submitText}>إرسال رمز التحقق</Text>
											)}
										</LinearGradient>
									</TouchableOpacity>
								</View>
							</View>

							{/* Step 2: OTP */}
							<View style={[styles.step, { width: screenWidth }]}>  
								<View style={styles.content}>  
									<Text style={styles.title}>أدخل رمز التحقق</Text>
									<Text style={styles.subtitle}>المرسل إلى رقمك</Text>
									<View style={styles.otpImageHolder}>
										<Image source={require('../../assets/images/verify-icon.png')} style={styles.otpImage} />
									</View>
									<View style={styles.otpWrapper}>
										<Text style={styles.otpLabel}>رمز OTP</Text>
										<View style={styles.otpRow}>
											{otpDigits.map((d, idx) => (
												<TextInput
													key={idx}
													ref={(el) => (otpRefs.current[idx] = el)}
													style={styles.otpInput}
													value={d}
													onChangeText={(v) => handleOtpChange(v, idx)}
													onKeyPress={(e) => handleOtpBackspace(e, idx)}
													keyboardType="number-pad"
													maxLength={1}
													textAlign="center"
													selectTextOnFocus
													autoFocus={idx === 0}
												/>
											))}
										</View>
									</View>
									<TouchableOpacity
										style={[styles.submitBtn, isResetLoading && { opacity: 0.7 }]}
										activeOpacity={0.9}
										onPress={handleVerifyCode}
										disabled={isResetLoading}
									>
										<LinearGradient
											colors={['#ffad61', '#f24c2d']}
											start={[0, 0]}
											end={[1, 0]}
											style={styles.submitGradient}
										>
											{isResetLoading ? (
												<ActivityIndicator color="#fff" />
											) : (
												<Text style={styles.submitText}>تأكيد الرمز</Text>
											)}
										</LinearGradient>
									</TouchableOpacity>
								</View>
							</View>

							{/* Step 3: new password */}
							<View style={[styles.step, { width: screenWidth }]}>  
								<View style={styles.content}>  
									<Text style={styles.title}>تغيير كلمة المرور</Text>
									<View style={styles.fieldWrapper}>
										<Text style={styles.label}>كلمة المرور الجديدة</Text>
										<View style={styles.passwordRow}>
											<TextInput
												style={[styles.input, { flex: 1, paddingRight: 12 }]}
												placeholder="*******"
												placeholderTextColor={styles.placeholderColor}
												secureTextEntry={!showNewPass}
												textAlign="right"
												value={newPassword}
												onChangeText={setNewPassword}
											/>
											<TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNewPass((p) => !p)}>
												<Ionicons name={showNewPass ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.LightTextColor} />
											</TouchableOpacity>
										</View>
									</View>
									<View style={styles.fieldWrapper}>
										<Text style={styles.label}>تأكيد كلمة السر الجديدة</Text>
										<View style={styles.passwordRow}>
											<TextInput
												style={[styles.input, { flex: 1, paddingRight: 12 }]}
												placeholder="*******"
												placeholderTextColor={styles.placeholderColor}
												secureTextEntry={!showConfirmPass}
												textAlign="right"
												value={confirmPassword}
												onChangeText={setConfirmPassword}
											/>
											<TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPass((p) => !p)}>
												<Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.LightTextColor} />
											</TouchableOpacity>
										</View>
									</View>
									<TouchableOpacity
										style={[styles.submitBtn, isResetLoading && { opacity: 0.7 }]}
										activeOpacity={0.9}
										onPress={handleSubmitNewPassword}
										disabled={isResetLoading}
									>
										<LinearGradient
											colors={['#ffad61', '#f24c2d']}
											start={[0, 0]}
											end={[1, 0]}
											style={styles.submitGradient}
										>
											{isResetLoading ? (
												<ActivityIndicator color="#fff" />
											) : (
												<Text style={styles.submitText}>تغيير كلمة المرور</Text>
											)}
										</LinearGradient>
									</TouchableOpacity>
								</View>
							</View>
							</Animated.View>
						</View>
					</SafeAreaView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</LinearGradient>
	);
};

export default ResetPassword;
