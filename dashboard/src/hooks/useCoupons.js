import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Get all coupons with sorting and filtering
    const fetchCoupons = async (sortBy = 'newest', state = 'all') => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (sortBy) params.append('sortBy', sortBy);
            if (state && state !== 'all') params.append('state', state);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/coupons?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setCoupons(json);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    // Get coupon statistics
    const fetchCouponStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/coupons/stats`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setStats(json);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Create a new coupon
    const createCoupon = async (couponData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/coupons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(couponData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم إنشاء الكوبون بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Update coupon state
    const updateCouponState = async (couponId, state) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/coupons/${couponId}/state`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update the coupon in the local state
            setCoupons(prevCoupons => prevCoupons.map(coupon => 
                coupon._id === couponId ? { ...coupon, state } : coupon
            ));

            dispatch(alertActions.showAlert({ msg: 'تم تحديث حالة الكوبون بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Delete a coupon
    const deleteCoupon = async (couponId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/coupons/${couponId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Remove the coupon from local state
            setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon._id !== couponId));

            dispatch(alertActions.showAlert({ msg: 'تم حذف الكوبون بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchCoupons();
            fetchCouponStats();
        }
    }, [user]);

    return {
        coupons,
        stats,
        isLoading,
        fetchCoupons,
        fetchCouponStats,
        createCoupon,
        updateCouponState,
        deleteCoupon
    };
};