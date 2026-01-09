import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DriverSideMenu from '../../driverComponents/DriverSideMenu';
import { COLORS, FONT, SIZES } from '../../constants/constants';

const DriverReport = () => {
  return (
    <View style={styles.container}>
      <DriverSideMenu />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>إرسال بلاغ</Text>
        <Text style={styles.placeholder}>لم يتم إعداد نموذج البلاغ بعد.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgColor,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'right',
  },
  placeholder: {
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.LightTextColor,
    textAlign: 'right',
  },
});

export default DriverReport;
