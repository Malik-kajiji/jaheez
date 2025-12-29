import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Keyboard, PanResponder, Platform, findNodeHandle, InteractionManager, UIManager, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import useLogin from './useLogin';

const useOrder = () => {
	const user = useSelector((state) => state.userController.user);
	const router = useRouter();
	const { verifyUserByCode, handleResendMessage } = useLogin();

	const PRICE_STEP = 5;
	const lastSelectionSource = useRef('manual'); // 'manual' | 'search'

	// request type state: 'self' | 'other'
	const [requestType, setRequestType] = useState('self');
	const REQUEST_WIDTH = 300; // must match styles.requestTypeContainer width
	const OPTION_WIDTH = REQUEST_WIDTH / 2;
	const slideAnim = useRef(new Animated.Value(requestType === 'other' ? 0 : OPTION_WIDTH)).current;

	const handleSetRequestType = (type) => {
		setRequestType(type);
		if (type === 'self') {
			setStartLocationSelected(true);
			setStartCoord(userLocation || null);
			setStartName('');
		} else {
			setStartLocationSelected(false);
			setStartCoord(null);
			setStartName('');
		}
		const toValue = type === 'other' ? 0 : OPTION_WIDTH;
		Animated.timing(slideAnim, { toValue, duration: 220, useNativeDriver: true }).start();
	};

	// Bottom sheet state
	const screenHeight = Dimensions.get('window').height;
	const SHEET_HEIGHT = Math.round(screenHeight * 0.6); // 60% of screen
	const VISIBLE_WHEN_CLOSED = Math.round(screenHeight * 0.2); // 20% stays visible when closed
	const CLOSED_TRANSLATE = SHEET_HEIGHT - VISIBLE_WHEN_CLOSED; // how far down the sheet sits when "closed"
	const HIDDEN_TRANSLATE = SHEET_HEIGHT + 120; // fully off-screen when hiding for offers
	const translateY = useRef(new Animated.Value(CLOSED_TRANSLATE)).current; // start partially visible
	const panStartY = useRef(CLOSED_TRANSLATE);
	const [sheetOpen, setSheetOpen] = useState(false);
	const INPUT_WIDTH = Math.round(Dimensions.get('window').width - 40);
	const [carType, setCarType] = useState('');
	const [selectedProblemType, setSelectedProblemType] = useState('');
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [startLocationSelected, setStartLocationSelected] = useState(true);
	const [startCoord, setStartCoord] = useState(null);
	const [startName, setStartName] = useState('');
	const [destinationSelected, setDestinationSelected] = useState(false);
	const [destinationName, setDestinationName] = useState('');
	const [pendingCoord, setPendingCoord] = useState({
		latitude: 32.887711,
		longitude: 13.187186,
	});
	const [pendingName, setPendingName] = useState('');
	const [selectionTarget, setSelectionTarget] = useState('destination'); // 'destination' | 'start'
	const [basePrice, setBasePrice] = useState(0);
	const [price, setPrice] = useState(0);
	const [confirmingDestination, setConfirmingDestination] = useState(false);
	const [destinationCoord, setDestinationCoord] = useState({
		latitude: 32.887711,
		longitude: 13.187186,
	});
	const [mapRegion, setMapRegion] = useState({
		latitude: 32.887711,
		longitude: 13.187186,
		latitudeDelta: 0.05,
		longitudeDelta: 0.05,
	});
	const [userLocation, setUserLocation] = useState(null);
	const [personName, setPersonName] = useState('');
	const [personPhone, setPersonPhone] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const searchDebounce = useRef(null);
	const [offersVisible, setOffersVisible] = useState(false);
	const [offers, setOffers] = useState([]);
	const [acceptedOfferId, setAcceptedOfferId] = useState(null);
	const OFFER_COUNTDOWN = 90; // seconds (1:30)
	const [rideStatus, setRideStatus] = useState('idle'); // idle | awaiting | en_route | completed
	const [rideDriver, setRideDriver] = useState(null);
	const [driverSelected, setDriverSelected] = useState(false);

	useEffect(() => {
		const hasDriver = Boolean(acceptedOfferId) || rideStatus === 'en_route' || rideStatus === 'completed' || Boolean(rideDriver);
		setDriverSelected(hasDriver);
	}, [acceptedOfferId, rideDriver, rideStatus]);

	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

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

	const hideSheetFully = () => {
		Animated.timing(translateY, { toValue: HIDDEN_TRANSLATE, duration: 240, useNativeDriver: true }).start(() => {
			setSheetOpen(false);
		});
	};

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: () => {
				translateY.stopAnimation((val) => { panStartY.current = typeof val === 'number' ? val : CLOSED_TRANSLATE; });
			},
			onPanResponderMove: (evt, gestureState) => {
				const next = panStartY.current + gestureState.dy;
				const clamped = Math.max(0, Math.min(CLOSED_TRANSLATE, next));
				translateY.setValue(clamped);
			},
			onPanResponderRelease: (evt, gestureState) => {
				const endOffset = panStartY.current + gestureState.dy;
				const clamped = Math.max(0, Math.min(CLOSED_TRANSLATE, endOffset));
				const isFlingDown = gestureState.vy > 1 && gestureState.dy > 20;
				const halfway = CLOSED_TRANSLATE * 0.5;
				const shouldClose = isFlingDown || clamped > halfway;
				if (shouldClose) {
					closeSheet();
					return;
				}
				Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
				setSheetOpen(true);
			},
		})
	).current;

	const scrollRef = useRef(null);
	const destMapRef = useRef(null);
	const reverseGeocodeDebounce = useRef(null);
	const skipNextReverseGeocode = useRef(false);
	const isTypingDestination = useRef(false);
	const carInputRef = useRef(null);
	const isCarInputFocused = useRef(false);
	const lastScrollY = useRef(0);
	const [destinationSheetVisible, setDestinationSheetVisible] = useState(false);
	const destSheetHeight = Math.round(screenHeight * 0.7);
	const destTranslateY = useRef(new Animated.Value(destSheetHeight)).current;
	const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

	useEffect(() => {
		if (!user) {
			router.replace('/');
			return;
		}

		if (!user.isVerified) {
			setShowVerificationModal(true);
		}
	}, [user]);

	// request user location once
	useEffect(() => {
		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') return;
				const loc = await Location.getCurrentPositionAsync({});
				if (loc?.coords) {
					const { latitude, longitude } = loc.coords;
					setUserLocation({ latitude, longitude });
					setMapRegion((prev) => ({ ...prev, latitude, longitude }));
					setDestinationCoord({ latitude, longitude });
					setPendingCoord({ latitude, longitude });
				}
			} catch (e) {
				// silently ignore location failures
			}
		})();
	}, []);

	// adjust for keyboard so inputs are not hidden
	useEffect(() => {
		const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const onShow = (e) => {
			const height = e.endCoordinates ? e.endCoordinates.height : 250;
			setKeyboardHeight(height);
			if (isCarInputFocused.current) {
				setTimeout(scrollToCarInput, 50);
			}
		};
		const onHide = () => setKeyboardHeight(0);

		const showSub = Keyboard.addListener(showEvent, onShow);
		const hideSub = Keyboard.addListener(hideEvent, onHide);

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	const scrollToCarInput = () => {
		try {
			const responder = scrollRef.current?.getScrollResponder?.();
			const target = findNodeHandle(carInputRef.current);
			if (responder && target) {
				responder.scrollResponderScrollNativeHandleToKeyboard(target, 220, true);
				setTimeout(() => {
					responder.scrollResponderScrollNativeHandleToKeyboard(target, 220, true);
				}, 120);
			} else if (scrollRef.current?.scrollTo) {
				scrollRef.current.scrollTo({ y: 9999, animated: true });
			}
		} catch (e) {
			if (scrollRef.current?.scrollTo) {
				scrollRef.current.scrollTo({ y: 9999, animated: true });
			}
		}
	};

	const effectiveStartSelected = requestType === 'self' ? true : startLocationSelected;
	const middleDotActive = effectiveStartSelected && destinationSelected;
	const isFormComplete = requestType === 'self'
		? !!(selectedProblemType && carType.trim().length && destinationSelected)
		: !!(selectedProblemType && carType.trim().length && destinationSelected && startLocationSelected && personName.trim().length && personPhone.trim().length);
	const effectiveStartCoord = requestType === 'self' ? userLocation : startCoord;
	const maxAllowedPrice = basePrice
		? Math.ceil((basePrice * 1.2) / 5) * 5 // round up to next 5
		: 0;
	const minAllowedPrice = basePrice
		? Math.floor((basePrice * 0.8) / 5) * 5 // round down to previous 5
		: 0;
	const canIncreasePrice = !!(basePrice && price < maxAllowedPrice);
	const canDecreasePrice = !!(basePrice && price > minAllowedPrice);

	const haversineDistanceKm = (start, end) => {
		if (!start || !end) return 0;
		const toRad = (deg) => (deg * Math.PI) / 180;
		const R = 6371; // km
		const dLat = toRad(end.latitude - start.latitude);
		const dLon = toRad(end.longitude - start.longitude);
		const lat1 = toRad(start.latitude);
		const lat2 = toRad(end.latitude);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const openDestinationSheet = (target = 'destination') => {
		setSelectionTarget(target);
		setDestinationSheetVisible(true);
		Animated.timing(destTranslateY, { toValue: 0, duration: 260, useNativeDriver: true }).start();
	};

	const closeDestinationSheet = () => {
		Animated.timing(destTranslateY, { toValue: destSheetHeight, duration: 240, useNativeDriver: true }).start(() => {
			setDestinationSheetVisible(false);
		});
	};

	const handleVerify = async (otpCode) => {
		setIsVerifying(true);
		await verifyUserByCode(otpCode, setShowVerificationModal);
		setIsVerifying(false);
	};

	const handleResend = async () => {
		await handleResendMessage();
	};

	const resetToManual = () => {
		lastSelectionSource.current = 'manual';
		setPendingName('');
		setDestinationName('');
		setDestinationSelected(false);
		setSearchResults([]);
	};

	const handleMapPress = (e) => {
		const coord = e.nativeEvent.coordinate;
		if (coord) {
			resetToManual();
			setPendingCoord(coord);
			animateDestRegion({ ...mapRegion, latitude: coord.latitude, longitude: coord.longitude });
		}
	};

	const handleRegionChangeComplete = (region) => {
		if (skipNextReverseGeocode.current) {
			skipNextReverseGeocode.current = false;
			return;
		}
		setMapRegion(region);
		setPendingCoord({ latitude: region.latitude, longitude: region.longitude });
		setDestinationSelected(false);
		if (lastSelectionSource.current === 'search') {
			resetToManual();
		}
		setPendingName('');
		if (isTypingDestination.current) return;
		if (reverseGeocodeDebounce.current) clearTimeout(reverseGeocodeDebounce.current);
		reverseGeocodeDebounce.current = setTimeout(() => {
			resolveAndSetFromCoord({ latitude: region.latitude, longitude: region.longitude });
		}, 150);
	};

	const resolveAddressFromCoord = async (coord) => {
		if (!GOOGLE_MAPS_API_KEY || !coord) return '';
		try {
			const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.latitude},${coord.longitude}&language=ar&key=${GOOGLE_MAPS_API_KEY}`;
			const res = await fetch(url);
			const data = await res.json();
			if (data.status === 'OK' && data.results && data.results.length) {
				return data.results[0].formatted_address || '';
			}
		} catch (e) {
			// ignore
		}
		return '';
	};

	const animateDestRegion = (region) => {
		setMapRegion(region);
		if (destMapRef.current?.animateCamera) {
			destMapRef.current.animateCamera(
				{ center: { latitude: region.latitude, longitude: region.longitude } },
				{ duration: 250 }
			);
		} else {
			destMapRef.current?.animateToRegion(region, 250);
		}
	};

	const runAutocomplete = async (text) => {
		if (!GOOGLE_MAPS_API_KEY) return;
		if (text.trim().length < 2) {
			setSearchResults([]);
			return;
		}
		setSearchLoading(true);
		try {
			const encoded = encodeURIComponent(text.trim());
			const locBias = userLocation ? `&location=${userLocation.latitude},${userLocation.longitude}&radius=50000` : '';
			const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encoded}${locBias}&language=ar&key=${GOOGLE_MAPS_API_KEY}`;
			const res = await fetch(url);
			const data = await res.json();
			if (data.status === 'OK' && data.predictions) {
				setSearchResults(data.predictions);
			} else {
				setSearchResults([]);
			}
		} catch (e) {
			setSearchResults([]);
		} finally {
			setSearchLoading(false);
		}
	};

	const setNameForTarget = (val) => {
		if (selectionTarget === 'start') {
			setStartName(val);
		} else {
			setDestinationName(val);
		}
	};

	const handleSearchChange = (text) => {
		isTypingDestination.current = true;
		setNameForTarget(text);
		setDestinationSelected(false);
		if (selectionTarget === 'start') {
			setStartLocationSelected(false);
		}
		if (searchDebounce.current) clearTimeout(searchDebounce.current);
		searchDebounce.current = setTimeout(() => runAutocomplete(text), 180);
	};

	const handleSelectSuggestion = async (prediction) => {
		if (!prediction) return;
		lastSelectionSource.current = 'search';
		isTypingDestination.current = false;
		Keyboard.dismiss();
		const mainText = prediction.structured_formatting?.main_text || '';
		const secondaryText = prediction.structured_formatting?.secondary_text || '';
		const fallbackName = selectionTarget === 'start' ? startName : destinationName;
		const displayName = prediction.description || (secondaryText ? `${mainText}، ${secondaryText}` : mainText) || fallbackName || '';
		setNameForTarget(displayName);
		setSearchResults([]);
		if (selectionTarget === 'start') {
			setStartLocationSelected(false);
		}
		if (!GOOGLE_MAPS_API_KEY) {
			Alert.alert('مفتاح الخرائط مفقود', 'أضف EXPO_PUBLIC_GOOGLE_MAPS_API_KEY لاستخدام البحث.');
			return;
		}
		try {
			const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&language=ar`;
			const res = await fetch(detailsUrl);
			const data = await res.json();
			const loc = data?.result?.geometry?.location;
			if (loc) {
				const region = {
					latitude: loc.lat,
					longitude: loc.lng,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				};
				setMapRegion(region); // keep state in sync immediately
				setPendingCoord({ latitude: loc.lat, longitude: loc.lng });
				setPendingName(displayName);
				if (selectionTarget === 'start') {
					setStartName(displayName);
				} else {
					setDestinationName(displayName);
				}
				setDestinationSelected(false);
				skipNextReverseGeocode.current = true;
				requestAnimationFrame(() => {
					animateDestRegion(region);
				});
			}
		} catch (e) {
			// ignore
		}
	};

	const handleSearch = async () => {
		isTypingDestination.current = false;
		const activeName = selectionTarget === 'start' ? startName : destinationName;
		if (!activeName.trim()) return;
		if (!GOOGLE_MAPS_API_KEY) {
			Alert.alert('مفتاح الخرائط مفقود', 'أضف EXPO_PUBLIC_GOOGLE_MAPS_API_KEY لاستخدام البحث.');
			return;
		}
		if (searchResults.length) {
			await handleSelectSuggestion(searchResults[0]);
			return;
		}
		try {
			const encoded = encodeURIComponent(activeName.trim());
			const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`;
			const res = await fetch(url);
			const data = await res.json();
			if (data.status === 'OK' && data.results && data.results.length) {
				const loc = data.results[0].geometry.location;
				const formatted = data.results[0].formatted_address;
				const region = {
					latitude: loc.lat,
					longitude: loc.lng,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				};
				setMapRegion(region);
				setPendingCoord({ latitude: loc.lat, longitude: loc.lng });
				setPendingName(formatted || activeName.trim());
				if (selectionTarget === 'start') {
					setStartName(formatted || activeName.trim());
					setStartLocationSelected(false);
				} else {
					setDestinationName(formatted || activeName.trim());
				}
				setDestinationSelected(false);
				skipNextReverseGeocode.current = true;
				requestAnimationFrame(() => {
					animateDestRegion(region);
				});
			} else {
				Alert.alert('لم يتم العثور على الموقع', 'حاول إدخال اسم أكثر دقة.');
			}
		} catch (err) {
			Alert.alert('خطأ في البحث', 'تعذر جلب الموقع. تحقق من الاتصال أو المفتاح.');
		}
	};

	const handleClearDestination = () => {
		isTypingDestination.current = false;
		setDestinationSelected(false);
		setDestinationName('');
		setPendingName('');
		setSearchResults([]);
		if (userLocation) {
			animateDestRegion({
				latitude: userLocation.latitude,
				longitude: userLocation.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			});
			setDestinationCoord({ latitude: userLocation.latitude, longitude: userLocation.longitude });
			setPendingCoord({ latitude: userLocation.latitude, longitude: userLocation.longitude });
		} else {
			animateDestRegion({
				latitude: 32.887711,
				longitude: 13.187186,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			});
			setDestinationCoord({ latitude: 32.887711, longitude: 13.187186 });
			setPendingCoord({ latitude: 32.887711, longitude: 13.187186 });
		}
	};

	const resolveAndSetFromCoord = async (coord) => {
		if (!coord) return;
		const label = await resolveAddressFromCoord(coord);
		if (label) {
			setPendingName(label);
			if (selectionTarget === 'start') {
				setStartName(label);
			} else {
				setDestinationName(label);
			}
		}
	};

	const confirmDestination = async () => {
		setConfirmingDestination(true);
		try {
			const coordToUse = pendingCoord || destinationCoord;
			let label = pendingName || destinationName.trim();

			if (!label) {
				const resolved = await resolveAddressFromCoord(coordToUse);
				label = resolved || destinationName.trim();
			}

			if (!label) {
				label = 'الوجهة المحددة';
			}

			if (selectionTarget === 'start') {
				setStartCoord(coordToUse);
				setStartName(label);
				setStartLocationSelected(true);
			} else {
				setDestinationCoord(coordToUse);
				setDestinationName(label);
				setDestinationSelected(true);
			}
			lastSelectionSource.current = 'manual';
			closeDestinationSheet();
		} finally {
			setConfirmingDestination(false);
		}
	};

		useEffect(() => {
			if (destinationSelected && effectiveStartCoord) {
				const distanceKm = haversineDistanceKm(effectiveStartCoord, destinationCoord);
				const rawBase = Math.round(distanceKm * 20);
				const roundedBase = rawBase > 0 ? Math.ceil(rawBase / 5) * 5 : 0; // ceil to next 5
				setBasePrice(roundedBase);
				setPrice(roundedBase);
			} else {
				setBasePrice(0);
				setPrice(0);
			}
		}, [destinationSelected, destinationCoord, effectiveStartCoord]);

		const increasePrice = () => {
			if (!canIncreasePrice) return;
			setPrice((prev) => {
				const next = (prev || 0) + PRICE_STEP;
				return Math.min(maxAllowedPrice, next);
			});
		};

		const decreasePrice = () => {
			if (!canDecreasePrice) return;
			setPrice((prev) => {
				const next = (prev || 0) - PRICE_STEP;
				return Math.max(minAllowedPrice, next);
			});
		};

		useEffect(() => {
			if (!basePrice) return;
			setPrice((prev) => {
				const current = typeof prev === 'number' ? prev : basePrice;
				return Math.min(maxAllowedPrice, Math.max(minAllowedPrice, current));
			});
		}, [basePrice, maxAllowedPrice, minAllowedPrice]);

		const handleSubmitOrder = () => {
			if (!isFormComplete) {
				Alert.alert('أكمل البيانات', 'يرجى إكمال الحقول قبل إرسال الطلب.');
				return;
			}
			const sampleOffers = [
				{
					id: '1226098',
					driverName: 'حسن حسني',
					plate: '52-XYZ-7',
					price: price || basePrice || 70,
					etaMinutes: 3,
					distanceKm: 0.7,
					timeLeftSeconds: OFFER_COUNTDOWN,
					rating: 4.9,
					avatar: 'https://i.pravatar.cc/120?img=12',
					phone: '+218920000000',
				},
				{
					id: '1226099',
					driverName: 'معتز راشد',
					plate: '81-LAB-3',
					price: (price || basePrice || 70) + 5,
					etaMinutes: 4,
					distanceKm: 0.9,
					timeLeftSeconds: OFFER_COUNTDOWN,
					rating: 4.7,
					avatar: 'https://i.pravatar.cc/120?img=25',
					phone: '+218930000000',
				},
				{
					id: '1226100',
					driverName: 'سالم علي',
					plate: '19-TRP-5',
					price: Math.max((price || basePrice || 70) - 5, minAllowedPrice || 60),
					etaMinutes: 5,
					distanceKm: 1.2,
					timeLeftSeconds: OFFER_COUNTDOWN,
					rating: 4.5,
					avatar: 'https://i.pravatar.cc/120?img=33',
					phone: '+218940000000',
				},
			];
			setOffers(sampleOffers);
			setAcceptedOfferId(null);
			setOffersVisible(true);
			setRideStatus('awaiting');
			hideSheetFully();
			setDriverSelected(false);
		};

		const rejectOffer = (offerId) => {
			setOffers((prev) => {
				const next = prev.filter((o) => o.id !== offerId);
				if (!next.length) {
					setOffersVisible(false);
					setAcceptedOfferId(null);
					setDriverSelected(false);
					closeSheet();
					setRideStatus('idle');
				}
				return next;
			});
		};

		const cancelOffers = () => {
			setOffers([]);
			setOffersVisible(false);
			setAcceptedOfferId(null);
			setDriverSelected(false);
			setRideStatus('idle');
			closeSheet();
		};

		useEffect(() => {
			if (!offersVisible || !offers.length) return undefined;
			const interval = setInterval(() => {
				setOffers((prev) =>
					prev.map((o) => {
						const current = typeof o.timeLeftSeconds === 'number' ? o.timeLeftSeconds : OFFER_COUNTDOWN;
						const next = Math.max(0, current - 1);
						return { ...o, timeLeftSeconds: next };
					})
				);
			}, 1000);
			return () => clearInterval(interval);
		}, [offersVisible, offers.length]);

		const acceptOffer = (offerId) => {
			setAcceptedOfferId(offerId);
			const chosen = offers.find((o) => o.id === offerId) || { id: offerId, driverName: 'السائق', phone: '', etaMinutes: 0 };
			setRideDriver(chosen);
			setRideStatus('awaiting');
			setDriverSelected(true);
			setOffersVisible(false);
			setOffers([]);
			hideSheetFully();
		};

		const handleCallDriver = (mode = 'phone') => {
			if (!rideDriver || !rideDriver.phone) return;
			const raw = `${rideDriver.phone}`.replace(/[^+0-9]/g, '');
			if (!raw) return;
			const url = mode === 'whatsapp'
				? `https://wa.me/${raw.replace('+', '')}`
				: `tel:${raw}`;
			Linking.openURL(url).catch(() => {});
		};

	const mainInitialRegion = userLocation
		? {
				latitude: userLocation.latitude,
				longitude: userLocation.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			}
		: {
				latitude: 32.887711,
				longitude: 13.187186,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421,
			};

	return {
		// user and verification
		user,
		showVerificationModal,
		setShowVerificationModal,
		handleVerify,
		handleResend,
		isVerifying,

		// request type
		requestType,
		handleSetRequestType,
		slideAnim,

		// sheet & layout
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

		// problem and car
		selectedProblemType,
		setSelectedProblemType,
		carType,
		setCarType,

		// destination
		effectiveStartSelected,
		destinationSelected,
		destinationName,
		setDestinationName,
		destinationCoord,
		userLocation,
		handleClearDestination,
		openDestinationSheet,
		setSelectionTarget,
		middleDotActive,
		destinationSheetVisible,
		destSheetHeight,
		destTranslateY,
		closeDestinationSheet,
		handleSearchChange,
		handleSearch,
		searchResults,
		searchLoading,
		handleSelectSuggestion,
		mapRegion,
		handleRegionChangeComplete,
		handleMapPress,
		confirmingDestination,
		confirmDestination,
		isFormComplete,
		price,
		basePrice,
		increasePrice,
		decreasePrice,
		handleSubmitOrder,

		offersVisible,
		offers,
		acceptOffer,
		rejectOffer,
		acceptedOfferId,
		cancelOffers,
		rideStatus,
		rideDriver,
		driverSelected,
		handleCallDriver,

		canIncreasePrice,
		canDecreasePrice,
		personName,
		personPhone,
		setPersonName,
		setPersonPhone,
		startName,
		startCoord,
		startLocationSelected,
		selectionTarget,
		// setSelectionTarget,
		// misc
		mainInitialRegion,
	};
};

export default useOrder;
