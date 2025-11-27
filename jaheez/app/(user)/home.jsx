import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import VerificationModal from '../../components/VerificationModal';
import useLogin from '../../hooks/useLogin';
import { COLORS, FONT } from '../../constants/constants';

const Home = () => {
  const user = useSelector(state => state.userController.user);
  const router = useRouter();
  const { verifyUserByCode, handleResendMessage } = useLogin();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    
    // Show verification modal if user is not verified
    if (!user.isVerified) {
      setShowVerificationModal(true);
    }
  }, [user]);

  const handleVerify = async (otpCode) => {
    setIsVerifying(true);
    await verifyUserByCode(otpCode, setShowVerificationModal);
    setIsVerifying(false);
  };

  const handleResend = async () => {
    await handleResendMessage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>مرحباً {user?.username}</Text>
      <Text style={styles.subtext}>الصفحة الرئيسية للمستخدم</Text>
      
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerify}
        onResend={handleResend}
        isLoading={isVerifying}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
  },
  text: {
    fontSize: 24,
    fontFamily: FONT.GE_SS_Bold,
    color: COLORS.DarkTextColor,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    fontFamily: FONT.GE_SS_Medium,
    color: COLORS.LightTextColor,
  },
});

export default Home;