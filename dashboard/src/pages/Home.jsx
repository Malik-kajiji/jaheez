import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useHome } from '../hooks/useHome';
import { 
    FaTruck, 
    FaUsers, 
    FaRoute, 
    FaTicketAlt, 
    FaCrown, 
    FaMoneyBillWave, 
    FaTag, 
    FaExclamationTriangle, 
    FaBell, 
    FaCog,
    FaUserShield,
    FaArrowLeft
} from 'react-icons/fa';
import '../styles/home.scss';
import { GiTowTruck } from 'react-icons/gi';
import { IoSettingsOutline } from 'react-icons/io5';

export const Home = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const { homeData, isLoading } = useHome();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user]);

    if (isLoading) {
        return (
            <section className='container home'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    const access = user?.access || [];

    // Define all dashboard cards with their data
    const dashboardCards = [
        {
            id: 'car-tows',
            title: 'طلبات الإنضمام',
            icon: <GiTowTruck />,
            value: homeData?.pendingCarTowRequests,
            label: 'طلب معلق',
            link: '/car-tows',
            color: '#3498db',
            show: access.includes('car-tows') || access.includes('owner')
        },
        {
            id: 'users',
            title: 'المستخدمين',
            icon: <FaUsers />,
            value: homeData?.totalUsers,
            label: 'مستخدم',
            link: '/users',
            color: '#2ecc71',
            show: access.includes('users') || access.includes('owner')
        },
        {
            id: 'trips',
            title: 'الرحلات',
            icon: <FaRoute />,
            value: homeData?.totalTrips,
            label: 'رحلة',
            link: '/trips',
            color: '#9b59b6',
            show: access.includes('trips') || access.includes('owner')
        },
        {
            id: 'vouchers',
            title: 'الكروت',
            icon: <FaTicketAlt />,
            value: homeData?.notUsedVouchers,
            label: 'قسيمة غير مستخدمة',
            link: '/vouchers',
            color: '#e67e22',
            show: access.includes('vouchers') || access.includes('owner')
        },
        {
            id: 'subscriptions',
            title: 'الاشتراكات',
            icon: <FaCrown />,
            value: homeData?.activeSubscriptions,
            label: 'اشتراك نشط',
            link: '/subscriptions',
            color: '#f39c12',
            show: access.includes('subscriptions') || access.includes('owner')
        },
        {
            id: 'profits',
            title: 'الأرباح',
            icon: <FaMoneyBillWave />,
            value: homeData?.currentMonthProfit,
            label: 'د.ل هذا الشهر',
            link: '/profits',
            color: '#27ae60',
            show: access.includes('profits') || access.includes('owner')
        },
        {
            id: 'coupons',
            title: 'الكوبونات',
            icon: <FaTag />,
            value: homeData?.activeCoupons,
            label: 'كوبون نشط',
            link: '/coupons',
            color: '#e74c3c',
            show: access.includes('coupons') || access.includes('owner')
        },
        {
            id: 'reports',
            title: 'الشكاوي',
            icon: <FaExclamationTriangle />,
            value: homeData?.pendingReports,
            label: 'بلاغ معلق',
            link: '/reports',
            color: '#c0392b',
            show: access.includes('reports') || access.includes('owner')
        },
        {
            id: 'notifications',
            title: 'الإشعارات',
            icon: <FaBell />,
            value: homeData?.totalNotifications,
            label: 'إشعار',
            link: '/notifications',
            color: '#16a085',
            show: access.includes('notifications') || access.includes('owner')
        },
        {
            id: 'settings',
            title: 'الإعدادات',
            icon: <FaCog />,
            value: null,
            label: null,
            link: '/settings',
            color: '#7f8c8d',
            show: access.includes('settings') || access.includes('owner')
        },
        {
            id: 'admins',
            title: 'المسؤولين',
            icon: <FaUserShield />,
            value: homeData?.totalAdmins,
            label: 'مسؤول',
            link: '/admins',
            color: '#34495e',
            show: access.includes('admins') || access.includes('owner')
        }
    ];

    // Filter cards based on access
    const visibleCards = dashboardCards.filter(card => card.show);

    return (
        <section className='container home'>
            {/* <div style={{marginBottom: 10, fontWeight: 'bold', fontSize: 20}}>hello there</div> */}
            {/* <div className="home-header">
                <h1 className="TXT-heading color-normal">لوحة التحكم</h1>
                <p className="TXT-normal color-light">مرحباً بك، {user?.username}</p>
            </div> */}

            <div className="dashboard-grid">
                {visibleCards.map(card => (
                    <Link 
                        key={card.id} 
                        to={card.link} 
                        className="dashboard-card"
                        style={{ '--card-color': card.color }}
                    >
                        <div className="card-header">
                            <div className="card-icon" style={{ color: card.color }}>
                                {card.icon}
                            </div>
                            <h3>{card.title}</h3>
                        </div>
                        
                        {card.value !== null && (
                            <div className="card-body">
                                <div className="card-value" style={{ color: card.color }}>
                                    {card.value?.toLocaleString('ar-LY') || 0}
                                </div>
                                {card.label && (
                                    <div className="card-label">{card.label}</div>
                                )}
                            </div>
                        )}
                        
                        <div className="card-footer">
                            <span>عرض المزيد</span>
                            <FaArrowLeft />
                        </div>
                    </Link>
                ))}
            </div>

            {visibleCards.length === 0 && (
                <div className="no-access">
                    <p>لا توجد صفحات متاحة لك</p>
                </div>
            )}
        </section>
    );
};
