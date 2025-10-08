import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Get settings
    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSettings(json);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Update price ranges
    const updatePriceRanges = async (priceRanges) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/price-ranges`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ priceRanges })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSettings(json);
            dispatch(alertActions.showAlert({ msg: 'تم تحديث نطاقات الأسعار بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Update max search range
    const updateMaxSearchRange = async (maxSearchRangeKm) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/max-search-range`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ maxSearchRangeKm })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSettings(json);
            dispatch(alertActions.showAlert({ msg: 'تم تحديث المسافة القصوى بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Update referral prize
    const updateReferralPrize = async (referralPrize) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/referral-prize`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ referralPrize })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSettings(json);
            dispatch(alertActions.showAlert({ msg: 'تم تحديث جائزة الإحالة بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Get all packages
    const fetchPackages = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/packages`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setPackages(json);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Create package
    const createPackage = async (packageData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/packages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(packageData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم إنشاء الباقة بنجاح', type: 'success' }));
            await fetchPackages();
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Update package
    const updatePackage = async (packageId, packageData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/packages/${packageId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(packageData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم تحديث الباقة بنجاح', type: 'success' }));
            await fetchPackages();
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Delete package
    const deletePackage = async (packageId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/settings/packages/${packageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم حذف الباقة بنجاح', type: 'success' }));
            await fetchPackages();
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchSettings();
            fetchPackages();
        }
    }, [user]);

    return {
        settings,
        packages,
        isLoading,
        fetchSettings,
        updatePriceRanges,
        updateMaxSearchRange,
        updateReferralPrize,
        fetchPackages,
        createPackage,
        updatePackage,
        deletePackage
    };
};