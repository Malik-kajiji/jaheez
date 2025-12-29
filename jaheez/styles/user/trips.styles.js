import { StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgColor,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  title: {
    textAlign: 'center',
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.xLarge,
    color: COLORS.DarkTextColor,
    marginTop: 12,
    marginBottom: 18,
  },
  tabsWrapper: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 6,
    marginHorizontal: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabTextActive: {
    fontFamily: FONT.GE_SS_Medium,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
  tabTextInactive: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cardLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
  },
  dateText: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.small,
    color: COLORS.DarkTextColor,
  },
  timeText: {
    fontFamily: FONT.Montserrat_Light,
    fontSize: SIZES.small,
    color: COLORS.LightTextColor,
  },
  idText: {
    fontFamily: FONT.Montserrat_Regular,
    fontSize: SIZES.small,
    color: COLORS.DarkTextColor,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  plateText: {
    fontFamily: FONT.Montserrat_Semi_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
  },
  starsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 6,
    gap: 4,
  },
  avatarWrap: {
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  badge: {
    position: 'absolute',
    left: 6,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
