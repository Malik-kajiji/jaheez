import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useSubscriptions } from '../hooks/useSubscriptions'
import '../styles/subscriptions.scss'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'

export const Subscriptions = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const {
        subscriptions,
        isLoading,
        currentPage,
        totalPages,
        stats,
        fetchSubscriptions,
        fetchSubscriptionsByStatus,
        searchSubscriptions,
        deleteSubscription,
        updateSubscriptionStatus
    } = useSubscriptions()
    
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deleteLoading, setDeleteLoading] = useState('')

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
    }, [user])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            searchSubscriptions(searchTerm)
        } else {
            fetchSubscriptions()
        }
    }

    const handleStatusFilter = (status) => {
        setStatusFilter(status)
        if (status === 'all') {
            fetchSubscriptions()
        } else {
            fetchSubscriptionsByStatus(status)
        }
    }

    const handleDelete = async (subscriptionId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) {
            return
        }
        
        setDeleteLoading(subscriptionId)
        try {
            await deleteSubscription(subscriptionId)
        } catch (error) {
            console.error('Error deleting subscription:', error)
        } finally {
            setDeleteLoading('')
        }
    }

    const handleStatusChange = async (subscriptionId, newStatus) => {
        if (!window.confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟')) {
            return
        }
        
        try {
            await updateSubscriptionStatus(subscriptionId, newStatus)
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'active': 'نشط',
            'expired': 'منتهي',
            'cancelled': 'ملغي'
        }
        return statusMap[status] || status
    }

    const getRemainingDays = (endDate) => {
        const now = new Date()
        const end = new Date(endDate)
        const diff = end - now
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-LY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <section className='container subscriptions'>
                <div className="loading">جاري التحميل...</div>
            </section>
        )
    }

    return (
        <section className='container subscriptions'>
            {/* <div className="header">
                <div className="title">
                    <h1 className="TXT-heading color-normal">الإشتراكات</h1>
                    <p className="TXT-normal color-light">إدارة اشتراكات المستخدمين</p>
                </div>
            </div> */}

            {stats && (
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>إجمالي الاشتراكات</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card active">
                        <h3>الاشتراكات النشطة</h3>
                        <p className="stat-value">{stats.active}</p>
                    </div>
                    <div className="stat-card expired">
                        <h3>الاشتراكات المنتهية</h3>
                        <p className="stat-value">{stats.expired}</p>
                    </div>
                    <div className="stat-card cancelled">
                        <h3>الاشتراكات الملغية</h3>
                        <p className="stat-value">{stats.cancelled}</p>
                    </div>
                </div>
            )}

            <div className="filters-section">
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="ابحث برقم الهاتف أو اسم المستخدم..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">
                        <FaSearch />
                    </button>
                </form>

                <div className="status-filters">
                    <button 
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleStatusFilter('all')}
                    >
                        الكل
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => handleStatusFilter('active')}
                    >
                        نشط
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'expired' ? 'active' : ''}`}
                        onClick={() => handleStatusFilter('expired')}
                    >
                        منتهي
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => handleStatusFilter('cancelled')}
                    >
                        ملغي
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="subscriptions-table">
                    <thead>
                        <tr>
                            <th>اسم المستخدم</th>
                            <th>رقم الهاتف</th>
                            <th>اسم الباقة</th>
                            <th>السعر</th>
                            <th>المدة</th>
                            <th>تاريخ البدء</th>
                            <th>تاريخ الانتهاء</th>
                            <th>الأيام المتبقية</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map(subscription => (
                            <tr key={subscription._id}>
                                <td>{subscription.userName}</td>
                                <td dir='ltr'>{subscription.userPhoneNumber}</td>
                                <td>{subscription.packageName}</td>
                                <td>
                                    <span className="price">{subscription.packagePrice} دينار</span>
                                </td>
                                <td>{subscription.packagePeriod} يوم</td>
                                <td>{formatDate(subscription.startDate)}</td>
                                <td>{formatDate(subscription.endDate)}</td>
                                <td>
                                    {subscription.status === 'active' ? (
                                        <span className="remaining-days">
                                            {getRemainingDays(subscription.endDate)} يوم
                                        </span>
                                    ) : '-'}
                                </td>
                                <td>
                                    <span className={`status-badge ${subscription.status}`}>
                                        {getStatusText(subscription.status)}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        {subscription.status === 'active' && (
                                            <button 
                                                className="cancel-btn"
                                                onClick={() => handleStatusChange(subscription._id, 'cancelled')}
                                                title="إلغاء الاشتراك"
                                            >
                                                إلغاء
                                            </button>
                                        )}
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(subscription._id)}
                                            disabled={deleteLoading === subscription._id}
                                            title="حذف الاشتراك"
                                        >
                                            {deleteLoading === subscription._id ? (
                                                <span className="loading-spinner"></span>
                                            ) : (
                                                <FaTrash />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => fetchSubscriptions(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </button>
                    <span>صفحة {currentPage} من {totalPages}</span>
                    <button 
                        onClick={() => fetchSubscriptions(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </button>
                </div>
            )}
        </section>
    )
}

export default Subscriptions