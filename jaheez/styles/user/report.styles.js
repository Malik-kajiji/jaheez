import { StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/constants';

const coreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgColor,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  title: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.xLarge,
    color: COLORS.DarkTextColor,
  },
  subtitle: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
    marginTop: 4,
    textAlign: 'right',
  },
  modeSwitcher: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  modeBtnActive: {
    backgroundColor: '#ffe9e0',
    borderColor: COLORS.primary,
  },
  modeBtnInactive: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e8e8e8',
  },
  modeTextActive: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  modeTextInactive: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
    marginBottom: 10,
  },
  tripList: {
    gap: 10,
    paddingBottom: 4,
  },
  tripCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 8,
  },
  tripCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff6f1',
  },
  tripMetaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  tripMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tripLabel: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.small,
    color: COLORS.LightTextColor,
  },
  tripValue: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
    marginTop: 2,
  },
  chipSelected: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.whiteTextColor,
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.small,
  },
  textArea: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 120,
    padding: 14,
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    color: COLORS.whiteTextColor,
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.medium,
  },
});

const palette = {
  placeholderColor: COLORS.ExtraLightTextColor,
};

export default { ...coreStyles, ...palette };
