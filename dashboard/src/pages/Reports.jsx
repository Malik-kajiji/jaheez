import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import '../styles/reports.scss';
import { FaSearch, FaTrash, FaUser, FaCar, FaImage } from 'react-icons/fa';

export const Reports = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const {
        reports,
        stats,
        isLoading,
        fetchReports,
        updateReportState,
        deleteReport
    } = useReports();

    const [filters, setFilters] = useState({
        reporter: 'all',
        state: 'all',
        search: ''
    });
    const [deleteLoading, setDeleteLoading] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports(filters.reporter, filters.state, filters.search);
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        fetchReports(newFilters.reporter, newFilters.state, newFilters.search);
    };

    const handleStateChange = async (reportId, newState) => {
        try {
            await updateReportState(reportId, newState);
        } catch (error) {
            console.error('Error updating report state:', error);
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الشكوى؟')) {
            return;
        }

        setDeleteLoading(reportId);
        try {
            await deleteReport(reportId);
        } catch (error) {
            console.error('Error deleting report:', error);
        } finally {
            setDeleteLoading('');
        }
    };

    const getReporterText = (reporter) => {
        return reporter === 'user' ? 'مستخدم' : 'سائق';
    };

    const getStateText = (state) => {
        return state === 'pending' ? 'قيد المعالجة' : 'مغلقة';
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
            <section className='container reports'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    return (
        <section className='container reports'>
            

            {stats && (
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>إجمالي الشكاوي</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card pending">
                        <h3>قيد المعالجة</h3>
                        <p className="stat-value">{stats.pending}</p>
                    </div>
                    <div className="stat-card closed">
                        <h3>المغلقة</h3>
                        <p className="stat-value">{stats.closed}</p>
                    </div>
                    <div className="stat-card user">
                        <h3>شكاوي المستخدمين</h3>
                        <p className="stat-value">{stats.userReports}</p>
                    </div>
                    <div className="stat-card driver">
                        <h3>شكاوي السائقين</h3>
                        <p className="stat-value">{stats.driverReports}</p>
                    </div>
                </div>
            )}

            <div className="filters-section">
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="ابحث برقم الرحلة، رقم المستخدم أو رقم السائق..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                    <button type="submit">
                        <FaSearch />
                    </button>
                </form>

                <div className="filter-group">
                    <label>المبلغ:</label>
                    <select
                        value={filters.reporter}
                        onChange={(e) => handleFilterChange('reporter', e.target.value)}
                    >
                        <option value="all">الكل</option>
                        <option value="user">مستخدم</option>
                        <option value="driver">سائق</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>الحالة:</label>
                    <select
                        value={filters.state}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                    >
                        <option value="all">الكل</option>
                        <option value="pending">قيد المعالجة</option>
                        <option value="closed">مغلقة</option>
                    </select>
                </div>
            </div>

            <div className="reports-grid">
                {reports.map(report => (
                    <div key={report._id} className="report-card">
                        <div className="card-header">
                            <div className="reporter-badge">
                                {report.reporter === 'user' ? <FaUser /> : <FaCar />}
                                <span>{getReporterText(report.reporter)}</span>
                            </div>
                            <span className={`state-badge ${report.state}`}>
                                {getStateText(report.state)}
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="trip-info">
                                <h3>رحلة رقم: {report.tripNumber}</h3>
                            </div>

                            <div className="parties-info">
                                <div className="party">
                                    <h4>المستخدم</h4>
                                    <p className="name">{report.userName}</p>
                                    <p className="phone">{report.userPhoneNumber}</p>
                                </div>
                                <div className="party">
                                    <h4>السائق</h4>
                                    <p className="name">{report.driverName}</p>
                                    <p className="phone">{report.driverPhoneNumber}</p>
                                </div>
                            </div>

                            <div className="message-section">
                                <h4>الرسالة:</h4>
                                <p className="message">{report.message}</p>
                            </div>

                            {report.attachedFiles && report.attachedFiles.length > 0 && (
                                <div className="attachments">
                                    <h4>
                                        <FaImage />
                                        المرفقات ({report.attachedFiles.length})
                                    </h4>
                                    <div className="files-list">
                                        {report.attachedFiles.map((file, index) => (
                                            <a 
                                                key={index} 
                                                href={file} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="file-link"
                                            >
                                                مرفق {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="date-info">
                                <span className="date-label">تاريخ الإنشاء:</span>
                                <span className="date-value">{formatDate(report.createdAt)}</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            {report.state === 'pending' && (
                                <button 
                                    className="close-btn"
                                    onClick={() => handleStateChange(report._id, 'closed')}
                                >
                                    إغلاق الشكوى
                                </button>
                            )}
                            {report.state === 'closed' && (
                                <button 
                                    className="reopen-btn"
                                    onClick={() => handleStateChange(report._id, 'pending')}
                                >
                                    إعادة فتح
                                </button>
                            )}
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(report._id)}
                                disabled={deleteLoading === report._id}
                            >
                                {deleteLoading === report._id ? (
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
        </section>
    );
};

export default Reports;