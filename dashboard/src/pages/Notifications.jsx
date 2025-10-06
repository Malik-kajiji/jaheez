import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { SendNotificationModal } from '../components/SendNotificationModal';
import '../styles/notifications.scss';
import { FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaUser, FaCar } from 'react-icons/fa';

export const Notifications = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const {
        notifications,
        stats,
        isLoading,
        fetchNotifications,
        deleteNotification
    } = useNotifications();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteLoading, setDeleteLoading] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user]);

    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        fetchNotifications(type);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchNotifications(typeFilter);
    };

    const handleDelete = async (notificationId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
            return;
        }

        setDeleteLoading(notificationId);
        try {
            await deleteNotification(notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setDeleteLoading('');
        }
    };

    const getTypeText = (type) => {
        return type === 'for-users' ? 'للمستخدمين' : 'للسائقين';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-LY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <section className='container notifications'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    return (
        <section className='container notifications'>
            <div className="header">
                <div className="title">
                    <h1 className="TXT-heading color-normal">الإشعارات</h1>
                    <p className="TXT-normal color-light">إدارة وإرسال الإشعارات</p>
                </div>
                <button 
                    className="create-btn"
                    onClick={handleOpenModal}
                >
                    <FaPlus />
                    <span>إنشاء إشعار</span>
                </button>
            </div>

            {stats && (
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>إجمالي الإشعارات</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card successful">
                        <h3>الإشعارات الناجحة</h3>
                        <p className="stat-value">{stats.successful}</p>
                    </div>
                    <div className="stat-card failed">
                        <h3>الإشعارات الفاشلة</h3>
                        <p className="stat-value">{stats.failed}</p>
                    </div>
                    <div className="stat-card users">
                        <h3>للمستخدمين</h3>
                        <p className="stat-value">{stats.forUsers}</p>
                    </div>
                    <div className="stat-card drivers">
                        <h3>للسائقين</h3>
                        <p className="stat-value">{stats.forDrivers}</p>
                    </div>
                </div>
            )}

            <div className="filters-section">
                <div className="type-filters">
                    <button 
                        className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleTypeFilter('all')}
                    >
                        الكل
                    </button>
                    <button 
                        className={`filter-btn ${typeFilter === 'for-users' ? 'active' : ''}`}
                        onClick={() => handleTypeFilter('for-users')}
                    >
                        للمستخدمين
                    </button>
                    <button 
                        className={`filter-btn ${typeFilter === 'for-drivers' ? 'active' : ''}`}
                        onClick={() => handleTypeFilter('for-drivers')}
                    >
                        للسائقين
                    </button>
                </div>
            </div>

            <div className="notifications-grid">
                {notifications.map(notification => (
                    <div key={notification._id} className="notification-card">
                        <div className="card-header">
                            <div className="type-badge">
                                {notification.notificationType === 'for-users' ? <FaUser /> : <FaCar />}
                                <span>{getTypeText(notification.notificationType)}</span>
                            </div>
                            <div className="status-icon">
                                {notification.isSuccessful ? (
                                    <FaCheckCircle className="success" />
                                ) : (
                                    <FaTimesCircle className="failed" />
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            <h3 className="notification-title">{notification.title}</h3>
                            <p className="notification-body">{notification.body}</p>

                            {notification.isForOneUser && (
                                <div className="target-user">
                                    <h4>المستلم:</h4>
                                    <p className="user-name">{notification.userName}</p>
                                    <p className="user-phone">{notification.userPhoneNumber}</p>
                                </div>
                            )}

                            <div className="date-info">
                                <span className="date-label">تاريخ الإرسال:</span>
                                <span className="date-value">{formatDate(notification.createdAt)}</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(notification._id)}
                                disabled={deleteLoading === notification._id}
                            >
                                {deleteLoading === notification._id ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    <>
                                        <FaTrash />
                                        <span>حذف</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <SendNotificationModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </section>
    );
};

export default Notifications;