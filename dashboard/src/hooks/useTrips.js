import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { alertActions } from '../redux/AlertController';

const useTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tripCount, setTripCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [availableMonths, setAvailableMonths] = useState([]);
    
    const user = useSelector(state => state.userController.user);
    const dispatch = useDispatch();

    // Get available months
    const getAvailableMonths = async () => {
        try {
            if (!user?.token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/trips/months`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch available months');
            }

            const data = await response.json();
            setAvailableMonths(data.months);
            if (data.message) {
                dispatch(alertActions.showAlert({ msg: data.message, type: 'info' }));
            }
            return data.months;

        } catch (err) {
            dispatch(alertActions.showAlert({ msg: err.message, type: 'error' }));
            return [];
        }
    };

    // Get trips with optional filters
    const getTrips = async (filters = {}) => {
        try {
            if (!user?.token) {
                throw new Error('Authentication token not found');
            }

            setLoading(true);
            setError(null);

            // If no month provided, use current month
            if (!filters.month) {
                filters.month = new Date().toISOString().slice(0, 7);
            }

            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters.month) queryParams.append('month', filters.month);
            if (filters.driverPhone) queryParams.append('driverPhone', filters.driverPhone);
            if (filters.userPhone) queryParams.append('userPhone', filters.userPhone);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/trips?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trips');
            }

            const data = await response.json();
            setTrips(data.trips || []);
            setTripCount(data.count || 0);
            setTotalCost(data.totalCost || 0);
            if (data.message) {
                dispatch(alertActions.showAlert({ msg: data.message, type: 'info' }));
            }

        } catch (err) {
            setError(err.message);
            setTrips([]);
            setTripCount(0);
            setTotalCost(0);
            dispatch(alertActions.showAlert({ msg: err.message, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    // Get single trip details
    const getTrip = async (id) => {
        try {
            if (!user?.token) {
                throw new Error('Authentication token not found');
            }

            setLoading(true);
            setError(null);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/trips/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trip details');
            }

            const data = await response.json();
            return data;

        } catch (err) {
            setError(err.message);
            dispatch(alertActions.showAlert({ msg: err.message, type: 'error' }));
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update trip state
    const updateTripState = async (id, state) => {
        try {
            if (!user?.token) {
                throw new Error('Authentication token not found');
            }

            setLoading(true);
            setError(null);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/trips/${id}/state`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ state })
            });

            if (!response.ok) {
                throw new Error('Failed to update trip state');
            }

            const updatedTrip = await response.json();
            
            // Update trips list with new state
            setTrips(prevTrips => 
                prevTrips.map(trip => 
                    trip._id === id ? updatedTrip : trip
                )
            );

            dispatch(alertActions.showAlert({ msg: 'تم تحديث حالة الرحلة بنجاح', type: 'success' }));
            return updatedTrip;

        } catch (err) {
            setError(err.message);
            dispatch(alertActions.showAlert({ msg: err.message, type: 'error' }));
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        trips,
        loading,
        error,
        tripCount,
        totalCost,
        availableMonths,
        getTrips,
        getTrip,
        updateTripState,
        getAvailableMonths
    };
};

export default useTrips;