import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useTrips from '../hooks/useTrips';
import '../styles/trips.scss';
import { FiSearch } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import TripMap from '../components/TripMap';

export const Trips = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const { trips, loading, error, tripCount, totalCost, getTrips, getAvailableMonths, availableMonths } = useTrips();

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
    const [driverPhone, setDriverPhone] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [showTripModal, setShowTripModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);

    // Check authentication
    useEffect(() => {
        if (!user || !user.token) {
            navigate('/admin-login');
            return;
        }
    }, [user, navigate]);

    // Load available months and current month trips on initial render
    useEffect(() => {
        if (user && user.token) {
            const initializeData = async () => {
                const months = await getAvailableMonths();
                if (months && months.length > 0) {
                    setSelectedMonth(months[0]); // Select most recent month
                    getTrips({ month: months[0] });
                }
            };
            initializeData();
        }
    }, [user]);

    const handleSearch = () => {
        getTrips({
            month: selectedMonth,
            driverPhone: driverPhone || undefined,
            userPhone: userPhone || undefined
        });
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowTripModal(true);
    };

    if (!user || !user.token) return null;

    return (
        <section className='trips-page'>
            <div className="filters">
                <div className="inputs-container">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-filter"
                        disabled={!availableMonths.length}
                    >
                        {availableMonths.length > 0 ? (
                            availableMonths.map(month => {
                                const date = new Date(month);
                                const label = date.toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' });
                                return (
                                    <option key={month} value={month}>
                                        {label}
                                    </option>
                                );
                            })
                        ) : (
                            <option value="">لا توجد رحلات</option>
                        )}
                    </select>
                    <input
                        type="text"
                        placeholder="رقم هاتف السائق"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="phone-filter"
                    />
                    <input
                        type="text"
                        placeholder="رقم هاتف المستخدم"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="phone-filter"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="search-btn"
                    disabled={loading || !availableMonths.length}
                >
                    <FiSearch className="search-icon" />
                    بحث
                </button>
            </div>

            <div className="stats">
                <div className="stat-box right">
                    <span className="label">عدد الرحلات:</span>
                    <span className="value">{tripCount}</span>
                </div>
                <div className="stat-box left">
                    <span className="label">التكلفة الإجمالية:</span>
                    <span className="value">{totalCost.toFixed(2)} د.ل</span>
                </div>
            </div>

            {loading ? (
                <div className="loading">جاري التحميل...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الرحلة</th>
                                <th>السائق</th>
                                <th>المستخدم</th>
                                <th>اليوم والوقت</th>
                                <th>الشهر</th>
                                <th>السعر</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(trip => (
                                <tr key={trip._id}>
                                    <td>{trip.tripNumber}</td>
                                    <td>{trip.driverName}</td>
                                    <td>{trip.userName}</td>
                                    <td>
                                        {new Date(trip.createdAt).toLocaleDateString('ar-LY')} - {' '}
                                        {new Date(trip.createdAt).toLocaleTimeString('ar-LY')}
                                    </td>
                                    <td>
                                        {new Date(trip.createdAt).toLocaleDateString('ar-LY', { month: 'long' })}
                                    </td>
                                    <td>{trip.tripCost.toFixed(2)} د.ل</td>
                                    <td>
                                        <span className={`status ${trip.state}`}>
                                            {trip.state === 'pending' && 'قيد الانتظار'}
                                            {trip.state === 'completed' && 'مكتملة'}
                                            {trip.state === 'cancelled' && 'ملغية'}
                                            {trip.state === 'faild' && 'فاشلة'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="view-trip-btn"
                                            onClick={() => handleTripClick(trip)}
                                        >
                                            عرض الرحلة
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showTripModal && selectedTrip && (
                <div className="modal-overlay" onClick={() => setShowTripModal(false)}>
                    <div className="trip-modal" onClick={e => e.stopPropagation()}>
                        <h2>تفاصيل الرحلة</h2>
                        <div className="map-container">
                            <TripMap trip={selectedTrip} />
                        </div>
                        <div className="trip-details">
                            <div className="detail-row">
                                <span className="label">رقم الرحلة:</span>
                                <span className="value">{selectedTrip.tripNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">تكلفة الرحلة:</span>
                                <span className="value">{selectedTrip.tripCost} د.ل</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">نقطة البداية:</span>
                                <span className="value">{selectedTrip.startPoint.address}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">نقطة النهاية:</span>
                                <span className="value">{selectedTrip.endingPoint.address}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">رقم هاتف السائق:</span>
                                <span className="value">{selectedTrip.driverPhoneNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">رقم هاتف المستخدم:</span>
                                <span className="value">{selectedTrip.userPhoneNumber}</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setShowTripModal(false)}>
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};