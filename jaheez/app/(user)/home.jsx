import React, { useEffect, useRef } from 'react';
import { Text, View, Animated, TouchableOpacity, ScrollView, Image, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, InteractionManager, UIManager, findNodeHandle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VerificationModal from '../../components/VerificationModal';
import SideMenu from '../../components/SideMenu';
import styles from '../../styles/user/homepage.styles';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { COLORS } from '../../constants/constants';
import { AntDesign, FontAwesome6, Octicons } from '@expo/vector-icons';
import useOrder from '../../hooks/useOrder';



const Home = () => {
  const {
    showVerificationModal,
    setShowVerificationModal,
    handleVerify,
    handleResend,
    isVerifying,
    requestType,
    handleSetRequestType,
    slideAnim,
    SHEET_HEIGHT,
    translateY,
    sheetOpen,
    openSheet,
    closeSheet,
    panResponder,
    INPUT_WIDTH,
    keyboardHeight,
    scrollRef,
    carInputRef,
    destMapRef,
    lastScrollY,
    scrollToCarInput,
    isCarInputFocused,
    selectedProblemType,
    setSelectedProblemType,
    carType,
    setCarType,
    effectiveStartSelected,
    startName,
    destinationSelected,
    destinationName,
    handleClearDestination,
    openDestinationSheet,
    middleDotActive,
    destinationSheetVisible,
    destSheetHeight,
    destTranslateY,
    closeDestinationSheet,
    // handleSearchChange,
    // handleSearch,
    // searchResults,
    // handleSelectSuggestion,
    mapRegion,
    handleRegionChangeComplete,
    handleMapPress,
    confirmingDestination,
    confirmDestination,
    mainInitialRegion,
    selectionTarget,
    destinationCoord,
    startCoord,
    startLocationSelected,
    userLocation,
    isFormComplete,
    price,
    increasePrice,
    decreasePrice,
    canIncreasePrice,
    canDecreasePrice,
    offersVisible,
    offers,
    handleSubmitOrder,
    acceptOffer,
    rejectOffer,
    acceptedOfferId,
    cancelOffers,
    rideStatus,
    rideDriver,
    handleCallDriver,
    driverSelected,
    searchResults,
    searchLoading,
    handleSearchChange,
    handleSearch,
    handleSelectSuggestion,
    personName,
    personPhone,
    setPersonName,
    setPersonPhone,
  } = useOrder();

  const mainMapRef = useRef(null);
  const hasCenteredOnUser = useRef(false);

  useEffect(() => {
    if (!mainMapRef.current) return;
    if (!destinationSelected || !userLocation) return;
    const startPoint = requestType === 'other' && startLocationSelected ? startCoord : { latitude: userLocation.latitude, longitude: userLocation.longitude };
    const coords = [startPoint, destinationCoord].filter(Boolean);
    if (coords.length < 2) return;
    mainMapRef.current.fitToCoordinates(coords, {
      edgePadding: {
        top: 80,
        right: 80,
        left: 80,
        bottom: SHEET_HEIGHT + 40,
      },
      animated: true,
    });
  }, [destinationSelected, userLocation, destinationCoord, SHEET_HEIGHT, requestType, startCoord, startLocationSelected]);

  useEffect(() => {
    if (!mainMapRef.current) return;
    if (!userLocation) return;
    if (hasCenteredOnUser.current) return;
    hasCenteredOnUser.current = true;
    mainMapRef.current.animateCamera(
      { center: { latitude: userLocation.latitude, longitude: userLocation.longitude }, zoom: 15 },
      { duration: 400 }
    );
  }, [userLocation]);


  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
      <View style={styles.container}>
      <SideMenu />
      {((driverSelected || !!acceptedOfferId || !!rideDriver) || rideStatus === 'completed') && (
        <View style={styles.rideProgressBar}>
          {[{ key: 'awaiting', label: 'في انتظار السائق' }, { key: 'en_route', label: 'في الطريق' }, { key: 'completed', label: 'مكتمل' }].map((step, index, arr) => {
            const isActive = rideStatus === step.key;
            return (
              <React.Fragment key={step.key}>
                <View style={[styles.rideProgressStep, isActive && styles.rideProgressStepActive]}>
                  <Text style={[styles.rideProgressLabel, isActive && styles.rideProgressLabelActive]}>{step.label}</Text>
                </View>
                {index < arr.length - 1 && (
                  <FontAwesome5 name="chevron-right" size={14} color={COLORS.LightTextColor} style={styles.rideProgressArrow} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      )}
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
        {userLocation ? (
          <Marker
            coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            title="موقعك"
          />
        ) : null}
        {requestType === 'other' && startLocationSelected && startCoord ? (
          <Marker
            coordinate={startCoord}
            title={startName || 'نقطة الانطلاق'}
            pinColor={COLORS.secondary}
          />
        ) : null}
        {destinationSelected ? (
          <Marker
            coordinate={destinationCoord}
            title={destinationName || 'الوجهة'}
            pinColor={COLORS.primary}
          />
        ) : null}
      </MapView>


      {/* Backdrop */}
      {sheetOpen && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => { Keyboard.dismiss(); closeSheet(); }} />
      )}
      {destinationSheetVisible && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => { Keyboard.dismiss(); closeDestinationSheet(); }} />
      )}

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_HEIGHT, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.sheetHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{ flex: 1 }}>
            <ScrollView
              ref={scrollRef}
              style={styles.sheetContent}
              onTouchStart={() => { if (!sheetOpen) openSheet(); }}
              onScrollBeginDrag={() => { if (!sheetOpen) openSheet(); }}
              onStartShouldSetResponderCapture={() => {
                if (!sheetOpen) {
                  openSheet();
                  return true;
                }
                return false;
              }}
              keyboardShouldPersistTaps="handled"
              // contentContainerStyle={{ paddingBottom: keyboardHeight + 200, flexGrow: 1 }}
              contentContainerStyle={{ paddingBottom: keyboardHeight + 80, flexGrow: 1 }}
              onScroll={(e) => { lastScrollY.current = e.nativeEvent.contentOffset.y; }}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => { Keyboard.dismiss(); }}
                style={{ flex: 1 }}
              >
                <View
                  style={styles.sheetInnerContent}
                  onStartShouldSetResponderCapture={() => {
                    if (!sheetOpen) {
                      openSheet();
                      return true;
                    }
                    return false;
                  }}
                >
              <View style={styles.requestTypeContainer}>
                {/* animated sliding gradient background */}
                <Animated.View pointerEvents="none" style={[styles.requestTypeSlider, { transform: [{ translateX: slideAnim }] }]}> 
                  <LinearGradient
                    colors={[COLORS.secondary, COLORS.primary]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={{ flex: 1, borderRadius: 20 }}
                  />
                </Animated.View>

                <TouchableOpacity
                  style={styles.optionTouchable}
                  activeOpacity={0.85}
                  onPress={() => handleSetRequestType('other')}
                >
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
                    <FontAwesome5 name="user-friends" size={18} color={requestType === 'other' ? COLORS.whiteTextColor : COLORS.ExtraLightTextColor} />
                    <Text style={[requestType === 'other' ? styles.optionTextActive : styles.optionTextInactive]}>لشخص آخر</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionTouchable}
                  activeOpacity={0.85}
                  onPress={() => handleSetRequestType('self')}
                >
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
                    <FontAwesome5 name="user-alt" size={18} color={requestType === 'self' ? COLORS.whiteTextColor : COLORS.ExtraLightTextColor} />
                    <Text style={[requestType === 'self' ? styles.optionTextActive : styles.optionTextInactive]}>لنفسي</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.selfOrderContainer}>
                {requestType === 'other' && (
                  <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <Text style={styles.inputTitleStyles}>بيانات الشخص</Text>
                    <TextInput
                      style={[styles.carTypeInput, { width: INPUT_WIDTH, marginTop: 8 }]}
                      placeholder="اسم الشخص"
                      placeholderTextColor={COLORS.ExtraLightTextColor}
                      value={personName}
                      onChangeText={setPersonName}
                      textAlign="right"
                    />
                    <TextInput
                      style={[styles.carTypeInput, { width: INPUT_WIDTH, marginTop: 10 }]}
                      placeholder="رقم الهاتف"
                      placeholderTextColor={COLORS.ExtraLightTextColor}
                      value={personPhone}
                      onChangeText={setPersonPhone}
                      keyboardType="phone-pad"
                      textAlign="right"
                    />
                  </View>
                )}
                <Text style={styles.inputTitleStyles}>نوع المشكلة</Text>
                <View style={styles.problemTypesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
                      {/* rafe3a card */}
                      <TouchableOpacity
                        style={ selectedProblemType === 'rafe3a' ? [styles.activeProblemTypeCard, styles.activeProblemGlow] : styles.problemTypeCard }
                        activeOpacity={0.8}
                        onPress={() => setSelectedProblemType('rafe3a')}
                      >
                        {selectedProblemType === 'rafe3a' ? (
                          <>
                            <LinearGradient colors={[COLORS.secondary + '66', COLORS.primary + '66']} start={[0,0]} end={[1,0]} style={styles.activeGlowLayer} />
                            <LinearGradient colors={[COLORS.secondary, COLORS.primary]} start={[0,0]} end={[1,0]} style={{ ...StyleSheet.absoluteFillObject }} />
                          </>
                        ) : null}
                        <View style={{ width: 91, height: 91, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          {selectedProblemType === 'rafe3a' ? (
                              <LinearGradient colors={[COLORS.secondary + '44', COLORS.primary + '44']} start={[0,0]} end={[1,1]} style={styles.activeIconGlow} />
                          ) : null}
                          <View style={ selectedProblemType === 'rafe3a' ? [styles.activeProblemTypeIconPlaceholder, styles.activeIconInnerShadow] : styles.problemTypeIconPlaceholder }>
                            <Image source={ selectedProblemType === 'rafe3a' ? require('../../assets/icons/active-rafe3a.png') : require('../../assets/icons/inactive-rafe3a.png')} style={styles.problemTypeIcon} />
                          </View>
                        </View>
                        <Text style={ selectedProblemType === 'rafe3a' ? styles.activeProblemTypeLabel : styles.problemTypeLabel }>رافعة</Text>
                      </TouchableOpacity>

                      {/* sa7eba card */}
                      <TouchableOpacity
                        style={ selectedProblemType === 'sa7eba' ? [styles.activeProblemTypeCard, styles.activeProblemGlow] : styles.problemTypeCard }
                        activeOpacity={0.9}
                        onPress={() => setSelectedProblemType('sa7eba')}
                      >
                        {selectedProblemType === 'sa7eba' ? (
                          <>
                            <LinearGradient colors={[COLORS.secondary + '66', COLORS.primary + '66']} start={[0,0]} end={[1,0]} style={styles.activeGlowLayer} />
                            <LinearGradient colors={[COLORS.secondary, COLORS.primary]} start={[0,0]} end={[1,0]} style={{ ...StyleSheet.absoluteFillObject }} />
                          </>
                        ) : null}
                        <View style={{ width: 91, height: 91, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          {selectedProblemType === 'sa7eba' ? (
                            <LinearGradient colors={[COLORS.secondary + '44', COLORS.primary + '44']} start={[0,0]} end={[1,1]} style={styles.activeIconGlow} />
                          ) : null}
                          <View style={ selectedProblemType === 'sa7eba' ? [styles.activeProblemTypeIconPlaceholder, styles.activeIconInnerShadow] : styles.problemTypeIconPlaceholder }>
                            <Image source={ selectedProblemType === 'sa7eba' ? require('../../assets/icons/active-sa7eba.png') : require('../../assets/icons/inactive-sa7eba.png')} style={styles.problemTypeIcon} />
                          </View>
                        </View>
                        <Text style={ selectedProblemType === 'sa7eba' ? styles.activeProblemTypeLabel : styles.problemTypeLabel }>ساحبة</Text>
                      </TouchableOpacity>
                    </ScrollView>
                </View>
                <Text style={styles.inputTitleStyles}>نوع السيارة</Text>
                <TextInput
                  style={[styles.carTypeInput, { width: INPUT_WIDTH }]}
                  placeholder="مثال: تويوتا كورولا 2025"
                  placeholderTextColor={COLORS.ExtraLightTextColor}
                  ref={carInputRef}
                  value={carType}
                  onChangeText={setCarType}
                  onFocus={() => {
                    isCarInputFocused.current = true;
                    setTimeout(() => {
                      InteractionManager.runAfterInteractions(() => {
                        scrollToCarInput();
                        // final fallback using measureInWindow if needed
                        setTimeout(() => {
                          if (!carInputRef.current || !scrollRef.current) return;
                          UIManager.measureInWindow(findNodeHandle(carInputRef.current), (x, y, width, height) => {
                            if (typeof y === 'number') {
                              const screenH = Dimensions.get('window').height;
                              const visibleHeight = screenH - keyboardHeight - 40;
                              if (y + height > visibleHeight) {
                                const delta = (y + height) - visibleHeight + 20;
                                scrollRef.current.scrollTo({ y: lastScrollY.current + delta, animated: true });
                              }
                            }
                          });
                        }, 140);
                      });
                    }, 120);
                  }}
                  onBlur={() => { isCarInputFocused.current = false; }}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.inputTitleStyles}>الرحلة</Text>
                <View style={styles.journeyContainer}>
                  <View style={styles.rightBarHolder}>
                    <View style={ effectiveStartSelected ? styles.activeLocationCircle : styles.inactiveLocationCircle }></View>
                    <Image
                      source={ middleDotActive ? require('../../assets/icons/active-line.png') : require('../../assets/icons/inactive-line.png') }
                      style={styles.dotsIcon}
                    />
                    <View style={ destinationSelected ? styles.activeLocationCircle : styles.inactiveLocationCircle }></View>
                  </View>
                  <View style={styles.locationTextsHolder}>
                    <Text style={styles.locationDesc}>الانطلاق</Text>
                    {requestType === 'self' ? (
                      <Text style={[styles.locationAddress, !effectiveStartSelected && { color: COLORS.ExtraLightTextColor }]}>
                        موقعك الحالي
                      </Text>
                    ) : (
                      effectiveStartSelected ? (
                        <View style={styles.selectedDestinationRow}>
                          <Text style={styles.selectedDestinationText} numberOfLines={1}>{startName || 'نقطة انطلاق محددة'}</Text>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.addDestinationButton} activeOpacity={0.7} onPress={() => openDestinationSheet('start')}>
                          <Octicons name="search" size={18} color={COLORS.LightTextColor} />
                          <Text style={styles.addDestinationButtonText}>اختر موقع الانطلاق</Text>
                        </TouchableOpacity>
                      )
                    )}
                    <Text style={styles.secondLocationDesc}>الوجهة</Text>
                    {destinationSelected ? (
                      <View style={styles.selectedDestinationRow}>
                        <Text style={styles.selectedDestinationText} numberOfLines={1}>{destinationName || 'وجهة محددة'}</Text>
                        <TouchableOpacity onPress={handleClearDestination} style={styles.selectedDestinationClear} activeOpacity={0.7}>
                          {/* <Text style={styles.selectedDestinationClearText}>إزالة</Text> */}
                          <AntDesign name="close-circle" size={24} color={'#e74c3c'} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addDestinationButton} activeOpacity={0.7} onPress={() => openDestinationSheet('destination')}>
                        <Octicons name="search" size={18} color={COLORS.LightTextColor} />
                        <Text style={styles.addDestinationButtonText}>البحث عن وجهة</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.inputTitleStyles}>السعر</Text>
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <TouchableOpacity
                      activeOpacity={isFormComplete && canDecreasePrice ? 0.85 : 1}
                      style={[styles.priceAdjustBtn, (!isFormComplete || !canDecreasePrice) && styles.priceAdjustBtnDisabled]}
                      disabled={!isFormComplete || !canDecreasePrice}
                      onPress={decreasePrice}
                    >
                      <Text style={[styles.priceAdjustText, (!isFormComplete || !canDecreasePrice) && styles.priceAdjustTextDisabled]}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.priceAmountWrap}>
                      <Text style={styles.priceAmountText}>{price}</Text>
                      <Text style={styles.priceCurrencyText}>د.ل</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={isFormComplete && canIncreasePrice ? 0.85 : 1}
                      style={[styles.priceAdjustBtn, (!isFormComplete || !canIncreasePrice) && styles.priceAdjustBtnDisabled]}
                      disabled={!isFormComplete || !canIncreasePrice}
                      onPress={increasePrice}
                    >
                      <Text style={[styles.priceAdjustText, (!isFormComplete || !canIncreasePrice) && styles.priceAdjustTextDisabled]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={isFormComplete ? 0.9 : 1}
                  style={styles.submitBtnWrapper}
                  disabled={!isFormComplete}
                  onPress={handleSubmitOrder}
                >
                  <LinearGradient
                    colors={isFormComplete ? ['#ffa638', '#f24c2d'] : ['#e2e2e2', '#b9b9b9']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={[styles.submitGradient, !isFormComplete && { opacity: 0.8 }]}
                  >
                    <Text style={[styles.submitText, !isFormComplete && styles.submitTextDisabled]}>إرسال الطلب</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* <View style={styles.startLocationHolder}>
                  <FontAwesome6 name="dot-circle" size={24} color={COLORS.primary} />
                  <Text style={styles.startLocationText}>موقعك الحالي</Text>
                  <FontAwesome6 name="circle" size={24} color="black" />
                </View> */}
              </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>

      {offersVisible && (
        <View style={styles.offersOverlay} pointerEvents="box-none">
          <View style={styles.offersHeader}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.cancelTripButton}
              onPress={cancelOffers}
            >
              <Text style={styles.cancelTripText}>إلغاء الرحلة</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offersList}>
            {/* <Text style={styles.offersTitle}>العروض المتاحة لطلبك</Text> */}
            <ScrollView contentContainerStyle={styles.offersScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                activeOpacity={1}
              >
                {offers.map((offer) => {
                  const isAccepted = acceptedOfferId === offer.id;
                  const remaining = typeof offer.timeLeftSeconds === 'number' ? offer.timeLeftSeconds : 90;
                  const minutes = Math.floor(remaining / 60);
                  const seconds = `${remaining % 60}`.padStart(2, '0');
                  return (
                    <View key={offer.id} style={styles.offerCard}>
                      <View style={styles.offerHeaderRow}>
                        <View style={styles.offerTimerBlock}>
                          <View style={styles.offerTimerRingOuter}>
                            <View style={styles.offerTimerRingInner}>
                              <Text style={styles.offerTimerText}>{`${minutes}:${seconds}`}</Text>
                            </View>
                          </View>
                          <View style={styles.offerMeta}>
                            <Text style={styles.offerMetaText}>
                            <Text style={styles.offerMetaTextNumber}>{offer.etaMinutes}</Text> دقائق 
                            </Text>
                            <Text style={styles.offerMetaText}>
                            <Text style={styles.offerMetaTextNumber}>{offer.distanceKm}</Text> كيلو 
                            </Text>
                          </View>
                        </View>

                        <View style={styles.offerPriceBlock}>
                          <View style={styles.offerPriceBlockInner}>
                            <Text style={styles.offerPriceLabel}>قيمة العرض</Text>
                            <Text style={styles.offerPriceValue}>
                              <Text style={styles.offerPriceValueNumber}>{offer.price}</Text>
                              د.ل 
                            </Text>
                          </View>
                        </View>

                        <View style={styles.offerDriverBlock}>
                          <Text style={styles.offerDriverId}>#{offer.id}</Text>
                          <Text
                            style={styles.offerDriverName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {offer.driverName}
                          </Text>
                          <View style={styles.offerRatingRow}>
                            <FontAwesome5 name="star" size={10} color="#f4c430" />
                            <FontAwesome5 name="star" size={10} color="#f4c430" />
                            <FontAwesome5 name="star" size={10} color="#f4c430" />
                            <FontAwesome5 name="star" size={10} color="#f4c430" />
                            <FontAwesome5 name="star-half-alt" size={10} color="#f4c430" />
                          </View>
                        </View>

                        <Image source={require('../../assets/images/driver.png')} style={styles.offerAvatar} />
                      </View>
                      <View style={styles.offerActionsRow}>
                        <TouchableOpacity
                          style={[styles.offerAcceptBtn, isAccepted && styles.offerAcceptBtnActive]}
                          activeOpacity={0.9}
                          onPress={() => acceptOffer(offer.id)}
                          disabled={!!acceptedOfferId && !isAccepted}
                        >
                          <Text style={styles.offerAcceptText}>{isAccepted ? 'تم قبول العرض' : 'قبول العرض'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.offerRejectBtn}
                          activeOpacity={0.85}
                          onPress={() => rejectOffer(offer.id)}
                        >
                          <Text style={styles.offerRejectText}>رفض العرض</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {rideDriver && rideStatus !== 'idle' && (
        <View style={styles.activeTripCard} pointerEvents="auto">
          <View style={styles.activeTripHandle} />
          <View style={styles.activeTripHeader}>
            <View style={styles.activeTripInfo}>
              <Text style={styles.activeTripName}>{rideDriver.driverName || 'السائق'}</Text>
              <Text style={styles.activeTripPhone}>{rideDriver.phone || ''}</Text>
              {rideDriver.plate ? (
                <Text style={styles.activeTripPlate}>لوحة السيارة: <Text style={styles.activeTripPlateNumber}> {rideDriver.plate}</Text></Text>
              ) : null}
            </View>
            <Image source={require('../../assets/images/driver.png')} style={styles.activeTripAvatar} />
          </View>
          <View style={styles.activeTripMetaRow}>
            <View style={styles.activeTripMetaBlock}>
              <Text style={styles.activeTripMetaLabel}>رقم الرحلة</Text>
              <Text style={styles.activeTripMetaValue}>#{rideDriver.id || '—'}</Text>
            </View>
            <View style={styles.activeTripMetaBlock}>
              <Text style={styles.activeTripMetaLabel}>زمن الوصول</Text>
              <Text style={styles.activeTripMetaValue}>{rideDriver.etaMinutes ? `${rideDriver.etaMinutes}:00` : '00:00'}</Text>
            </View>
            <View style={styles.activeTripStatusPill}>
              <Text style={styles.activeTripStatusText}>
                {rideStatus === 'en_route' ? 'في الطريق' : rideStatus === 'completed' ? 'مكتمل' : 'في انتظار السائق'}
              </Text>
            </View>
          </View>
          <View style={styles.activeTripActions}>
            <TouchableOpacity style={styles.activeTripCallBtn} activeOpacity={0.9} onPress={() => handleCallDriver('phone')}>
              <FontAwesome5 name="phone-alt" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.activeTripNote}>يرجى البقاء في مكان السيارة حتى وصول السائق</Text>
        </View>
      )}

      {/* Destination Picker Sheet */}
      {destinationSheetVisible && (
        <Animated.View
          style={[styles.destSheet, { height: destSheetHeight, transform: [{ translateY: destTranslateY }] }]}
        >
          <View style={styles.destHandleContainer}>
            <View style={styles.destHandle} />
          </View>
          <View style={styles.destHeader}>
            <Text style={styles.destTitle}>اختر الوجهة</Text>
            <TouchableOpacity onPress={closeDestinationSheet} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.destClose}>إغلاق</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.destSearchRow}>
            <View style={styles.destSearchInputWrap}>
              <Octicons name="search" size={18} color={COLORS.LightTextColor} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.destSearchInput}
                placeholder="ابحث عن وجهة"
                placeholderTextColor={COLORS.ExtraLightTextColor}
                value={selectionTarget === 'start' ? startName : destinationName}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </View>
          </View>
          {searchResults.length > 0 && (
            <ScrollView style={styles.destSuggestions} keyboardShouldPersistTaps="handled">
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={styles.destSuggestionRow}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Text style={styles.destSuggestionMain} numberOfLines={1}>
                    {item.structured_formatting?.main_text || item.description || ''}
                  </Text>
                  {item.structured_formatting?.secondary_text ? (
                    <Text style={styles.destSuggestionSecondary} numberOfLines={1}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <View style={styles.destMapHolder}>
            <MapView
              ref={destMapRef}
              style={{ flex: 1 }}
              region={mapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              onPress={handleMapPress}
              showsUserLocation
            />
            <View style={styles.destPinOverlay} pointerEvents="none">
              <FontAwesome5 name="map-marker-alt" size={28} color={COLORS.primary} />
              <View style={styles.destPinShadow} />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.destConfirmButton, confirmingDestination && { opacity: 0.7 }]}
            activeOpacity={0.85}
            disabled={confirmingDestination}
            onPress={confirmDestination}
          >
            <Text style={styles.destConfirmText}>{confirmingDestination ? 'جاري التأكيد...' : 'تأكيد الوجهة'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      </View>
    </TouchableWithoutFeedback>
  );
};


export default Home;

// moved sheet styles to styles/user/homepage.styles.js