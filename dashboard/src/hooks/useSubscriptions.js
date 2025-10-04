import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    const fetchSubscriptions = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSubscriptions(json.subscriptions);
            setTotalPages(json.pages);
            setCurrentPage(page);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubscriptionsByStatus = async (status, page = 1) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions/status?status=${status}&page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSubscriptions(json.subscriptions);
            setTotalPages(json.pages);
            setCurrentPage(page);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const searchSubscriptions = async (searchTerm) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions/search?search=${searchTerm}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSubscriptions(json.subscriptions);
            setTotalPages(json.pages);
            setCurrentPage(1);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const createSubscription = async (subscriptionData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscriptionData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم إنشاء الاشتراك بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    const updateSubscriptionStatus = async (subscriptionId, status) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update the subscription in the local state
            setSubscriptions(prevSubs => prevSubs.map(sub => 
                sub._id === subscriptionId ? { ...sub, status } : sub
            ));

            dispatch(alertActions.showAlert({ msg: 'تم تحديث حالة الاشتراك بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    const deleteSubscription = async (subscriptionId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions/${subscriptionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Remove the subscription from local state
            setSubscriptions(prevSubs => prevSubs.filter(sub => sub._id !== subscriptionId));

            dispatch(alertActions.showAlert({ msg: 'تم حذف الاشتراك بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    const fetchSubscriptionStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/subscriptions/stats`, {
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

    useEffect(() => {
        if (user?.token) {
            fetchSubscriptions();
            fetchSubscriptionStats();
        }
    }, [user]);

    return {
        subscriptions,
        isLoading,
        currentPage,
        totalPages,
        stats,
        fetchSubscriptions,
        fetchSubscriptionsByStatus,
        searchSubscriptions,
        createSubscription,
        updateSubscriptionStatus,
        deleteSubscription,
        fetchSubscriptionStats
    };
};