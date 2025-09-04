import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useCarTows = () => {
    const [drivers, setDrivers] = useState([]);
    const [driverRequests, setDriverRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    // Fetch drivers with pagination
    const fetchDrivers = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/drivers?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setDrivers(json.drivers);
            setTotalPages(json.pages);
            setCurrentPage(json.currentPage);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    // Get all requests
    const fetchAllRequests = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/all-requests`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            const pendingRequests = json.requests.filter(req => req.state === 'pending');
            setAllRequests(json.requests);
            setRequestsCount(pendingRequests.length);
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Search drivers by phone number
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/search-drivers?phoneNumber=${query}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setSearchResults(json);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        }
    };

    // Approve request
    const handleApprove = async (requestId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/approve/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update local state
            setAllRequests(prev => {
                const updated = prev.map(req => 
                    req._id === requestId ? { ...req, state: 'approved' } : req
                );
                const pendingCount = updated.filter(req => req.state === 'pending').length;
                setRequestsCount(pendingCount);
                return updated;
            });

            // Refresh drivers list
            await fetchDrivers(currentPage);

            dispatch(alertActions.showAlert({ msg: 'تم قبول الطلب بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Reject request
    const handleReject = async (requestId, reason) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/reject/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reasonForRejection: reason })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update local state
            setAllRequests(prev => {
                const updated = prev.map(req => 
                    req._id === requestId ? { ...req, state: 'rejected', reasonForRejection: reason } : req
                );
                const pendingCount = updated.filter(req => req.state === 'pending').length;
                setRequestsCount(pendingCount);
                return updated;
            });

            dispatch(alertActions.showAlert({ msg: 'تم رفض الطلب بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Toggle driver ban status
    const toggleDriverBan = async (driverId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/toggle-ban/${driverId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update local state
            setDrivers(prev => prev.map(driver => 
                driver._id === driverId ? { ...driver, isBanned: json.isBanned } : driver
            ));

            dispatch(alertActions.showAlert({ 
                msg: json.isBanned ? 'تم حظر السائق بنجاح' : 'تم إلغاء حظر السائق بنجاح', 
                type: 'success' 
            }));
            
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Update driver warnings
    const updateWarnings = async (driverId, warnings) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/update-warnings/${driverId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ warnings })
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update local state
            setDrivers(prev => prev.map(driver => 
                driver._id === driverId ? { ...driver, warrnings: warnings } : driver
            ));

            dispatch(alertActions.showAlert({ msg: 'تم تحديث التحذيرات بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    // Initial fetch
    useEffect(() => {
        if (user?.token) {
            fetchDrivers();
            fetchAllRequests();
        }
    }, [user]);

    return {
        drivers: searchQuery ? searchResults : drivers,
        driverRequests,
        allRequests,
        requestsCount,
        isLoading,
        currentPage,
        totalPages,
        searchQuery,
        handleSearch,
        handleApprove,
        handleReject,
        fetchDrivers,
        fetchAllRequests,
        toggleDriverBan,
        updateWarnings
    };
};