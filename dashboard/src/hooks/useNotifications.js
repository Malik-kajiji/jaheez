import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Get all notifications with filters
    const fetchNotifications = async (notificationType = 'all') => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (notificationType && notificationType !== 'all') {
                params.append('notificationType', notificationType);
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/notifications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setNotifications(json);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    // Get notification statistics
    const fetchNotificationStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/notifications/stats`, {
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

    // Create and send a new notification
    const sendNotification = async (notificationData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ 
                msg: `تم إرسال الإشعار بنجاح إلى ${json.sentTo} مستخدم`, 
                type: 'success' 
            }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Delete a notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Remove the notification from local state
            setNotifications(prevNotifications => 
                prevNotifications.filter(notification => notification._id !== notificationId)
            );

            dispatch(alertActions.showAlert({ msg: 'تم حذف الإشعار بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchNotifications();
            fetchNotificationStats();
        }
    }, [user]);

    return {
        notifications,
        stats,
        isLoading,
        fetchNotifications,
        fetchNotificationStats,
        sendNotification,
        deleteNotification
    };
};