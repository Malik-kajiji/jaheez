import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { COLORS, FONT, SIZES } from '../constants/constants';
import useLogin from '../hooks/useLogin';

const MENU_WIDTH = 260;

const SideMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { handleLogOut } = useLogin();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const slideX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const openMenu = useCallback(() => {
    setIsMounted(true);
    setIsOpen(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [slideX]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    Animated.timing(slideX, {
      toValue: -MENU_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsMounted(false);
    });
  }, [slideX]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  useEffect(() => {
    const subToggle = DeviceEventEmitter.addListener('userMenu:toggle', toggleMenu);
    const subClose = DeviceEventEmitter.addListener('userMenu:close', closeMenu);
    return () => {
      subToggle.remove();
      subClose.remove();
    };
  }, [toggleMenu, closeMenu]);

  const navigateTo = useCallback((target) => {
    const go = () => {
        const fullPathname = '/(user)'+ pathname;
      const homePath = '/(user)/home';

      // If already on the target, do nothing beyond closing the menu
      if (fullPathname === target) {
        return;
      }else {
          if (target === homePath) {
              router.back();
            return;
          }else {
            if (fullPathname === homePath) {
                router.push(target);
            } else {
                router.replace(target);
            }
          }
      }

    };
    setTimeout(go, 140);
  }, [pathname, router]);

  // Always close drawer when route changes (e.g., coming back to home)
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  const menuItems = useMemo(() => ([
    { key: 'home', label: 'الرئيسية', icon: 'home', action: () => navigateTo('/(user)/home') },
    { key: 'trips', label: 'رحلاتي', icon: 'route', action: () => navigateTo('/(user)/trips') },
    { key: 'profile', label: 'حسابي', icon: 'user', action: () => navigateTo('/(user)/profile') },
    { key: 'report', label: 'إرسال بلاغ', icon: 'file-alt', action: () => navigateTo('/(user)/report') },
    { key: 'logout', label: 'تسجيل الخروج', icon: 'sign-out-alt', action: handleLogOut },
  ]), [navigateTo, handleLogOut]);

  if (!isMounted) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.layer]} pointerEvents={isMounted ? 'auto' : 'none'}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeMenu} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideX }] }]}
        pointerEvents="auto"
      >
        <Text style={styles.menuTitle}>القائمة</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => { closeMenu(); item.action(); }}
          >
            <View style={styles.iconWrap}>
              <FontAwesome5 name={item.icon} size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <FontAwesome5 name="chevron-left" size={14} color={COLORS.LightTextColor} />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  layer: {
    zIndex: 400,
    elevation: 400,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: COLORS.bgColor,
    paddingTop: 60,
    paddingHorizontal: 18,
    // borderTopRightRadius: 18,
    // borderBottomRightRadius: 18,
    // shadowColor: '#000',
    // shadowOpacity: 0.12,
    // shadowRadius: 12,
    // elevation: 12,
    zIndex: 410,
    elevation: 410,
  },
  menuTitle: {
    fontFamily: FONT.GE_SS_Bold,
    fontSize: SIZES.large,
    color: COLORS.DarkTextColor,
    textAlign: 'left',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.GE_SS_Light,
    fontSize: SIZES.medium,
    color: COLORS.DarkTextColor,
  },
});

export default SideMenu;
