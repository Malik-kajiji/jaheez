import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alertActions } from '../redux/AlertController';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const dispatch = useDispatch();
    const user = useSelector(state => state.userController.user);

    const fetchUsers = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setUsers(json.users);
            setTotalPages(json.pages);
            setCurrentPage(page);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (phoneNumber) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/search-users?phoneNumber=${phoneNumber}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            setUsers(json.users);
            setTotalPages(json.pages);
            setCurrentPage(1);
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserBan = async (userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users/${userId}/toggle-ban`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error);
            }

            // Update the user in the local state
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, isBanned: json.isBanned } : user
            ));

            dispatch(alertActions.showAlert({ 
                msg: json.isBanned ? 'تم حظر المستخدم بنجاح' : 'تم إلغاء حظر المستخدم بنجاح', 
                type: 'success' 
            }));

            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    const updateWarnings = async (userId, warnings) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users/${userId}/warnings`, {
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

            // Update the user in the local state
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, warrnings: warnings } : user
            ));

            dispatch(alertActions.showAlert({ msg: 'تم تحديث التحذيرات بنجاح', type: 'success' }));
            return json;
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }));
            return null;
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchUsers();
        }
    }, [user]);

    return {
        users,
        isLoading,
        currentPage,
        totalPages,
        handleSearch,
        fetchUsers,
        toggleUserBan,
        updateWarnings
    };
};