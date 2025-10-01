import React, { useEffect, useState } from 'react';
import '../styles/sidebar.scss';
import { AiOutlineHome, AiOutlineMenu } from 'react-icons/ai';
import { FaHandHoldingDollar } from "react-icons/fa6";
import { FaMapSigns } from "react-icons/fa";
import { TbPackages } from 'react-icons/tb';
import { FiLogOut } from 'react-icons/fi'
import { RiAdminLine,RiCoupon3Line  } from 'react-icons/ri';
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import useLogout from '../hooks/useLogout'
import { TbNetwork } from "react-icons/tb";
import { FaPlaneDeparture,FaDollarSign } from "react-icons/fa";
import { GoTasklist } from "react-icons/go";

import { GiTowTruck } from "react-icons/gi";
import { FiUsers } from "react-icons/fi";
import { PiMoneyWavyLight } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";

const SideBar = ({theme,toggleTheme}) => {
    const [active,setActive] = useState(false);
    const user = useSelector(state => state.userController.user);
    const { logout } = useLogout();
    const { pathname } = useLocation();

    const showTap = tap => (user.access.includes(tap) || user.access.includes('owner'))

    return (
        <>
            <aside className={`sidebar ${active? `active`:''}`}>
                <button className="slideBtn" onClick={()=>setActive(prev => !prev)}>
                    {AiOutlineMenu({})}
                </button>
                <div className="logo">
                    <img src="/images/logo.png" alt="Logo" />
                </div>
                <ul className="ul" role="list">
                    <Link to="/">
                        <li 
                            className={`li ${pathname === '/' && 'active'}`} 
                            onClick={()=>setActive(false)}
                        >
                            <span className="icon">{AiOutlineHome({})}</span>
                            <p className="text">الرئيسية</p>
                        </li>
                    </Link>
                    {showTap('car-tows') && (
                        <Link to="/car-tows">
                            <li 
                                className={`li ${pathname === '/car-tows' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{GiTowTruck({})}</span>
                                <p className="text">الساحبات</p>
                            </li>
                        </Link>
                    )}
                    {showTap('users') && (
                        <Link to="/users">
                            <li 
                                className={`li ${pathname === '/users' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{FiUsers({})}</span>
                                <p className="text">المستخدمون</p>
                            </li>
                        </Link>
                    )}
                    {showTap('trips') && (
                        <Link to="/trips">
                            <li
                                className={`li ${pathname === '/trips' && 'active'}`}
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{FaMapSigns({})}</span>
                                <p className="text">الرحلات</p>
                            </li>
                        </Link>
                    )}
                    {showTap('vouchers') && (
                        <Link to="/vouchers">
                            <li
                                className={`li ${pathname.startsWith('/vouchers') && 'active'}`}
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{PiMoneyWavyLight({})}</span>
                                <p className="text">الكروت</p>
                            </li>
                        </Link>
                    )}
                    {showTap('profits') && (
                        <Link to="/profits">
                            <li 
                                className={`li ${pathname.startsWith('/profits') && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{FaHandHoldingDollar({})}</span>
                                <p className="text">الأرباح</p>
                            </li>
                        </Link>
                    )}
                    {showTap('coupons') && (
                        <Link to="/coupons">
                            <li 
                                className={`li ${pathname === '/coupons' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{RiCoupon3Line({})}</span>
                                <p className="text">الكوبونات</p>
                            </li>
                        </Link>
                    )}
                    {showTap('settings') && (
                        <Link to="/settings">
                            <li 
                                className={`li ${pathname === '/settings' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{IoSettingsOutline({})}</span>
                                <p className="text">الإعدادات</p>
                            </li>
                        </Link>
                    )}
                    {(user.access.includes('owner')) && (
                        <Link to="/admins">
                            <li 
                                className={`li ${pathname === '/admins' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className="icon">{RiAdminLine({})}</span>
                                <p className="text">المسؤلون</p>
                            </li>
                        </Link>
                    )}
                </ul>
                <div className="theme">
                    <p>السطوع</p>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={(e) => toggleTheme()}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="account">
                    <div className="user-info">
                        <p className="username">{user.username}</p>
                        <p className="role">مدير النظام</p>
                    </div>
                    <span className="logout" onClick={logout}>
                        {FiLogOut({})}
                    </span>
                </div>
            </aside>
            <div className={`blurOverLay ${active? `active`:''}`} onClick={()=>setActive(false)}></div>
        </>
    )
}

export default SideBar