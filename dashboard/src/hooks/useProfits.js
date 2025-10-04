import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useProfits = () => {
    const [profits, setProfits] = useState([]);
    const [dailyProfits, setDailyProfits] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Get profits with filters
    const fetchProfits = async (type, startDate, endDate) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profits?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setProfits(json);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    // Get daily profits aggregated
    const fetchDailyProfits = async (type, startDate, endDate) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profits/daily?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setDailyProfits(json);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return [];
        }
    };

    // Get distribution by package or voucher type
    const fetchDistribution = async (type, startDate, endDate) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profits/distribution?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setDistribution(json);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return [];
        }
    };

    // Get profit statistics
    const fetchProfitStats = async (type, startDate, endDate) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profits/stats?${params}`, {
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

    // Create a new profit entry
    const createProfit = async (profitData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profitData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم إضافة الربح بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Fetch all data for a given filter
    const fetchAllData = async (type, startDate, endDate) => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchProfits(type, startDate, endDate),
                fetchDailyProfits(type, startDate, endDate),
                fetchProfitStats(type, startDate, endDate)
            ]);
            
            // Only fetch distribution if type is specified
            if (type && type !== 'all') {
                await fetchDistribution(type, startDate, endDate);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        profits,
        dailyProfits,
        distribution,
        stats,
        isLoading,
        fetchProfits,
        fetchDailyProfits,
        fetchDistribution,
        fetchProfitStats,
        createProfit,
        fetchAllData
    };
};