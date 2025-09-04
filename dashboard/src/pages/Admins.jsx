import React, { useEffect, useState } from 'react'
import '../styles/admins.scss';
import { useAdmins } from '../hooks/useAdmins';
import { FiSearch, FiEdit2, FiTrash2, FiKey, FiPlus, FiAlertCircle } from 'react-icons/fi';

export const Admins = () => {
    const { searched, isLoading, addLoading, handleSearch, handleAdd, handleEdit, handleDelete, handleChangePassword } = useAdmins();
    const [adminToEdit, setAdminToEdit] = useState(null);
    const [isAddShowen, setIsAddShowen] = useState(false);
    const [changeAdminPass, setChangeAdminPass] = useState(null);
    const [passInput, setPassInput] = useState('');
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', access: [] });
    const [adminToDelete, setAdminToDelete] = useState(null);

    const handleCancel = () => {
        setChangeAdminPass(null);
        setPassInput('');
    }

    const handleSave = async () => {
        await handleChangePassword(changeAdminPass, passInput);
        handleCancel();
    }

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        await handleAdd(newAdmin, setIsAddShowen);
        setNewAdmin({ username: '', password: '', access: [] });
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (adminToEdit) {
            await handleEdit(adminToEdit.access, adminToEdit._id, setAdminToEdit);
        }
    }

    const confirmDelete = async () => {
        if (adminToDelete) {
            await handleDelete(adminToDelete);
            setAdminToDelete(null);
        }
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <section className="admins-page">
            <div className="header">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="بحث عن مسؤول..."
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <button className="add-btn P-BTN" onClick={() => setIsAddShowen(true)}>
                    <FiPlus /> إضافة مسؤول جديد
                </button>
            </div>

            <div className="admins-list">
                {searched.map((admin) => (
                    <div key={admin._id} className="admin-card">
                        <div className="admin-info">
                            <h3>{admin.username}</h3>
                            <div className="access-tags">
                                {admin.access.map((access) => (
                                    <span key={access} className="tag">
                                        {access === 'car-tows' && 'الساحبات'}
                                        {access === 'users' && 'المستخدمين'}
                                        {access === 'vouchers' && 'الكروت'}
                                        {access === 'profits' && 'الأرباح'}
                                        {access === 'coupons' && 'الكوبونات'}
                                        {access === 'settings' && 'الإعدادات'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="actions">
                            <button className="icon-btn" onClick={() => setAdminToEdit(admin)}>
                                <FiEdit2 />
                            </button>
                            <button className="icon-btn" onClick={() => setChangeAdminPass(admin._id)}>
                                <FiKey />
                            </button>
                            <button className="icon-btn delete" onClick={() => setAdminToDelete(admin._id)}>
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isAddShowen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>إضافة مسؤول جديد</h2>
                        <form onSubmit={handleAddSubmit}>
                            <div className="input-group">
                                <label>اسم المستخدم</label>
                                <input
                                    type="text"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>كلمة المرور</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>الصلاحيات</label>
                                <div className="access-options">
                                    {[
                                        { value: 'car-tows', label: 'الساحبات' },
                                        { value: 'users', label: 'المستخدمين' },
                                        { value: 'vouchers', label: 'الكروت' },
                                        { value: 'profits', label: 'الأرباح' },
                                        { value: 'coupons', label: 'الكوبونات' },
                                        { value: 'settings', label: 'الإعدادات' }
                                    ].map(({ value, label }) => (
                                        <label key={value} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={newAdmin.access.includes(value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewAdmin({ ...newAdmin, access: [...newAdmin.access, value] });
                                                    } else {
                                                        setNewAdmin({
                                                            ...newAdmin,
                                                            access: newAdmin.access.filter((a) => a !== value),
                                                        });
                                                    }
                                                }}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className={`P-BTN ${addLoading ? 'clicked' : ''}`}>
                                    إضافة
                                </button>
                                <button type="button" className="S-BTN" onClick={() => setIsAddShowen(false)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {adminToEdit && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>تعديل الصلاحيات</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="input-group">
                                <label>الصلاحيات</label>
                                <div className="access-options">
                                    {[
                                        { value: 'car-tows', label: 'الساحبات' },
                                        { value: 'users', label: 'المستخدمين' },
                                        { value: 'vouchers', label: 'الكروت' },
                                        { value: 'profits', label: 'الأرباح' },
                                        { value: 'coupons', label: 'الكوبونات' },
                                        { value: 'settings', label: 'الإعدادات' }
                                    ].map(({ value, label }) => (
                                        <label key={value} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={adminToEdit.access.includes(value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAdminToEdit({
                                                            ...adminToEdit,
                                                            access: [...adminToEdit.access, value],
                                                        });
                                                    } else {
                                                        setAdminToEdit({
                                                            ...adminToEdit,
                                                            access: adminToEdit.access.filter((a) => a !== value),
                                                        });
                                                    }
                                                }}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className={`P-BTN ${addLoading ? 'clicked' : ''}`}>
                                    حفظ
                                </button>
                                <button type="button" className="S-BTN" onClick={() => setAdminToEdit(null)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {changeAdminPass && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>تغيير كلمة المرور</h2>
                        <div className="input-group">
                            <label>كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                value={passInput}
                                onChange={(e) => setPassInput(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="P-BTN" onClick={handleSave}>
                                حفظ
                            </button>
                            <button className="S-BTN" onClick={handleCancel}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {adminToDelete && (
                <div className="modal">
                    <div className="modal-content delete-confirmation">
                        <div className="warning-icon">
                            <FiAlertCircle />
                        </div>
                        <h2>تأكيد الحذف</h2>
                        <p>هل أنت متأكد من حذف هذا المسؤول؟</p>
                        <div className="modal-actions">
                            <button className="P-BTN delete" onClick={confirmDelete}>
                                حذف
                            </button>
                            <button className="S-BTN" onClick={() => setAdminToDelete(null)}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
