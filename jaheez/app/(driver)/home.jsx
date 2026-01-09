import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, PanResponder, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';
import MapView, { Marker, Circle } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import VerificationModal from '../../driverComponents/VerificationModal';
import DriverSideMenu from '../../driverComponents/DriverSideMenu';
import useLogin from '../../driverHooks/useLogin';
import styles from '../../styles/driver/home.styles';
import { COLORS } from '../../constants/constants';

const mockRequests = [
  {
    id: 'req-1',
    name: 'مالك محمد',
    time: '5',
    distance: '0.7',
    price: 75,
    pickupLocation: { latitude: 32.890, longitude: 13.190 },
    dropoffLocation: { latitude: 32.895, longitude: 13.195 },
    pickupAddress: 'طرابلس - شارع الجزائر',
    dropoffAddress: 'مركز خدمات السيارات - حي الاندلس',
    carType: 'تويوتا كامري',
  },
  {
    id: 'req-2',
    name: 'مالك محمد',
    time: '5',
    distance: '0.7',
    price: 75,
    pickupLocation: { latitude: 32.888, longitude: 13.188 },
    dropoffLocation: { latitude: 32.893, longitude: 13.193 },
    pickupAddress: 'طرابلس - شارع الجزائر',
    dropoffAddress: 'مركز خدمات السيارات - حي الاندلس',
    carType: 'تويوتا كامري',
  },
  {
    id: 'req-3',
    name: 'مالك محمد',
    time: '5',
    distance: '0.7',
    price: 75,
    pickupLocation: { latitude: 32.886, longitude: 13.186 },
    dropoffLocation: { latitude: 32.891, longitude: 13.191 },
    pickupAddress: 'طرابلس - شارع الجزائر',
    dropoffAddress: 'مركز خدمات السيارات - حي الاندلس',
    carType: 'تويوتا كامري',
  },
];

const filters = [ 'القرب الجغرافي', 'السعر', 'الوقت'];

