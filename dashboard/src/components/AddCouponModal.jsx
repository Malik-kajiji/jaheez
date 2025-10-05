import React, { useState } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import '../styles/modal.scss';

export const AddCouponModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    couponCode: '',
    discountype: 'amount',
    discountValue: '',
    expireType: 'usage',
    allowedUsageTimes: '',
    expireDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createCoupon } = useCoupons();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.couponCode || formData.couponCode.trim().length < 2) {
      setError('كود الكوبون يجب أن يكون حرفين على الأقل');
      return;
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      setError('قيمة الخصم يجب أن تكون أكبر من 0');
      return;
    }

    if (formData.expireType === 'usage' && (!formData.allowedUsageTimes || formData.allowedUsageTimes <= 0)) {
      setError('عدد مرات الاستخدام المسموحة مطلوب');
      return;
    }

    if (formData.expireType === 'date' && !formData.expireDate) {
      setError('تاريخ انتهاء الصلاحية مطلوب');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const couponData = {
        couponCode: formData.couponCode.trim(),
        discountype: formData.discountype,
        discountValue: Number(formData.discountValue),
        expireType: formData.expireType
      };

      if (formData.expireType === 'usage') {
        couponData.allowedUsageTimes = Number(formData.allowedUsageTimes);
      } else {
        couponData.expireDate = formData.expireDate;
      }

      const result = await createCoupon(couponData);
      if (result) {
        handleClose();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء الكوبون');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      couponCode: '',
      discountype: 'amount',
      discountValue: '',
      expireType: 'usage',
      allowedUsageTimes: '',
      expireDate: ''
    });
    setError('');
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content coupon-modal" onClick={e => e.stopPropagation()}>
        <h2 className="TXT-heading2 color-normal">إنشاء كوبون جديد</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>كود الكوبون</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => handleChange('couponCode', e.target.value)}
              placeholder="أدخل كود الكوبون (حروف وأرقام فقط)"
              minLength="2"
              required
            />
          </div>

          <div className="input-group">
            <label>نوع الخصم</label>
            <select
              value={formData.discountype}
              onChange={(e) => handleChange('discountype', e.target.value)}
            >
              <option value="amount">مبلغ ثابت (دينار)</option>
              <option value="percentage">نسبة مئوية (%)</option>
            </select>
          </div>

          <div className="input-group">
            <label>
              قيمة الخصم {formData.discountype === 'amount' ? '(دينار)' : '(%)'}
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => handleChange('discountValue', e.target.value)}
              placeholder={formData.discountype === 'amount' ? 'أدخل المبلغ' : 'أدخل النسبة'}
              min="1"
              max={formData.discountype === 'percentage' ? '100' : undefined}
              required
            />
          </div>

          <div className="input-group">
            <label>نوع انتهاء الصلاحية</label>
            <select
              value={formData.expireType}
              onChange={(e) => handleChange('expireType', e.target.value)}
            >
              <option value="usage">عدد مرات الاستخدام</option>
              <option value="date">تاريخ محدد</option>
            </select>
          </div>

          {formData.expireType === 'usage' ? (
            <div className="input-group">
              <label>عدد مرات الاستخدام المسموحة</label>
              <input
                type="number"
                value={formData.allowedUsageTimes}
                onChange={(e) => handleChange('allowedUsageTimes', e.target.value)}
                placeholder="أدخل عدد المرات"
                min="1"
                required
              />
            </div>
          ) : (
            <div className="input-group">
              <label>تاريخ انتهاء الصلاحية</label>
              <input
                type="date"
                value={formData.expireDate}
                onChange={(e) => handleChange('expireDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button 
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  جاري الإنشاء...
                </>
              ) : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCouponModal;