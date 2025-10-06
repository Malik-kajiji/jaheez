import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useReports = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Get all reports with filters
    const fetchReports = async (reporter = 'all', state = 'all', search = '') => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (reporter && reporter !== 'all') params.append('reporter', reporter);
            if (state && state !== 'all') params.append('state', state);
            if (search) params.append('search', search);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reports?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setReports(json);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    // Get report statistics
    const fetchReportStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reports/stats`, {
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

    // Create a new report
    const createReport = async (reportData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reports`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            dispatch(alertActions.showAlert({ msg: 'تم إنشاء الشكوى بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Update report state
    const updateReportState = async (reportId, state) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reports/${reportId}/state`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update the report in the local state
            setReports(prevReports => prevReports.map(report => 
                report._id === reportId ? { ...report, state } : report
            ));

            dispatch(alertActions.showAlert({ msg: 'تم تحديث حالة الشكوى بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    // Delete a report
    const deleteReport = async (reportId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Remove the report from local state
            setReports(prevReports => prevReports.filter(report => report._id !== reportId));

            dispatch(alertActions.showAlert({ msg: 'تم حذف الشكوى بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            throw error;
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchReports();
            fetchReportStats();
        }
    }, [user]);

    return {
        reports,
        stats,
        isLoading,
        fetchReports,
        fetchReportStats,
        createReport,
        updateReportState,
        deleteReport
    };
};