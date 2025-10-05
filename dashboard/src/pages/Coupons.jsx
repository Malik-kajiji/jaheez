import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCoupons } from '../hooks/useCoupons';
import { AddCouponModal } from '../components/AddCouponModal';
import '../styles/coupons.scss';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export const Coupons = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const {
        coupons,
        stats,
        isLoading,
        fetchCoupons,
        updateCouponState,
        deleteCoupon
    } = useCoupons();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [stateFilter, setStateFilter] = useState('all');
    const [deleteLoading, setDeleteLoading] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user]);

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        fetchCoupons(newSort, stateFilter);
    };

    const handleStateFilter = (newState) => {
        setStateFilter(newState);
        fetchCoupons(sortBy, newState);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchCoupons(sortBy, stateFilter);
    };

    const handleToggleState = async (couponId, currentState) => {
        const newState = currentState === 'active' ? 'paused' : 'active';
        try {
            await updateCouponState(couponId, newState);
        } catch (error) {
            console.error('Error updating coupon state:', error);
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            return;
        }

        setDeleteLoading(couponId);
        try {
            await deleteCoupon(couponId);
        } catch (error) {
            console.error('Error deleting coupon:', error);
        } finally {
            setDeleteLoading('');
        }
    };

    const getDiscountText = (coupon) => {
        if (coupon.discountype === 'amount') {
            return `${coupon.discountValue} دينار`;
        }
        return `${coupon.discountValue}%`;
    };

    const getExpireText = (coupon) => {
        if (coupon.expireType === 'usage') {
            return `${coupon.usedTimes} / ${coupon.allowedUsageTimes} مرة`;
        }
        return new Date(coupon.expireDate).toLocaleDateString('ar-LY');
    };

    const getStateText = (state) => {
        const stateMap = {
            'active': 'نشط',
            'paused': 'متوقف',
            'expired': 'منتهي'
        };
        return stateMap[state] || state;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ar-LY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <section className='container coupons'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    return (
        <section className='container coupons'>
            <div className="header">
                
                <button 
                    className="create-btn"
                    onClick={handleOpenModal}
                >
                    <FaPlus />
                    <span>إنشاء كوبون</span>
                </button>
            </div>

            {stats && (
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>إجمالي الكوبونات</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card active">
                        <h3>الكوبونات النشطة</h3>
                        <p className="stat-value">{stats.active}</p>
                    </div>
                    <div className="stat-card paused">
                        <h3>الكوبونات المتوقفة</h3>
                        <p className="stat-value">{stats.paused}</p>
                    </div>
                    <div className="stat-card expired">
                        <h3>الكوبونات المنتهية</h3>
                        <p className="stat-value">{stats.expired}</p>
                    </div>
                    <div className="stat-card savings">
                        <h3>إجمالي التوفير</h3>
                        <p className="stat-value">{stats.totalSavings} د.ل</p>
                    </div>
                </div>
            )}

            <div className="filters-section">
                <div className="sort-group">
                    <label>الترتيب:</label>
                    <div className="sort-buttons">
                        <button 
                            className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                            onClick={() => handleSortChange('newest')}
                        >
                            الأحدث
                        </button>
                        <button 
                            className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                            onClick={() => handleSortChange('oldest')}
                        >
                            الأقدم
                        </button>
                    </div>
                </div>

                <div className="state-filters">
                    <button 
                        className={`filter-btn ${stateFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleStateFilter('all')}
                    >
                        الكل
                    </button>
                    <button 
                        className={`filter-btn ${stateFilter === 'active' ? 'active' : ''}`}
                        onClick={() => handleStateFilter('active')}
                    >
                        نشط
                    </button>
                    <button 
                        className={`filter-btn ${stateFilter === 'paused' ? 'active' : ''}`}
                        onClick={() => handleStateFilter('paused')}
                    >
                        متوقف
                    </button>
                    <button 
                        className={`filter-btn ${stateFilter === 'expired' ? 'active' : ''}`}
                        onClick={() => handleStateFilter('expired')}
                    >
                        منتهي
                    </button>
                </div>
            </div>

            <div className="coupons-grid">
                {coupons.map(coupon => (
                    <div key={coupon._id} className="coupon-card">
                        <div className="card-header">
                            <div className="coupon-code">
                                <span className="code">{coupon.couponCode}</span>
                                <span className={`state-badge ${coupon.state}`}>
                                    {getStateText(coupon.state)}
                                </span>
                            </div>
                            <div className="created-date">
                                {formatDate(coupon.createdAt)}
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="info-row">
                                <span className="label">نوع الخصم:</span>
                                <span className="value">
                                    {coupon.discountype === 'amount' ? 'مبلغ ثابت' : 'نسبة مئوية'}
                                </span>
                            </div>

                            <div className="info-row">
                                <span className="label">قيمة الخصم:</span>
                                <span className="value discount">{getDiscountText(coupon)}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">الاستخدام:</span>
                                <span className="value">{getExpireText(coupon)}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">مرات الاستخدام:</span>
                                <span className="value">{coupon.usedTimes}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">إجمالي التوفير:</span>
                                <span className="value savings">{coupon.totalSavedUsingCoupon} د.ل</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button 
                                className={`toggle-btn ${coupon.state === 'active' ? 'active' : 'paused'}`}
                                onClick={() => handleToggleState(coupon._id, coupon.state)}
                                disabled={coupon.state === 'expired'}
                            >
                                {coupon.state === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                                <span>{coupon.state === 'active' ? 'إيقاف' : 'تفعيل'}</span>
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(coupon._id)}
                                disabled={deleteLoading === coupon._id}
                            >
                                {deleteLoading === coupon._id ? (
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

            <AddCouponModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </section>
    );
};

export default Coupons;