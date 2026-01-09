import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useSelector } from 'react-redux';
import DriverSideMenu from '../../driverComponents/DriverSideMenu';
import styles from '../../styles/driver/subscriptionManagement.styles.js';
import useSubscriptions from '../../driverHooks/useSubscriptions';


const DriverSubscriptionManagement = () => {
  const driver = useSelector((state) => state.driverController.driver);
  const {
    redeemVoucher,
    isRedeemLoading,
    fetchPackages,
    packages,
    isPackagesLoading,
    fetchStatus,
    subscription,
    scheduledSubscription,
    isStatusLoading,
    startSubscription,
    isStartLoading,
  } = useSubscriptions();

  const balanceValue = driver?.balance !== undefined ? `${driver.balance} د.ل` : '0 د.ل';
  const currentPlanName = subscription?.packageName || 'لا يوجد اشتراك';
  const planDaysTotal = subscription?.packagePeriod || 0;
  const remainingDays = subscription?.remainingDays || 0;
  const planDaysUsed = planDaysTotal ? Math.max(0, planDaysTotal - remainingDays) : 0;
  const planProgressRatio = planDaysTotal ? Math.max(0, Math.min(1, planDaysUsed / planDaysTotal)) : 0;
  const planProgressLabel = planDaysTotal ? `${planDaysUsed} / ${planDaysTotal}` : '0 / 0';
  const circleSize = 190;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - planProgressRatio);
  const [isTopUpVisible, setIsTopUpVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [confirmVoucherCode, setConfirmVoucherCode] = useState('');

  useEffect(() => {
    fetchPackages();
    fetchStatus();
  }, [fetchPackages, fetchStatus]);

  const plans = packages.length ? packages : [];
  const selectedPlanId = scheduledSubscription?.packageId || subscription?.packageId || null;

  const handleSubscribePress = (plan) => {
    setPendingPlan(plan);
    setIsConfirmVisible(true);
  };

  const closeConfirm = () => {
    setIsConfirmVisible(false);
    setPendingPlan(null);
  };

  const handleConfirmStart = async (startFrom = 'now') => {
    if (!pendingPlan) return;
    const success = await startSubscription(pendingPlan.id, startFrom);
    if (success) {
      closeConfirm();
    }
  };

  const handleApplyConfirmVoucher = async () => {
    if (!confirmVoucherCode.trim()) return;
    const success = await redeemVoucher(confirmVoucherCode.trim());
    if (success) {
      setConfirmVoucherCode('');
    }
  };

  return (
    <View style={styles.container}>
      <DriverSideMenu />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#ff7a1a', '#ff4d2e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroCard}>
          <View style={styles.heroCircles}>
            <View style={styles.circle}>
              <View style={styles.circleInner}>
                <Text style={styles.circleLabelBalance}>رصيدك الحالي</Text>
                <Text style={styles.circleValueBalance}>{balanceValue}</Text>
              </View>
            </View>
            <View style={styles.circle}>
              <View style={styles.progressWrap}>
                <Svg width={circleSize} height={circleSize} pointerEvents="none">
                  <Defs>
                    <SvgLinearGradient id="planProgress" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#ffe0b2" stopOpacity="0.9" />
                      <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    stroke="rgba(255,255,255,0.2)"
                    fill="none"
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                  />
                  <Circle
                    stroke="url(#planProgress)"
                    fill="none"
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                  />
                </Svg>
              </View>
              <View style={styles.circleInner}>
                <Text style={styles.circleLabelSub}>{currentPlanName}</Text>
                <Text style={styles.circleValueSub}>{planProgressLabel}</Text>
                <Text style={styles.circleValueSub}>يوم</Text>
                {isStatusLoading ? <Text style={styles.circleLabelSub}>...جاري التحقق</Text> : null}
              </View>
            </View>
          </View>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabButton, styles.tabButtonActive, styles.singleTab]}
              activeOpacity={0.9}
              onPress={() => setIsTopUpVisible(true)}
            >
              <Text style={[styles.tabText, styles.tabTextActive]}>شحن الرصيد</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>اختيار الباقة</Text>

        <View style={styles.cardsArea}>
          {isPackagesLoading && !packages.length ? (
            <Text style={styles.footerNote}>...جاري تحميل الباقات</Text>
          ) : null}
          {!isPackagesLoading && !plans.length ? (
            <Text style={styles.footerNote}>لا توجد باقات متاحة حاليًا</Text>
          ) : null}
          {plans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <LinearGradient colors={['#ff7a1a', '#ff4d2e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.planGradient}>
                <View style={styles.planContent}>
                  <View style={styles.topCard}>
                    <Text style={styles.planTitle}>{plan.title}</Text>

                  </View>
                  <View style={styles.cardContentHolder}>
                     <View style={styles.planRight}>
                      {plan.originalPrice ? (
                        <View style={styles.planPriceRow}>
                          <Text style={styles.planPriceOriginal}>{plan.originalPrice}</Text>
                          <Text style={styles.planPrice}>{plan.price}</Text>
                        </View>
                      ) : (
                        <Text style={styles.planPrice}>{plan.price}</Text>
                      )}
                      {plan.description.map((line, idx) => (
                        <View key={idx} style={styles.planDescRow}>
                          <View style={styles.planDescBullet} />
                          <Text style={styles.planDesc}>{line}</Text>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                        onPress={() => {
                          const isSelected = selectedPlanId === plan.id;
                          if (isSelected) return;
                          handleSubscribePress({ ...plan, isCurrent: isSelected });
                        }}
                        disabled={isStartLoading || selectedPlanId === plan.id}
                      >
                        <Text style={styles.ctaText}>
                          {selectedPlanId === plan.id
                            ? 'الباقة الحالية'
                            : (isStartLoading ? '...جاري التفعيل' : plan.cta)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.planLeft}>
                      {plan.badgeImage ? (
                        <Image source={{ uri: plan.badgeImage }} style={styles.planIconImage} resizeMode="contain" />
                      ) : (
                        <LinearGradient colors={['#ffb347', '#ff7a1a']} style={styles.planIconWrap}>
                          <Text style={styles.planIconText}>{plan.badge}</Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        <Text style={styles.footerNote}>تخصم رسوم الاشتراكات من المحفظة تلقائيًا</Text>
      </ScrollView>

      <Modal visible={isTopUpVisible} transparent animationType="fade" onRequestClose={() => setIsTopUpVisible(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>أدخل رقم القسيمة</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="مثال 1234567890"
                  placeholderTextColor="#b3b3b3"
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  textAlign="right"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setIsTopUpVisible(false)}>
                    <Text style={styles.modalButtonSecondaryText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary, isRedeemLoading && { opacity: 0.6 }]}
                    onPress={async () => {
                      const success = await redeemVoucher(voucherCode);
                      if (success) {
                        setVoucherCode('');
                        setIsTopUpVisible(false);
                      }
                    }}
                    disabled={isRedeemLoading}
                  >
                    <Text style={styles.modalButtonPrimaryText}>{isRedeemLoading ? '...جاري الشحن' : 'تأكيد الشحن'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isConfirmVisible} transparent animationType="fade" onRequestClose={closeConfirm}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>تأكيد الاشتراك</Text>
                <Text style={styles.modalDescription}>
                  {subscription
                    ? 'أنت مشترك حالياً. هل ترغب ببدء الباقة الجديدة الآن أم بعد انتهاء الباقة الحالية؟'
                    : 'هل أنت متأكد من الاشتراك في هذه الباقة؟'}
                </Text>
                {pendingPlan ? (
                  <Text style={styles.modalDescription}>المبلغ المستحق: <Text style={styles.modalDescriptionNumber}>{pendingPlan.priceValue}</Text> د.ل</Text>
                ) : null}
                {/* <TextInput
                  style={styles.modalInput}
                  placeholder="أدخل رقم القسيمة (اختياري)"
                  placeholderTextColor="#b3b3b3"
                  value={confirmVoucherCode}
                  onChangeText={setConfirmVoucherCode}
                  textAlign="right"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary, isRedeemLoading && { opacity: 0.6 }]}
                  onPress={handleApplyConfirmVoucher}
                  disabled={isRedeemLoading}
                >
                  <Text style={styles.modalButtonPrimaryText}>{isRedeemLoading ? '...جاري الشحن' : 'تطبيق القسيمة'}</Text>
                </TouchableOpacity> */}
                <View style={styles.modalActions}>
                  {subscription ? (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonPrimary, isStartLoading && { opacity: 0.6 }]}
                        onPress={() => handleConfirmStart('after-current')}
                        disabled={isStartLoading}
                      >
                        <Text style={styles.modalButtonPrimaryText}>{isStartLoading ? '...جاري الجدولة' : 'بعد انتهاء الحالية'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonPrimary, isStartLoading && { opacity: 0.6 }]}
                        onPress={() => handleConfirmStart('now')}
                        disabled={isStartLoading}
                      >
                        <Text style={styles.modalButtonPrimaryText}>{isStartLoading ? '...جاري التفعيل' : 'بدء الآن'}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary, isStartLoading && { opacity: 0.6 }]}
                      onPress={() => handleConfirmStart('now')}
                      disabled={isStartLoading}
                    >
                      <Text style={styles.modalButtonPrimaryText}>{isStartLoading ? '...جاري التفعيل' : 'تأكيد الاشتراك'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={closeConfirm}>
                  <Text style={styles.modalButtonSecondaryText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default DriverSubscriptionManagement;
