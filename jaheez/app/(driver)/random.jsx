import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import VerificationModal from '../../driverComponents/VerificationModal';
import useLogin from '../../driverHooks/useLogin';
import styles from '../../styles/driver/home.styles';
import { COLORS } from '../../constants/constants';

const mockRequests = [
  {
    id: 'req-1',
    name: 'مالك محمد',
    distance: '5 دقائق',
    eta: 'دقيقة 0.7',
    price: 75,
  },
  {
    id: 'req-2',
    name: 'مالك محمد',
    distance: '5 دقائق',
    eta: 'دقيقة 0.7',
    price: 75,
  },
  {
    id: 'req-3',
    name: 'مالك محمد',
    distance: '5 دقائق',
    eta: 'دقيقة 0.7',
    price: 75,
  },
];

const filters = ['الكل', 'القرب الجغرافي', 'السعر', 'الوقت'];

const Home = () => {
  const driver = useSelector((state) => state.driverController.driver);
  const { verifyUserByCode, handleResendMessage } = useLogin();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const screenHeight = Dimensions.get('window').height;
  const SHEET_HEIGHT = screenHeight * 0.7;
  const CLOSED_TRANSLATE = screenHeight * 0.0; // partially visible when closed
  const translateY = useRef(new Animated.Value(CLOSED_TRANSLATE)).current;
  const panStartY = useRef(CLOSED_TRANSLATE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = (instant = false) => {
    setSheetOpen(true);
    if (instant) {
      translateY.setValue(0);
    } else {
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  const closeSheet = () => {
    Animated.timing(translateY, { toValue: CLOSED_TRANSLATE, duration: 250, useNativeDriver: true }).start(() => {
      setSheetOpen(false);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
        onPanResponderGrant: () => {
          translateY.stopAnimation((val) => {
            panStartY.current = typeof val === 'number' ? val : CLOSED_TRANSLATE;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = panStartY.current + gestureState.dy;
          const clamped = Math.max(0, Math.min(CLOSED_TRANSLATE, next));
          translateY.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          const finalY = panStartY.current + gestureState.dy;
          const velocity = gestureState.vy;
          if (velocity > 0.5 || finalY > CLOSED_TRANSLATE / 2) {
            // swipe down or past midpoint → close
            Animated.timing(translateY, { toValue: CLOSED_TRANSLATE, duration: 200, useNativeDriver: true }).start();
            setSheetOpen(false);
          } else {
            // swipe up or stay → open
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            setSheetOpen(true);
          }
        },
      }),
    [translateY, CLOSED_TRANSLATE]
  );

  useEffect(() => {
    if (driver && driver.isVerified === false) {
      setShowVerificationModal(true);
    }
  }, [driver]);

  const handleVerify = async (otpCode) => {
    setIsVerifying(true);
    await verifyUserByCode(otpCode, setShowVerificationModal);
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (driver?.phoneNumber) {
      await handleResendMessage(driver.phoneNumber);
    }
  };

  const initialRegion = useMemo(
    () => ({
      latitude: 32.887711,
      longitude: 13.187186,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerify}
        onResend={handleResend}
        isLoading={isVerifying}
      />
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}>
            <Ionicons name="location-sharp" size={34} color={COLORS.primary} />
          </Marker>
        </MapView>
      </View>

      {/* Backdrop */}
      {sheetOpen && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />
      )}

      <Animated.View style={[styles.requestsSlider, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}>
        <View style={styles.sheetHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { if (!sheetOpen) openSheet(); }}
          style={{ flex: 1 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersRow}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((label) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(label)}
                style={[styles.filterChip, activeFilter === label && styles.filterChipActive]}
              >
                <Text style={styles.filterChipText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={{ paddingBottom: 24 }}
            onTouchStart={() => { if (!sheetOpen) openSheet(); }}
            onScrollBeginDrag={() => { if (!sheetOpen) openSheet(); }}
          >
            {mockRequests.map((req) => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.riderInfo}>
                    <Image source={require('../../assets/images/driver.png')} style={styles.avatar} />
                    <View>
                      <Text style={styles.name}>{req.name}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{req.distance}</Text>
                        <Text style={styles.metaText}>{req.eta}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.price}>{req.price}</Text>
                    <Text style={styles.currency}>دينار ليبي</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.detailsButton} activeOpacity={0.85}>
                  <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Home;