const Home = () => {
  const driver = useSelector((state) => state.driverController.driver);
  const { verifyUserByCode, handleResendMessage } = useLogin();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bidPrice, setBidPrice] = useState(75);

  const screenHeight = Dimensions.get('window').height;
  const SHEET_HEIGHT = screenHeight * 0.7;
  const TRIP_DETAILS_HEIGHT = screenHeight * 0.5;
  const TRIP_DETAILS_MIN_HEIGHT = screenHeight * 0.3;
  const CLOSED_TRANSLATE = screenHeight * 0.4;
  
  const translateY = useRef(new Animated.Value(CLOSED_TRANSLATE)).current;
  const panStartY = useRef(CLOSED_TRANSLATE);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const tripDetailsHeight = useRef(new Animated.Value(TRIP_DETAILS_HEIGHT)).current;
  const tripDetailsPanStart = useRef(TRIP_DETAILS_HEIGHT);

  const mainMapRef = useRef(null);
  const hasCenteredOnDriver = useRef(false);

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
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
        onPanResponderTerminationRequest: () => false,
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
            Animated.timing(translateY, { toValue: CLOSED_TRANSLATE, duration: 200, useNativeDriver: true }).start();
            setSheetOpen(false);
          } else {
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            setSheetOpen(true);
          }
        },
      }),
    [translateY, CLOSED_TRANSLATE]
  );

  const tripDetailsPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
        onPanResponderGrant: () => {
          tripDetailsHeight.stopAnimation((val) => {
            tripDetailsPanStart.current = typeof val === 'number' ? val : TRIP_DETAILS_HEIGHT;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = tripDetailsPanStart.current - gestureState.dy;
          const clamped = Math.max(TRIP_DETAILS_MIN_HEIGHT, Math.min(SHEET_HEIGHT, next));
          tripDetailsHeight.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          const finalHeight = tripDetailsPanStart.current - gestureState.dy;
          const midpoint = (TRIP_DETAILS_MIN_HEIGHT + SHEET_HEIGHT) / 2;
          const target = finalHeight > midpoint ? SHEET_HEIGHT : TRIP_DETAILS_HEIGHT;
          Animated.spring(tripDetailsHeight, {
            toValue: target,
            useNativeDriver: false,
            friction: 8,
            tension: 80,
          }).start();
        },
      }),
    [tripDetailsHeight, TRIP_DETAILS_MIN_HEIGHT, SHEET_HEIGHT, TRIP_DETAILS_HEIGHT]
  );

  useEffect(() => {
    if (driver && driver.isVerified === false) {
      setShowVerificationModal(true);
    }
  }, [driver]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (!mainMapRef.current) return;
    if (!driverLocation) return;
    if (hasCenteredOnDriver.current) return;
    hasCenteredOnDriver.current = true;
    mainMapRef.current.animateCamera(
      { center: { latitude: driverLocation.latitude, longitude: driverLocation.longitude }, zoom: 15 },
      { duration: 400 }
    );
  }, [driverLocation]);

  useEffect(() => {
    if (!mainMapRef.current || !selectedTrip) return;
    const coords = [selectedTrip.pickupLocation, selectedTrip.dropoffLocation].filter(Boolean);
    if (coords.length < 2) return;
    mainMapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 100, right: 100, left: 100, bottom: TRIP_DETAILS_HEIGHT + 100 },
      animated: true,
    });
  }, [selectedTrip, TRIP_DETAILS_HEIGHT]);

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

  const handleViewDetails = (trip) => {
    // Animate out the requests slider
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTrip(trip);
      setBidPrice(trip.price);
      setSheetOpen(false);
      // Reset trip details height
      tripDetailsHeight.setValue(TRIP_DETAILS_HEIGHT);
    });
  };

  const handleBackToList = () => {
    setSelectedTrip(null);
    setSheetOpen(false);
    // Animate the requests slider back in
    setTimeout(() => {
      translateY.setValue(CLOSED_TRANSLATE);
    }, 100);
    // Return map focus to driver location
    if (mainMapRef.current && driverLocation) {
      mainMapRef.current.animateCamera(
        { center: { latitude: driverLocation.latitude, longitude: driverLocation.longitude }, zoom: 15 },
        { duration: 400 }
      );
    }
  };

  const handleIncreaseBid = () => {
    setBidPrice(prev => prev + 5);
  };

  const handleDecreaseBid = () => {
    if (bidPrice > 5) {
      setBidPrice(prev => prev - 5);
    }
  };

  const handleSubmitBid = () => {
    // Handle bid submission
    console.log('Submitting bid:', bidPrice);
  };

  const mainInitialRegion = useMemo(
    () => ({
      latitude: 32.887711,
      longitude: 13.187186,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }),
    []
  );

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
      <View style={styles.container}>
        <DriverSideMenu />
        <VerificationModal
          visible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onVerify={handleVerify}
          onResend={handleResend}
          isLoading={isVerifying}
        />
        
        <MapView
          ref={mainMapRef}
          onPress={() => { Keyboard.dismiss(); }}
          initialRegion={mainInitialRegion}
          showsUserLocation
          style={{ width: '100%', height: '100%' }}
        >
          
          {selectedTrip && (
            <>
              <Circle
                center={selectedTrip.pickupLocation}
                radius={1000}
                fillColor="rgba(244, 76, 45, 0.15)"
                strokeColor="rgba(244, 76, 45, 0.3)"
                strokeWidth={2}
              />
              <Marker
                coordinate={selectedTrip.dropoffLocation}
                title="الوجهة"
                pinColor={COLORS.secondary}
              />
            </>
          )}
        </MapView>

        {/* Backdrop - only show for requests list */}
        {sheetOpen && !selectedTrip && (
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => { Keyboard.dismiss(); closeSheet(); }} />
        )}

        {!selectedTrip ? (
          <Animated.View style={[styles.requestsSlider, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}>
            <View style={styles.sheetHandleContainer} {...panResponder.panHandlers}>
              <View style={styles.sheetHandle} />
            </View>
            
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
              <TouchableOpacity activeOpacity={1}>
                {mockRequests.map((req) => (
                  <View key={req.id} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={styles.riderInfo}>
                        <Image source={require('../../assets/images/driver.png')} style={styles.avatar} />
                        <View style={styles.riderInfoText}>
                          <Text style={styles.name}>{req.name}</Text>
                          <View style={styles.metaRow}>
                            <Text style={styles.metaText}><Text style={styles.metaTextData}>{req.time}</Text> دقيقة</Text>
                          </View>
                          <View style={styles.metaRow}>
                            <Text style={styles.metaText}><Text style={styles.metaTextData}>{req.distance}</Text> كم</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.price}>{req.price}</Text>
                        <Text style={styles.currency}>دينار ليبي</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      activeOpacity={0.85}
                      onPress={() => handleViewDetails(req)}
                    >
                      <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.tripDetailsSlider, { height: tripDetailsHeight }]}>
            <View style={styles.tripDetailsHandleContainer} {...tripDetailsPanResponder.panHandlers}>
              {/* <View style={styles.tripDetailsHandle} /> */}
            </View>
            
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.tripDetailsContainer}>
                  <View style={styles.tripDetailsHeader}>
                    <View style={styles.tripDetailsHeaderDots}>
                      <View style={styles.tripDetailsDot} />
                      <View style={styles.tripDetailsLine} />
                      <View style={[styles.tripDetailsDot, styles.tripDetailsDotRed]} />
                    </View>
                    <View style={styles.tripDetailsAddresses}>
                      <Text style={styles.tripDetailsAddress}>يبعد <Text style={styles.tripDetailsAddressNumber}>{selectedTrip.distance}</Text> كم</Text>
                      <Text style={styles.tripDetailsAddress}>{selectedTrip.dropoffAddress}</Text>
                    </View>
                    <Image source={require('../../assets/images/driver.png')} style={styles.tripDetailsAvatar} />
                  </View>

                  <View style={styles.tripDetailsInfo}>
                    <View style={styles.tripDetailsInfoRow}>
                      <Text style={styles.tripDetailsLabel}>السيارة المعطلة</Text>
                      <Text style={styles.tripDetailsValue}>{selectedTrip.carType}</Text>
                    </View>
                    <View style={styles.tripDetailsInfoRow}>
                      <Text style={styles.tripDetailsLabel}>السعر المقترح</Text>
                      <Text style={styles.tripDetailsValue}><Text style={styles.tripDetailsValueNumber}>{selectedTrip.price}</Text> د.ل</Text>
                    </View>
                    <View style={styles.tripDetailsInfoRow}>
                      <Text style={styles.tripDetailsLabel}>المركبة المطلوبة</Text>
                      <Text style={styles.tripDetailsValue}>ساحبة</Text>
                    </View>
                  </View>

                  <View style={styles.bidSection}>
                    <Text style={styles.bidLabel}>المزايدة</Text>
                    <View style={styles.bidControls}>
                      <TouchableOpacity style={styles.bidButton} onPress={handleDecreaseBid}>
                        <Text style={styles.bidButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.bidPrice}>{bidPrice}</Text>
                      <TouchableOpacity style={styles.bidButton} onPress={handleIncreaseBid}>
                        <Text style={styles.bidButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.tripDetailsActions}>
                    <TouchableOpacity style={styles.submitBidButton} onPress={handleSubmitBid}>
                      <Text style={styles.submitBidButtonText}>تقديم عرض</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
                      <Text style={styles.backButtonText}>العودة</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
