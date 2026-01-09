import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import DriverSideMenu from '../../driverComponents/DriverSideMenu';
import { driverActions } from '../../redux/driverState';
import { COLORS } from '../../constants/constants';
import styles from '../../styles/driver/trips.styles.js';

const DriverTrips = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const driver = useSelector((state) => state.driverController.driver);
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUnauthorized = useCallback(
    async (message = 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا') => {
      await AsyncStorage.removeItem('loginInfo');
      await AsyncStorage.removeItem('expoToken');
      dispatch(driverActions.logOut());
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'تم تسجيل الخروج',
        textBody: message,
      });
      router.replace('/');
    },
    [dispatch, router]
  );

  const formatTrip = useCallback((trip) => {
    const created = trip?.createdAt ? new Date(trip.createdAt) : null;
    const hasValidDate = created && !Number.isNaN(created.getTime());
    const date = hasValidDate
      ? `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, '0')}/${String(created.getDate()).padStart(2, '0')}`
      : '---';
    const hours = hasValidDate ? created.getHours() : null;
    const minutes = hasValidDate ? created.getMinutes() : null;
    const period = hours !== null ? (hours >= 12 ? 'م' : 'ص') : '';
    const normalizedHour = hours !== null ? (hours % 12 === 0 ? 12 : hours % 12) : '--';
    const time = hours !== null ? `${String(normalizedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : '--';

    return {
      id: trip?._id || trip?.id || String(Math.random()),
      date,
      time: `${period} ${time}`.trim(),
      price: trip?.tripCost ?? trip?.price ?? '0',
      phone: trip?.userPhoneNumber || trip?.driverPhoneNumber || trip?.phoneNumber || 'غير متوفر',
      name: trip?.userName || trip?.driverName || 'غير متوفر',
      reference: trip?.tripNumber ? `${trip.tripNumber}#` : trip?.reference || '',
      avatar: trip?.userAvatar || trip?.driverAvatar || '',
    };
  }, []);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const loginInfo = await AsyncStorage.getItem('loginInfo');
      const storageToken = driver?.token || JSON.parse(loginInfo || '{}')?.token;
      if (!storageToken) {
        throw new Error('الرجاء تسجيل الدخول');
      }

      const res = await fetch(`${BACKEND_URL}/api/driver/trips/trips`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `bearer ${storageToken}`,
        },
      });

      const json = await res.json();
      if (res.status === 401) {
        await handleUnauthorized(json?.error || json?.message);
        return;
      }
      if (!res.ok) {
        throw new Error(json?.message || 'حدث خطأ أثناء جلب الرحلات');
      }

      const normalizedTrips = (json?.trips || []).map(formatTrip);
      setTrips(normalizedTrips);
    } catch (err) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'خطأ',
        textBody: err.message,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [BACKEND_URL, driver?.token, formatTrip, handleUnauthorized]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTrips();
  }, [fetchTrips]);

  const renderContent = () => {
    if (isLoading && trips.length === 0) {
      return (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      );
    }

    if (!isLoading && trips.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد رحلات بعد</Text>
        </View>
      );
    }

    return trips.map((trip) => (
      <View key={trip.id} style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.date}>{trip.date}</Text>
          <Text style={styles.time}>{trip.time}</Text>
          <Text style={styles.price}>{trip.price} د.ل</Text>
          {trip.reference ? <Text style={styles.reference}>{trip.reference}</Text> : null}
        </View>
        <View style={styles.cardRight}>
          <Image
            source={trip.avatar ? { uri: trip.avatar } : require('../../assets/images/driver.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.userDataHolder}>
            <Text style={styles.name}>{trip.name}</Text>
            <Text style={styles.phone}>{trip.phone}</Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <DriverSideMenu />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default DriverTrips;
