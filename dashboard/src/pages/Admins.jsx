import React, { useEffect, useState } from 'react'
import '../styles/admins.scss';
import { useAdmins } from '../hooks/useAdmins';

export const Admins = () => {
    const { searched, isLoading, addLoading, handleSearch, handleAdd, handleEdit, handleDelete, handleChangePassword } = useAdmins();
    const [adminToEdit, setAdminToEdit] = useState(null);
    const [isAddShowen, setIsAddShowen] = useState(false);


    const [changeAdminPass, setChangeAdminPass] = useState(null);
    const [passInput, setPassInput] = useState('')


    const handleCancel = () => {
        setChangeAdminPass(null)
        setPassInput('')
    }

    const handelSave = async () => {
        await handleChangePassword(changeAdminPass, passInput)
        handleCancel()
    }




    if (isLoading) return <h2>Loading</h2>
    return (
        <>
            <section className='container admins'>
                <header className='admins-header'>
                    <input
                        type="text"
                        className='TXT-normal'
                        placeholder='بحث'
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <button className='P-BTN' onClick={() => setIsAddShowen(true)}>
                        إضافة مسؤول
                    </button>
                </header>
                <div className='admins-holder'>
                    {searched.map((e, i) => <article
                        key={i}
                        className='admin'
                    >
                        <h2 className='TXT-heading2'>{e.username}</h2>
                        <p className='TXT-normal'><span>
                            سماحية تعديل المواقع
                        </span>
                            <span className='number'>
                                {e.access.includes('websites') ? 'نعم' : 'لا'}
                            </span></p>
                        <p className='TXT-normal'><span>
                            سماحية تعديل الطلبات
                        </span>
                            <span className='number'>
                                {e.access.includes('orders') ? 'نعم' : 'لا'}
                            </span></p>

                        <p className='TXT-normal'><span>
                            سماحية تعديل الحجوزات
                        </span>
                            <span className='number'>
                                {e.access.includes('ordering') ? 'نعم' : 'لا'}
                            </span></p>

                        <p className='TXT-normal'><span>
                            سماحية تعديل الشحنات
                        </span>
                            <span className='number'>
                                {e.access.includes('shipments') ? 'نعم' : 'لا'}
                            </span></p>
                        <p className='TXT-normal'><span>
                            سماحية عرض الأرباح
                        </span>
                            <span className='number'>
                                {e.access.includes('profits') ? 'نعم' : 'لا'}
                            </span></p>
                        <p className='TXT-normal'><span>
                            سماحية تعديل المستحقات
                        </span>
                            <span className='number'>
                                {e.access.includes('payments') ? 'نعم' : 'لا'}
                            </span></p>
                        <p className='TXT-normal'><span>
                            سماحية تعديل الكوبونات
                        </span>
                            <span className='number'>
                                {e.access.includes('coupons') ? 'نعم' : 'لا'}
                            </span></p>
                        {changeAdminPass === e._id ?
                            <div className='change-pass-holder'>
                                <input
                                    className='change-pass-input TXT-normal color-normal'
                                    type="text"
                                    value={passInput}
                                    onChange={(e) => setPassInput(e.target.value)}
                                />
                                <h3 className='save-txt TXT-normal color-normal'>
                                    <span className='save' onClick={handelSave}>حفظ</span>
                                    /
                                    <span className='cancel' onClick={handleCancel}>إلغاء</span>
                                </h3>
                            </div>
                            :
                            <button className='change-pass-btn S-BTN' onClick={() => setChangeAdminPass(e._id)}>
                                تغيير الرمز
                            </button>
                        }
                        <button className='P-BTN edit-btn' onClick={() => setAdminToEdit(e)}>
                            تعديل
                        </button>
                    </article>)}
                </div>
            </section>
        </>
    )
}
