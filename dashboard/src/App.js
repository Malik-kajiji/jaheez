import React, { useEffect, useState } from 'react';
import Sidebar from './components/SideBar'
import Alert from './components/Alert'
import { HashRouter, Route, Routes } from 'react-router-dom';
import {
  Home,
  Admins,
  AdminLogin,
  CarTows,
  Users,
  Trips,
  Vouchers,
  VoucherVersions,
  Profits,
  Coupons,
  Settings
} from './pages'
import UserState from './components/UserState';
import { useSelector } from 'react-redux';


function App() {
  const user = useSelector(state => state.userController.user)
  const [theme,setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(prev => {
      if(prev === 'light'){
        window.localStorage.setItem('theme','dark')
        return 'dark'
      }else {
        window.localStorage.setItem('theme','light')
        return 'light'
      }
    })
  }

  useEffect(()=>{
    const storageTheme = window.localStorage.getItem('theme')
    if(storageTheme){
      setTheme(storageTheme)
    }
  },[])
  return (
    <main className={`App ${theme}`}>
      <HashRouter >
        <Alert />
        {user && <Sidebar theme={theme} toggleTheme={toggleTheme} />}
        <UserState />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car-tows" element={<CarTows />} />
          <Route path="/users" element={<Users />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/vouchers/:voucherTypeId/versions" element={<VoucherVersions />} />
          <Route path="/profits" element={<Profits />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/login" element={<AdminLogin />}/>
        </Routes>
      </HashRouter>
    </main>
  );
}

export default App;
