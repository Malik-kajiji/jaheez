import { StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgColor,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  loaderWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.small,
    color: COLORS.LightTextColor,
  },
  title: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'center',
    marginBottom: 6,
  },
  card: {
    backgroundColor: COLORS.LightGrayColor,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.xsmall,
    color: COLORS.LightTextColor,
  },
  time: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.xsmall,
    color: COLORS.LightTextColor,
  },
  price: {
    fontFamily: FONT.Montserrat_Semi_Bold,
    fontSize: SIZES.small,
    color: COLORS.DarkTextColor,
  },
  phone: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.xsmall,
    color: COLORS.LightTextColor,
  },
  reference: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.xsmall,
    color: COLORS.LightTextColor,
  },
  cardRight: {
    flexDirection: 'row-reverse',
    gap: 2,
  },
  userDataHolder: {
    gap: 6,
    justifyContent:'center'
  },
  name: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.small,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
});
