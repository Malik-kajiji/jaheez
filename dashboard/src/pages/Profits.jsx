import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useProfits } from '../hooks/useProfits';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/profits.scss';
import { FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export const Profits = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const {
        dailyProfits,
        distribution,
        stats,
        isLoading,
        fetchAllData
    } = useProfits();

    // Get first day of current month
    const getFirstDayOfMonth = () => {
        const date = new Date();
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0];
    };

    // Get today's date
    const getToday = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [filters, setFilters] = useState({
        type: 'balance-charge',
        startDate: getFirstDayOfMonth(),
        endDate: getToday()
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        handleSearch();
    }, [user]);

    const handleSearch = () => {
        fetchAllData(filters.type, filters.startDate, filters.endDate);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-LY', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `${amount.toFixed(2)} د.ل`;
    };

    if (isLoading) {
        return (
            <section className='container profits'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    return (
        <section className='container profits'>

            <div className="filters-section">
                <div className="filter-group">
                    <label>نوع الربح</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="balance-charge">شحن الرصيد</option>
                        <option value="subscription">الاشتراكات</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>من تاريخ</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>إلى تاريخ</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                </div>

                <button className="search-btn" onClick={handleSearch}>
                    <FaSearch />
                    <span>بحث</span>
                </button>
            </div>

            {stats && (
                <div className="stats-overview">
                    <div className="stat-card total">
                        <h3>إجمالي الأرباح</h3>
                        <p className="stat-value">{formatCurrency(stats.total)}</p>
                        <p className="stat-count">{stats.count} عملية</p>
                    </div>

                    {stats.percentageChange !== null && (
                        <div className={`stat-card change ${stats.percentageChange >= 0 ? 'positive' : 'negative'}`}>
                            <h3>نسبة التغيير</h3>
                            <p className="stat-value">
                                {stats.percentageChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(stats.percentageChange).toFixed(2)}%
                            </p>
                            <p className="stat-label">
                                {stats.percentageChange >= 0 ? 'زيادة' : 'انخفاض'} عن الفترة السابقة
                            </p>
                        </div>
                    )}

                    <div className="stat-card average">
                        <h3>متوسط الربح اليومي</h3>
                        <p className="stat-value">{formatCurrency(stats.average)}</p>
                        <p className="stat-label">معدل يومي</p>
                    </div>
                </div>
            )}

            <div className="charts-section">
                <div className="chart-container">
                    <h2>الأرباح اليومية</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyProfits}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--borders-color)" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                stroke="var(--normal-text-color)"
                            />
                            <YAxis stroke="var(--normal-text-color)" />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatDate}
                                contentStyle={{
                                    backgroundColor: 'var(--side-bar-color)',
                                    border: '1px solid var(--borders-color)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="totalAmount" 
                                stroke="var(--primary-color)" 
                                strokeWidth={2}
                                name="الأرباح"
                                dot={{ fill: 'var(--primary-color)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {distribution.length > 0 && (
                    <div className="chart-container">
                        <h2>
                            {filters.type === 'subscription' 
                                ? 'عدد الاشتراكات لكل باقة' 
                                : 'عدد المشتريات لكل نوع كرت'}
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={distribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--borders-color)" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--normal-text-color)"
                                />
                                <YAxis stroke="var(--normal-text-color)" />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'var(--side-bar-color)',
                                        border: '1px solid var(--borders-color)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="count" 
                                    fill="var(--primary-color)" 
                                    name="العدد"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Profits;