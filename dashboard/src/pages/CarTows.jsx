import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiInfo, FiLoader } from 'react-icons/fi';
import '../styles/carTows.scss';
import { useCarTows } from '../hooks/useCarTows';

export const CarTows = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const [rejectModal, setRejectModal] = useState({ show: false, id: null });
    const [rejectReason, setRejectReason] = useState('');
    const [showAllRequests, setShowAllRequests] = useState(false);
    const [showDriverInfo, setShowDriverInfo] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [loadingAction, setLoadingAction] = useState({ type: null, id: null });
    const {
        drivers,
        allRequests,
        requestsCount,
        isLoading,
        currentPage,
        totalPages,
        handleSearch,
        handleApprove,
        handleReject,
        fetchDrivers,
        fetchAllRequests,
        toggleDriverBan,
        updateWarnings
    } = useCarTows();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user]);

    const handleRejectClick = (id) => {
        setRejectModal({ show: true, id });
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) return;
        setLoadingAction({ type: 'reject', id: rejectModal.id });
        const result = await handleReject(rejectModal.id, rejectReason);
        setLoadingAction({ type: null, id: null });
        if (result) {
            setRejectModal({ show: false, id: null });
            setRejectReason('');
        }
    };

    const handleApproveClick = async (requestId) => {
        setLoadingAction({ type: 'approve', id: requestId });
        await handleApprove(requestId);
        setLoadingAction({ type: null, id: null });
    };

    const handleToggleBan = async (driverId) => {
        setLoadingAction({ type: 'ban', id: driverId });
        const result = await toggleDriverBan(driverId);
        if (result && showDriverInfo?._id === driverId) {
            setShowDriverInfo(prev => ({ ...prev, isBanned: result.isBanned }));
        }
        setLoadingAction({ type: null, id: null });
    };

    const handleUpdateWarnings = async (driverId, warnings) => {
        setLoadingAction({ type: 'warnings', id: driverId });
        const result = await updateWarnings(driverId, warnings);
        if (result && showDriverInfo?._id === driverId) {
            setShowDriverInfo(prev => ({ ...prev, warrnings: warnings }));
        }
        setLoadingAction({ type: null, id: null });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'approved';
            case 'inactive': return 'pending';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'inactive': return 'غير نشط';
            default: return status;
        }
    };

    const handleSearchSubmit = () => {
        handleSearch(searchInput);
    };

    const pendingRequests = allRequests.filter(request => request.state === 'pending');

    const isActionLoading = (type, id) => loadingAction.type === type && loadingAction.id === id;

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <section className='car-tows-page'>
            <div className="header">
                <button 
                    className="review-requests-btn"
                    onClick={() => {
                        setShowAllRequests(true);
                        fetchAllRequests();
                    }}
                >
                    طلبات المراجعة
                    {requestsCount > 0 && <span className="count">{requestsCount}</span>}
                </button>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="بحث برقم الهاتف..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button className="search-btn" onClick={handleSearchSubmit}>
                        <FiSearch className="search-icon" />
                        بحث
                    </button>
                </div>
            </div>

            <div className="drivers-table">
                <table>
                    <thead>
                        <tr>
                            <th>اسم السائق</th>
                            <th>رقم الهاتف</th>
                            <th>نوع المركبة</th>
                            <th>موديل المركبة</th>
                            <th>رقم اللوحة</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers?.map((driver) => (
                            <tr key={driver._id}>
                                <td>{driver.driverName}</td>
                                <td>{driver.phoneNumber}</td>
                                <td>{driver.vechicleType}</td>
                                <td>{driver.vechicleModel}</td>
                                <td>{driver.carPlate || 'لا يوجد'}</td>
                                <td>
                                    <span className={`status ${getStatusClass(driver.state)}`}>
                                        {getStatusText(driver.state)}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="info-btn"
                                        onClick={() => setShowDriverInfo(driver)}
                                    >
                                        <FiInfo /> معلومات السائق
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => fetchDrivers(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => fetchDrivers(i + 1)}
                            className={currentPage === i + 1 ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => fetchDrivers(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* All Requests Modal */}
            {showAllRequests && (
                <div className="modal">
                    <div className="modal-content requests-modal">
                        <h2>طلبات المراجعة</h2>
                        <div className="requests-list">
                            {pendingRequests.length === 0 ? (
                                <p className="no-requests">لا توجد طلبات</p>
                            ) : (
                                pendingRequests.map((request) => (
                                    <div key={request._id} className="request-card">
                                        <img 
                                            src={request.carImage} 
                                            alt="car" 
                                            className="car-image"
                                        />
                                        <div className="request-info">
                                            <p>اسم السائق: {request.driverName}</p>
                                            <p>رقم الهاتف: {request.phoneNumber}</p>
                                            <p>رقم اللوحة: {request.carPlate}</p>
                                            <p>نوع المركبة: {request.vechicleType}</p>
                                            <p>موديل المركبة: {request.vechicleModel}</p>
                                            <p className={`status ${request.state}`}>
                                                الحالة: قيد المراجعة
                                            </p>
                                        </div>
                                        <div className="request-actions">
                                            <button 
                                                className={`approve ${isActionLoading('approve', request._id) ? 'loading' : ''}`}
                                                onClick={() => handleApproveClick(request._id)}
                                                disabled={isActionLoading('approve', request._id)}
                                            >
                                                {isActionLoading('approve', request._id) ? <FiLoader className="spinner" /> : 'قبول'}
                                            </button>
                                            <button 
                                                className={`reject ${isActionLoading('reject', request._id) ? 'loading' : ''}`}
                                                onClick={() => handleRejectClick(request._id)}
                                                disabled={isActionLoading('reject', request._id)}
                                            >
                                                {isActionLoading('reject', request._id) ? <FiLoader className="spinner" /> : 'رفض'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button 
                            className="close-btn"
                            onClick={() => setShowAllRequests(false)}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}

            {/* Driver Info Modal */}
            {showDriverInfo && (
                <div className="modal">
                    <div className="modal-content driver-info-modal">
                        <h2>معلومات السائق</h2>
                        <div className="driver-info">
                            <div className="info-group">
                                <h3>المعلومات الأساسية</h3>
                                <p>الاسم: {showDriverInfo.driverName}</p>
                                <p>رقم الهاتف: {showDriverInfo.phoneNumber}</p>
                                <p>تاريخ الانضمام: {new Date(showDriverInfo.createdAt).toLocaleDateString('ar-LY')}</p>
                            </div>

                            <div className="info-group">
                                <h3>التقييمات</h3>
                                {showDriverInfo.ratings.length === 0 ? (
                                    <p>لا توجد تقييمات</p>
                                ) : (
                                    <div className="ratings-list">
                                        {showDriverInfo.ratings.map((rating, index) => (
                                            <div key={index} className="rating-item">
                                                <p>المستخدم: {rating.username}</p>
                                                <p>التقييم: {rating.rating}/5</p>
                                                <p>التعليق: {rating.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="info-group">
                                <h3>الحالة والتحذيرات</h3>
                                <div className="status-controls">
                                    <div className="ban-control">
                                        <p>الحظر: {showDriverInfo.isBanned ? 'محظور' : 'غير محظور'}</p>
                                        <button 
                                            className={`${showDriverInfo.isBanned ? 'unban-btn' : 'ban-btn'} ${isActionLoading('ban', showDriverInfo._id) ? 'loading' : ''}`}
                                            onClick={() => handleToggleBan(showDriverInfo._id)}
                                            disabled={isActionLoading('ban', showDriverInfo._id)}
                                        >
                                            {isActionLoading('ban', showDriverInfo._id) ? 
                                                <FiLoader className="spinner" /> : 
                                                showDriverInfo.isBanned ? 'إلغاء الحظر' : 'حظر'
                                            }
                                        </button>
                                    </div>
                                    <div className="warnings-control">
                                        <p>عدد التحذيرات: {showDriverInfo.warrnings}</p>
                                        <div className="warnings-buttons">
                                            <button 
                                                onClick={() => handleUpdateWarnings(
                                                    showDriverInfo._id, 
                                                    showDriverInfo.warrnings + 1
                                                )}
                                                disabled={isActionLoading('warnings', showDriverInfo._id)}
                                                className={isActionLoading('warnings', showDriverInfo._id) ? 'loading' : ''}
                                            >
                                                {isActionLoading('warnings', showDriverInfo._id) ? <FiLoader className="spinner" /> : '+'}
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateWarnings(
                                                    showDriverInfo._id, 
                                                    Math.max(0, showDriverInfo.warrnings - 1)
                                                )}
                                                disabled={showDriverInfo.warrnings === 0 || isActionLoading('warnings', showDriverInfo._id)}
                                                className={isActionLoading('warnings', showDriverInfo._id) ? 'loading' : ''}
                                            >
                                                {isActionLoading('warnings', showDriverInfo._id) ? <FiLoader className="spinner" /> : '-'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="close-btn"
                            onClick={() => setShowDriverInfo(null)}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectModal.show && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>سبب الرفض</h2>
                        <div className="input-group">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="اكتب سبب الرفض هنا..."
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className={`P-BTN delete ${isActionLoading('reject', rejectModal.id) ? 'loading' : ''}`}
                                onClick={confirmReject}
                                disabled={isActionLoading('reject', rejectModal.id)}
                            >
                                {isActionLoading('reject', rejectModal.id) ? <FiLoader className="spinner" /> : 'تأكيد الرفض'}
                            </button>
                            <button 
                                className="S-BTN" 
                                onClick={() => {
                                    setRejectModal({ show: false, id: null });
                                    setRejectReason('');
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};