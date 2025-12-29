import { StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/constants';

const coreStyles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: 32,
    color: COLORS.DarkTextColor,
    marginBottom: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
    marginBottom: 18,
    textAlign: 'center',
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 22,
  },
  label: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
  submitBtn: {
    width: '100%',
  },
  submitGradient: {
    width: '100%',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.medium,
    color: COLORS.whiteTextColor,
  },
  sliderWrapper: {
    flex: 1,
    width: '100%',
  },
  step: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  otpImageHolder: {
    width: 220,
    height: 180,
    marginVertical: 10,
  },
  otpImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  otpWrapper: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'flex-end',
    gap: 8,
  },
  otpLabel: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
    fontFamily: FONT.Montserrat_Semi_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
  },
  passwordRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  eyeBtn: {
    position: 'absolute',
    left: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const palette = {
  placeholderColor: COLORS.ExtraLightTextColor,
};

export default { ...coreStyles, ...palette };
