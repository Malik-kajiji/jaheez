import { useDispatch, useSelector } from 'react-redux'
import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { driverActions } from '../redux/driverState'
import { useRouter } from 'expo-router'

const useSubscriptions = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const driver = useSelector(state => state.driverController.driver)
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL
    const { logOut, login, updateDriver } = driverActions
    const [isRedeemLoading, setIsRedeemLoading] = useState(false)
    const [packages, setPackages] = useState([])
    const [isPackagesLoading, setIsPackagesLoading] = useState(false)
    const [subscription, setSubscription] = useState(null)
    const [isStatusLoading, setIsStatusLoading] = useState(false)
    const [isStartLoading, setIsStartLoading] = useState(false)
    const [scheduledSubscription, setScheduledSubscription] = useState(null)

    const handleUnauthorized = useCallback(async (msg = 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا') => {
        await AsyncStorage.removeItem('loginInfo')
        await AsyncStorage.removeItem('expoToken')
        dispatch(logOut())
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'تم تسجيل الخروج', textBody: msg })
        router.replace('/')
    }, [dispatch, logOut, router])

    const formatDuration = (days = 0) => {
        const safeDays = Number.isFinite(days) ? days : 0
        return `${safeDays} يوم`
    }

    const formatPriceLabel = (pkg) => {
        const durationLabel = formatDuration(pkg?.durationInDays)
        const hasDiscount = pkg?.isThereDiscount && pkg?.priceAfterDiscount
        if (hasDiscount) {
            return {
                current: `${pkg.priceAfterDiscount} د.ل / ${durationLabel}`,
                original: `${pkg?.price || 0} د.ل`,
            }
        }
        return { current: `${pkg?.price || 0} د.ل / ${durationLabel}` }
    }

    const deriveBadgeImage = (pkg) => pkg?.packageImage || ''

    const defaultDescription = [
        'يحصل مقدم الخدمة على الاشتراكات الشهرية مقابل مبلغ محدد.',
        'خصم الرسوم تلقائياً عند الاشتراك.',
        'الاشتراك في الباقة يلغي خصم 10% من كل رحلة.',
    ]

    const mapPackageToPlan = (pkg) => {
        const priceLabel = formatPriceLabel(pkg)
        const priceValue = (pkg?.isThereDiscount && pkg?.priceAfterDiscount) ? pkg.priceAfterDiscount : (pkg?.price || 0)
        return {
            id: pkg?._id,
            title: pkg?.name,
            price: priceLabel.current,
            originalPrice: priceLabel.original,
            priceValue,
            status: pkg?.statusText || 'متاح',
            statusTone: pkg?.statusTone || 'info',
            description: pkg?.description?.length ? pkg.description : defaultDescription,
            cta: pkg?.ctaText || 'اشتراك الان',
            badgeImage: deriveBadgeImage(pkg),
            badge: pkg?.badgeLabel || '',
        }
    }

    const getAuthToken = useCallback(async () => {
        const loginInfo = await AsyncStorage.getItem('loginInfo')
        return driver?.token || JSON.parse(loginInfo || '{}')?.token
    }, [driver?.token])

    const fetchPackages = useCallback(async () => {
        setIsPackagesLoading(true)
        try {
            const storageToken = await getAuthToken()
            if (!storageToken) {
                throw new Error('الرجاء تسجيل الدخول')
            }

            const res = await fetch(`${BACKEND_URL}/api/driver/subscription/packages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${storageToken}`,
                },
            })

            const json = await res.json()
            if (res.status === 401) {
                await handleUnauthorized(json?.error || json?.message)
                return
            }
            if (!res.ok) {
                throw new Error(json?.message || 'تعذر جلب الباقات')
            }

            const list = Array.isArray(json) ? json : []
            setPackages(list.map(mapPackageToPlan))
        } catch (err) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'خطأ', textBody: err.message })
        } finally {
            setIsPackagesLoading(false)
        }
    }, [BACKEND_URL, getAuthToken, handleUnauthorized])

    const fetchStatus = useCallback(async () => {
        setIsStatusLoading(true)
        try {
            const storageToken = await getAuthToken()
            if (!storageToken) {
                throw new Error('الرجاء تسجيل الدخول')
            }

            const res = await fetch(`${BACKEND_URL}/api/driver/subscription/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${storageToken}`,
                },
            })

            const json = await res.json()
            if (res.status === 401) {
                await handleUnauthorized(json?.error || json?.message)
                return
            }
            if (!res.ok) {
                throw new Error(json?.message || 'تعذر جلب حالة الاشتراك')
            }

            setSubscription(json?.subscription || null)
            setScheduledSubscription(json?.scheduledSubscription || null)

            dispatch(updateDriver({
                state: json?.driverState ?? driver?.state,
                balance: json?.balance ?? driver?.balance,
                subscription: json?.subscription || null,
                scheduledSubscription: json?.scheduledSubscription || null,
            }))
        } catch (err) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'خطأ', textBody: err.message })
        } finally {
            setIsStatusLoading(false)
        }
    }, [BACKEND_URL, driver?.balance, driver?.state, getAuthToken, handleUnauthorized, dispatch, updateDriver])

    const redeemVoucher = async (voucherCode) => {
        const code = (voucherCode || '').trim()
        if (!code) {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'ملاحظة', textBody: 'الرجاء إدخال رقم القسيمة' })
            return false
        }

        setIsRedeemLoading(true)
        try {
            const storageToken = await getAuthToken()
            if (!storageToken) {
                throw new Error('الرجاء تسجيل الدخول')
            }

            const res = await fetch(`${BACKEND_URL}/api/driver/subscription/voucher/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${storageToken}`,
                },
                body: JSON.stringify({ voucherCode: code }),
            })

            const json = await res.json()
            if (res.status === 401) {
                await handleUnauthorized(json?.error || json?.message)
                return false
            }
            if (!res.ok) {
                throw new Error(json?.message || 'تعذر شحن الرصيد')
            }

            const updatedBalance = json?.balance ?? driver?.balance ?? 0
            dispatch(login({ ...driver, balance: updatedBalance, token: storageToken, subscription }))

            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'تم الشحن', textBody: json?.message || 'تم شحن الرصيد بنجاح' })
            return true
        } catch (err) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'خطأ', textBody: err.message })
            return false
        } finally {
            setIsRedeemLoading(false)
        }
    }

    const startSubscription = useCallback(async (packageId, startFrom = 'now') => {
        if (!packageId) {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'ملاحظة', textBody: 'الرجاء اختيار الباقة' })
            return false
        }

        setIsStartLoading(true)
        try {
            const storageToken = await getAuthToken()
            if (!storageToken) {
                throw new Error('الرجاء تسجيل الدخول')
            }

            const res = await fetch(`${BACKEND_URL}/api/driver/subscription/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${storageToken}`,
                },
                body: JSON.stringify({ packageId, startFrom }),
            })

            const json = await res.json()
            if (res.status === 401) {
                await handleUnauthorized(json?.error || json?.message)
                return false
            }
            if (!res.ok) {
                throw new Error(json?.message || 'تعذر تفعيل الاشتراك')
            }

            const newSub = json?.subscription || null
            const newScheduled = json?.scheduledSubscription || null
            setSubscription(newSub)
            setScheduledSubscription(newScheduled)
            dispatch(updateDriver({
                state: json?.driverState ?? driver?.state,
                balance: json?.balance ?? driver?.balance,
                subscription: newSub,
                scheduledSubscription: newScheduled,
                token: storageToken,
            }))

            Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'تم الاشتراك', textBody: json?.message || 'تم تفعيل الاشتراك بنجاح' })
            return true
        } catch (err) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'خطأ', textBody: err.message })
            return false
        } finally {
            setIsStartLoading(false)
        }
    }, [BACKEND_URL, dispatch, driver?.balance, driver?.state, getAuthToken, handleUnauthorized, subscription, updateDriver])

    return {
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
    }
}

export default useSubscriptions
