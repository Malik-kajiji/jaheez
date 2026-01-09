import { StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/constants';

const coreStyles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 64,
    paddingHorizontal: 24,
    backgroundColor: COLORS.bgColor,
    alignItems: 'center',
    minHeight: '100%',
  },
  avatarWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'center',
    marginBottom: 4,
  },
  phone: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.small,
    color: COLORS.LightTextColor,
    marginBottom: 24,
  },
  statusBadge: {
    marginTop: 4,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffe8e0',
  },
  statusBadgeApproved: {
    backgroundColor: '#e3f7eb',
    borderWidth: 1,
    borderColor: '#b8e8c9',
  },
  statusBadgeText: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.small,
    color: COLORS.primary,
    textAlign: 'center',
  },
  statusBadgeTextApproved: {
    color: '#1e9b4c',
  },
  warningCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffd4c7',
    backgroundColor: '#fff7f3',
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
    marginBottom: 6,
  },
  warningText: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.small,
    color: COLORS.LightTextColor,
    textAlign: 'right',
    marginBottom: 10,
  },
  warningReason: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 10,
  },
  warningButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  warningButtonText: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.small,
    color: COLORS.whiteTextColor,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dataLabel: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
  dataValue: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
  supportButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  supportButtonText: {
    color: COLORS.whiteTextColor,
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.medium,
  },
});

const palette = {
  placeholderColor: COLORS.ExtraLightTextColor,
  iconColor: COLORS.LightTextColor,
};

export default { ...coreStyles, ...palette };
