import React, { useEffect, useState } from 'react';
import '../styles/sidebar.scss';
import { AiOutlineHome, AiOutlineMenu } from 'react-icons/ai';
import { FaHandHoldingDollar } from "react-icons/fa6";
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
    const { pathname } = useLocation()


    const showTap = tap => (user.access.includes(tap) || user.access.includes('owner'))

    return (
        <>
            <aside className={`sidebar ${active? `active`:''}`}>
                <button className={`slideBtn x-large-fs light-gray`} onClick={()=>setActive(prev => !prev)}>
                    {AiOutlineMenu({})}
                </button>
                <div className={`logo`}>
                    <img src="/images/logo.png" alt="" />
                </div>
                <ul className={'ul'} role='list'>
                    <Link to='/'>
                        <li 
                            className={`li ${pathname === '/' && 'active'}`} 
                            onClick={()=>setActive(false)}
                            >
                            <span className={`icon TXT-heading2 color-light`}>{AiOutlineHome({})}</span>
                            <p className={`text color-normal TXT-heading3`}>الرئيسية</p>
                        </li >
                    </Link>
                    {showTap('car-tows') &&
                        <Link to='/car-tows'>
                            <li 
                                className={`li ${pathname === '/car-tows' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{GiTowTruck({})}</span>
                                <p className={`text color-normal TXT-heading3`}>الساحبات</p>
                            </li>
                        </Link>
                    }
                    {showTap('users') &&
                        <Link to='/users'>
                            <li 
                                className={`li ${pathname === '/users' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{FiUsers({})}</span>
                                <p className={`text color-normal TXT-heading3`}>المستخدمون</p>
                            </li>
                        </Link>
                    }
                    {showTap('vouchers') &&
                        <Link to='/vouchers'>
                            <li 
                                className={`li ${pathname === '/vouchers' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{PiMoneyWavyLight({})}</span>
                                <p className={`text color-normal TXT-heading3`}>الكروت</p>
                            </li>
                        </Link>
                    }
                    {showTap('profits') &&
                        <Link to='/profits'>
                            <li 
                                className={`li ${pathname.startsWith('/profits') && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{FaHandHoldingDollar({})}</span>
                                <p className={`text color-normal TXT-heading3`}>الأرباح</p>
                            </li>
                        </Link>
                    }
                    {showTap('coupons') &&
                        <Link to='/coupons'>
                            <li 
                                className={`li ${pathname === '/coupons' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{RiCoupon3Line({})}</span>
                                <p className={`text color-normal TXT-heading3`}>الكوبونات</p>
                            </li>
                        </Link>
                    }
                    {showTap('settings') &&
                        <Link to='/settings'>
                            <li 
                                className={`li ${pathname === '/settings' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{IoSettingsOutline({})}</span>
                                <p className={`text color-normal TXT-heading3`}>الإعدادات</p>
                            </li>
                        </Link>
                    }
                    {(user.access.includes('owner')) &&
                        <Link to='/admins'>
                            <li 
                                className={`li ${pathname === '/admins' && 'active'}`} 
                                onClick={()=>setActive(false)}
                            >
                                <span className={`icon TXT-heading2 color-light`}>{RiAdminLine({})}</span>
                                <p className={`text color-normal TXT-heading3`}>المسؤلون</p>
                            </li>
                        </Link>
                    }
                </ul>
                <div className='theme'>
                    <p className='TXT-normal'>السطوع</p>
                    <button className={`${theme === 'dark' && 'switchLeft'}`} onClick={toggleTheme}>
                        <span></span>
                    </button>
                </div>
                <div className='account'>
                    <span className='logout TXT-heading3 color-light' onClick={logout}>
                        {FiLogOut({})}
                    </span>
                    <p className='username color-normal TXT-normal'>{user.username}</p>
                </div>
            </aside>
            <div className={`blurOverLay ${active? `active`:''}`}></div>
        </>
    )
}

export default SideBar