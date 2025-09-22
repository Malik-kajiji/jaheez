import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiInfo, FiLoader } from 'react-icons/fi';
import '../styles/users.scss';
import { useUsers } from '../hooks/useUsers';

export const Users = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const [showUserInfo, setShowUserInfo] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [loadingAction, setLoadingAction] = useState({ type: null, id: null });
    const {
        users,
        isLoading,
        currentPage,
        totalPages,
        handleSearch,
        fetchUsers,
        toggleUserBan,
        updateWarnings
    } = useUsers();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user]);

    const handleToggleBan = async (userId) => {
        setLoadingAction({ type: 'ban', id: userId });
        const result = await toggleUserBan(userId);
        if (result && showUserInfo?._id === userId) {
            setShowUserInfo(prev => ({ ...prev, isBanned: result.isBanned }));
        }
        setLoadingAction({ type: null, id: null });
    };

    const handleUpdateWarnings = async (userId, warnings) => {
        setLoadingAction({ type: 'warnings', id: userId });
        const result = await updateWarnings(userId, warnings);
        if (result && showUserInfo?._id === userId) {
            setShowUserInfo(prev => ({ ...prev, warrnings: warnings }));
        }
        setLoadingAction({ type: null, id: null });
    };

    const handleSearchSubmit = () => {
        handleSearch(searchInput);
    };

    const isActionLoading = (type, id) => loadingAction.type === type && loadingAction.id === id;

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <section className='users-page'>
            <div className="header">
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

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>اسم المستخدم</th>
                            <th>رقم الهاتف</th>
                            <th>عدد الرحلات</th>
                            <th>التحذيرات</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user._id}>
                                <td>{user.userName}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.numberOfTrips}</td>
                                <td>{user.warrnings}</td>
                                <td>{user.isBanned ? 'محظور' : 'نشط'}</td>
                                <td>
                                    <button 
                                        className="info-btn"
                                        onClick={() => setShowUserInfo(user)}
                                    >
                                        <FiInfo /> معلومات المستخدم
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
                        onClick={() => fetchUsers(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => fetchUsers(i + 1)}
                            className={currentPage === i + 1 ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => fetchUsers(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* User Info Modal */}
            {showUserInfo && (
                <div className="modal">
                    <div className="modal-content user-info-modal">
                        <h2>معلومات المستخدم</h2>
                        <div className="user-info">
                            <div className="info-group">
                                <h3>المعلومات الأساسية</h3>
                                <p>الاسم: {showUserInfo.userName}</p>
                                <p>رقم الهاتف: {showUserInfo.phoneNumber}</p>
                                <p>تاريخ الانضمام: {new Date(showUserInfo.createdAt).toLocaleDateString('ar-LY')}</p>
                                <div className="trips-info">
                                    <p>عدد الرحلات: {showUserInfo.numberOfTrips}</p>
                                    <button className="view-trips-btn">
                                        عرض الرحلات
                                    </button>
                                </div>
                            </div>

                            <div className="info-group">
                                <h3>الحالة والتحذيرات</h3>
                                <div className="status-controls">
                                    <div className="ban-control">
                                        <p>الحظر: {showUserInfo.isBanned ? 'محظور' : 'غير محظور'}</p>
                                        <button 
                                            className={`${showUserInfo.isBanned ? 'unban-btn' : 'ban-btn'} ${isActionLoading('ban', showUserInfo._id) ? 'loading' : ''}`}
                                            onClick={() => handleToggleBan(showUserInfo._id)}
                                            disabled={isActionLoading('ban', showUserInfo._id)}
                                        >
                                            {isActionLoading('ban', showUserInfo._id) ? 
                                                <FiLoader className="spinner" /> : 
                                                showUserInfo.isBanned ? 'إلغاء الحظر' : 'حظر'
                                            }
                                        </button>
                                    </div>
                                    <div className="warnings-control">
                                        <p>عدد التحذيرات: {showUserInfo.warrnings}</p>
                                        <div className="warnings-buttons">
                                            <button 
                                                onClick={() => handleUpdateWarnings(
                                                    showUserInfo._id, 
                                                    showUserInfo.warrnings + 1
                                                )}
                                                disabled={isActionLoading('warnings', showUserInfo._id)}
                                                className={isActionLoading('warnings', showUserInfo._id) ? 'loading' : ''}
                                            >
                                                {isActionLoading('warnings', showUserInfo._id) ? <FiLoader className="spinner" /> : '+'}
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateWarnings(
                                                    showUserInfo._id, 
                                                    Math.max(0, showUserInfo.warrnings - 1)
                                                )}
                                                disabled={showUserInfo.warrnings === 0 || isActionLoading('warnings', showUserInfo._id)}
                                                className={isActionLoading('warnings', showUserInfo._id) ? 'loading' : ''}
                                            >
                                                {isActionLoading('warnings', showUserInfo._id) ? <FiLoader className="spinner" /> : '-'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="close-btn"
                            onClick={() => setShowUserInfo(null)}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};