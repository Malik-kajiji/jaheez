import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { FaMoneyBillWave, FaMapMarkerAlt, FaGift, FaBox, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DropImage from '../components/DropImage';
import '../styles/settings.scss';

export const Settings = () => {
    const user = useSelector(state => state.userController.user);
    const navigate = useNavigate();
    const {
        settings,
        packages,
        isLoading,
        updatePriceRanges,
        updateMaxSearchRange,
        updateReferralPrize,
        createPackage,
        updatePackage,
        deletePackage
    } = useSettings();

    const [activeModal, setActiveModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Price ranges state
    const [priceRanges, setPriceRanges] = useState([]);

    // Max search range state
    const [maxSearchRange, setMaxSearchRange] = useState('');

    // Referral prize state
    const [referralPrize, setReferralPrize] = useState('');

    // Package state
    const [packageForm, setPackageForm] = useState({
        _id: null,
        name: '',
        price: '',
        durationInDays: '',
        isThereDiscount: false,
        priceAfterDiscount: '',
        packageImage: '',
        description: '',
        badgeLabel: '',
        statusText: '',
        statusTone: 'info',
        ctaText: 'اشتراك الان',
        isActive: true
    });
    const [packageImageFile, setPackageImageFile] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user]);

    useEffect(() => {
        if (settings) {
            setPriceRanges(settings.priceRanges || []);
            setMaxSearchRange(settings.maxSearchRangeKm || '');
            setReferralPrize(settings.referralPrize || '');
        }
    }, [settings]);

    const openModal = (modalName) => {
        setActiveModal(modalName);
    };

    const closeModal = () => {
        setActiveModal(null);
        setPackageForm({
            _id: null,
            name: '',
            price: '',
            durationInDays: '',
            isThereDiscount: false,
            priceAfterDiscount: '',
            packageImage: '',
            description: '',
            badgeLabel: '',
            statusText: '',
            statusTone: 'info',
            ctaText: 'اشتراك الان',
            isActive: true
        });
        setPackageImageFile([]);
    };

    // Price Ranges handlers
    const addPriceRange = () => {
        setPriceRanges([...priceRanges, { fromKm: 0, toKm: 0, startingPrice: 0, pricePerKm: 0 }]);
    };

    const removePriceRange = (index) => {
        setPriceRanges(priceRanges.filter((_, i) => i !== index));
    };

    const updatePriceRange = (index, field, value) => {
        const updated = [...priceRanges];
        updated[index][field] = parseFloat(value) || 0;
        setPriceRanges(updated);
    };

    const handleSavePriceRanges = async () => {
        try {
            setModalLoading(true);
            await updatePriceRanges(priceRanges);
            closeModal();
        } catch (error) {
            console.error(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Max Search Range handlers
    const handleSaveMaxSearchRange = async () => {
        try {
            setModalLoading(true);
            await updateMaxSearchRange(parseFloat(maxSearchRange));
            closeModal();
        } catch (error) {
            console.error(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Referral Prize handlers
    const handleSaveReferralPrize = async () => {
        try {
            setModalLoading(true);
            await updateReferralPrize(parseFloat(referralPrize));
            closeModal();
        } catch (error) {
            console.error(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Package handlers
    const handleEditPackage = (pkg) => {
        setPackageForm({
            _id: pkg._id,
            name: pkg.name,
            price: pkg.price,
            durationInDays: pkg.durationInDays,
            isThereDiscount: pkg.isThereDiscount,
            priceAfterDiscount: pkg.priceAfterDiscount || '',
            packageImage: pkg.packageImage,
            description: Array.isArray(pkg.description) ? pkg.description.join('\n') : '',
            badgeLabel: pkg.badgeLabel || '',
            statusText: pkg.statusText || '',
            statusTone: pkg.statusTone || 'info',
            ctaText: pkg.ctaText || 'اشتراك الان',
            isActive: pkg.isActive !== undefined ? pkg.isActive : true
        });
        openModal('packages');
    };

    const handleDeletePackage = async (packageId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            return;
        }
        try {
            await deletePackage(packageId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSavePackage = async () => {
        try {
            setModalLoading(true);
            
            // Use the uploaded image if available, otherwise use the existing URL
            let imageToSave = packageForm.packageImage;
            if (packageImageFile.length > 0) {
                imageToSave = packageImageFile[0];
            }
            
            const packageData = {
                name: packageForm.name,
                price: parseFloat(packageForm.price),
                durationInDays: parseInt(packageForm.durationInDays),
                isThereDiscount: packageForm.isThereDiscount,
                priceAfterDiscount: packageForm.isThereDiscount ? parseFloat(packageForm.priceAfterDiscount) : undefined,
                packageImage: imageToSave,
                description: (packageForm.description || '').split('\n').map(t => t.trim()).filter(Boolean),
                badgeLabel: packageForm.badgeLabel || undefined,
                statusText: packageForm.statusText || undefined,
                statusTone: packageForm.statusTone || undefined,
                ctaText: packageForm.ctaText || undefined,
                isActive: packageForm.isActive
            };

            if (packageForm._id) {
                await updatePackage(packageForm._id, packageData);
            } else {
                await createPackage(packageData);
            }
            closeModal();
        } catch (error) {
            console.error(error);
        } finally {
            setModalLoading(false);
        }
    };

    if (isLoading) {
        return (
            <section className='container settings'>
                <div className="loading">جاري التحميل...</div>
            </section>
        );
    }

    return (
        <section className='container settings'>
            <h1 className="TXT-heading color-normal">الإعدادات</h1>
            <p className="TXT-normal color-light">إدارة إعدادات التطبيق</p>

            <div className="settings-grid">
                {/* Price Ranges Card */}
                <div className="setting-card" onClick={() => openModal('priceRanges')}>
                    <div className="card-icon">
                        <FaMoneyBillWave />
                    </div>
                    <h3>حساب سعر الرحلة</h3>
                    <p>إدارة نطاقات الأسعار حسب المسافة</p>
                    <div className="card-value">
                        {priceRanges.length} نطاق
                    </div>
                </div>

                {/* Max Search Range Card */}
                <div className="setting-card" onClick={() => openModal('maxSearchRange')}>
                    <div className="card-icon">
                        <FaMapMarkerAlt />
                    </div>
                    <h3>المسافة القصوى للبحث</h3>
                    <p>أقصى مسافة يمكن للمستخدم البحث فيها عن سائق</p>
                    <div className="card-value">
                        {maxSearchRange} كم
                    </div>
                </div>

                {/* Referral Prize Card */}
                <div className="setting-card" onClick={() => openModal('referralPrize')}>
                    <div className="card-icon">
                        <FaGift />
                    </div>
                    <h3>جائزة الإحالة</h3>
                    <p>المبلغ المكتسب عند دعوة صديق كسائق</p>
                    <div className="card-value">
                        {referralPrize} د.ل
                    </div>
                </div>

                {/* Packages Card */}
                <div className="setting-card" onClick={() => openModal('packages')}>
                    <div className="card-icon">
                        <FaBox />
                    </div>
                    <h3>الباقات</h3>
                    <p>إدارة باقات الاشتراك</p>
                    <div className="card-value">
                        {packages.length} باقة
                    </div>
                </div>
            </div>

            {/* Price Ranges Modal */}
            {activeModal === 'priceRanges' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>نطاقات الأسعار</h2>
                        <div className="price-ranges-list">
                            {priceRanges.map((range, index) => (
                                <div key={index} className="price-range-item">
                                    <div className="range-inputs">
                                        <div className="input-group">
                                            <label>من (كم)</label>
                                            <input
                                                type="number"
                                                value={range.fromKm}
                                                onChange={(e) => updatePriceRange(index, 'fromKm', e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>إلى (كم)</label>
                                            <input
                                                type="number"
                                                value={range.toKm}
                                                onChange={(e) => updatePriceRange(index, 'toKm', e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>السعر الابتدائي (د.ل)</label>
                                            <input
                                                type="number"
                                                value={range.startingPrice}
                                                onChange={(e) => updatePriceRange(index, 'startingPrice', e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>السعر لكل كم (د.ل)</label>
                                            <input
                                                type="number"
                                                value={range.pricePerKm}
                                                onChange={(e) => updatePriceRange(index, 'pricePerKm', e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removePriceRange(index)}
                                        disabled={priceRanges.length === 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="add-range-btn" onClick={addPriceRange}>
                            <FaPlus /> إضافة نطاق
                        </button>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal} disabled={modalLoading}>
                                إلغاء
                            </button>
                            <button className="submit-btn" onClick={handleSavePriceRanges} disabled={modalLoading}>
                                {modalLoading ? <span className="loading-spinner"></span> : 'حفظ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Max Search Range Modal */}
            {activeModal === 'maxSearchRange' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>المسافة القصوى للبحث</h2>
                        <div className="input-group">
                            <label>المسافة القصوى (كم)</label>
                            <input
                                type="number"
                                value={maxSearchRange}
                                onChange={(e) => setMaxSearchRange(e.target.value)}
                                min="1"
                                placeholder="أدخل المسافة القصوى"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal} disabled={modalLoading}>
                                إلغاء
                            </button>
                            <button className="submit-btn" onClick={handleSaveMaxSearchRange} disabled={modalLoading}>
                                {modalLoading ? <span className="loading-spinner"></span> : 'حفظ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Referral Prize Modal */}
            {activeModal === 'referralPrize' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>جائزة الإحالة</h2>
                        <div className="input-group">
                            <label>المبلغ المكتسب (د.ل)</label>
                            <input
                                type="number"
                                value={referralPrize}
                                onChange={(e) => setReferralPrize(e.target.value)}
                                min="0"
                                placeholder="أدخل المبلغ"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal} disabled={modalLoading}>
                                إلغاء
                            </button>
                            <button className="submit-btn" onClick={handleSaveReferralPrize} disabled={modalLoading}>
                                {modalLoading ? <span className="loading-spinner"></span> : 'حفظ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Packages Modal */}
            {activeModal === 'packages' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content packages-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>إدارة الباقات</h2>
                        
                        {/* Package Form */}
                        <div className="package-form">
                            <div className="input-group">
                                <label>اسم الباقة</label>
                                <input
                                    type="text"
                                    value={packageForm.name}
                                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                    placeholder="أدخل اسم الباقة"
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>السعر (د.ل)</label>
                                    <input
                                        type="number"
                                        value={packageForm.price}
                                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                                        min="0"
                                        placeholder="السعر"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>المدة (أيام)</label>
                                    <input
                                        type="number"
                                        value={packageForm.durationInDays}
                                        onChange={(e) => setPackageForm({ ...packageForm, durationInDays: e.target.value })}
                                        min="1"
                                        placeholder="المدة"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>وصف الباقة (سطر لكل نقطة)</label>
                                <textarea
                                    value={packageForm.description}
                                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="أدخل وصف الباقة"
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>عنوان الشارة (اختياري)</label>
                                    <input
                                        type="text"
                                        value={packageForm.badgeLabel}
                                        onChange={(e) => setPackageForm({ ...packageForm, badgeLabel: e.target.value })}
                                        placeholder="مثال: 3"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>نص الحالة</label>
                                    <input
                                        type="text"
                                        value={packageForm.statusText}
                                        onChange={(e) => setPackageForm({ ...packageForm, statusText: e.target.value })}
                                        placeholder="مثال: متاح"
                                    />
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>درجة الحالة</label>
                                    <select
                                        value={packageForm.statusTone}
                                        onChange={(e) => setPackageForm({ ...packageForm, statusTone: e.target.value })}
                                    >
                                        <option value="info">اعتيادي</option>
                                        <option value="success">نجاح</option>
                                        <option value="warning">تحذير</option>
                                        <option value="danger">خطر</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>نص الزر</label>
                                    <input
                                        type="text"
                                        value={packageForm.ctaText}
                                        onChange={(e) => setPackageForm({ ...packageForm, ctaText: e.target.value })}
                                        placeholder="مثال: اشتراك الان"
                                    />
                                </div>
                            </div>
                            <div className="input-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={packageForm.isThereDiscount}
                                        onChange={(e) => setPackageForm({ ...packageForm, isThereDiscount: e.target.checked })}
                                    />
                                    يوجد خصم
                                </label>
                            </div>
                            <div className="input-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={packageForm.isActive}
                                        onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                                    />
                                    الباقة فعّالة
                                </label>
                            </div>
                            {packageForm.isThereDiscount && (
                                <div className="input-group">
                                    <label>السعر بعد الخصم (د.ل)</label>
                                    <input
                                        type="number"
                                        value={packageForm.priceAfterDiscount}
                                        onChange={(e) => setPackageForm({ ...packageForm, priceAfterDiscount: e.target.value })}
                                        min="0"
                                        placeholder="السعر بعد الخصم"
                                    />
                                </div>
                            )}
                            <div className="input-group">
                                <label>صورة الباقة</label>
                                <DropImage setAcceptedFile={setPackageImageFile} maxFiles={1}>
                                    <div className="drop-zone">
                                        {packageImageFile.length > 0 ? (
                                            <div className="image-preview">
                                                <img src={packageImageFile[0]} alt="Package preview" />
                                                <p>اضغط أو اسحب لتغيير الصورة</p>
                                            </div>
                                        ) : packageForm.packageImage ? (
                                            <div className="image-preview">
                                                <img src={packageForm.packageImage} alt="Package preview" />
                                                <p>اضغط أو اسحب لتغيير الصورة</p>
                                            </div>
                                        ) : (
                                            <div className="drop-placeholder">
                                                <FaPlus />
                                                <p>اضغط أو اسحب الصورة هنا</p>
                                                <span>PNG, JPG, GIF حتى 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                </DropImage>
                            </div>
                            <button className="save-package-btn" onClick={handleSavePackage} disabled={modalLoading}>
                                {modalLoading ? <span className="loading-spinner"></span> : (packageForm._id ? 'تحديث الباقة' : 'إضافة باقة')}
                            </button>
                        </div>

                        {/* Packages List */}
                        <div className="packages-list">
                            <h3>الباقات الحالية</h3>
                            {packages.map((pkg) => (
                                <div key={pkg._id} className="package-item">
                                    <div className="package-info">
                                        <h4>{pkg.name}</h4>
                                        <p>
                                            {pkg.isThereDiscount ? (
                                                <>
                                                    <span className="original-price">{pkg.price} د.ل</span>
                                                    <span className="discount-price">{pkg.priceAfterDiscount} د.ل</span>
                                                </>
                                            ) : (
                                                <span>{pkg.price} د.ل</span>
                                            )}
                                            {' - '}
                                            {pkg.durationInDays} يوم
                                            {pkg.statusText ? ` - ${pkg.statusText}` : ''}
                                            {pkg.isActive === false ? ' (غير فعّالة)' : ''}
                                        </p>
                                        {pkg.badgeLabel ? <p>شارة: {pkg.badgeLabel}</p> : null}
                                        {Array.isArray(pkg.description) && pkg.description.length > 0 && (
                                            <ul className="package-desc-list">
                                                {pkg.description.map((line, idx) => (
                                                    <li key={idx}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="package-actions">
                                        <button className="edit-btn" onClick={() => handleEditPackage(pkg)}>
                                            <FaEdit />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeletePackage(pkg._id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal}>
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};