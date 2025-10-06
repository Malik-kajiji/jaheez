import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/modal.scss';

export const SendNotificationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    notificationType: 'for-users',
    isForOneUser: false,
    targetPhoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || formData.title.trim().length === 0) {
      setError('عنوان الإشعار مطلوب');
      return;
    }

    if (!formData.body || formData.body.trim().length === 0) {
      setError('محتوى الإشعار مطلوب');
      return;
    }

    if (formData.isForOneUser && (!formData.targetPhoneNumber || formData.targetPhoneNumber.trim().length === 0)) {
      setError('رقم الهاتف مطلوب للإرسال لمستخدم محدد');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const notificationData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        notificationType: formData.notificationType,
        isForOneUser: formData.isForOneUser
      };

      if (formData.isForOneUser) {
        notificationData.targetPhoneNumber = formData.targetPhoneNumber.trim();
      }

      const result = await sendNotification(notificationData);
      if (result) {
        handleClose();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      body: '',
      notificationType: 'for-users',
      isForOneUser: false,
      targetPhoneNumber: ''
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
      <div className="modal-content notification-modal" onClick={e => e.stopPropagation()}>
        <h2 className="TXT-heading2 color-normal">إنشاء إشعار</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>عنوان الإشعار</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="أدخل عنوان الإشعار"
              required
            />
          </div>

          <div className="input-group">
            <label>محتوى الإشعار</label>
            <textarea
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="أدخل محتوى الإشعار"
              rows="4"
              required
            />
          </div>

          <div className="input-group">
            <label>إرسال إلى</label>
            <select
              value={formData.notificationType}
              onChange={(e) => handleChange('notificationType', e.target.value)}
            >
              <option value="for-users">المستخدمين</option>
              <option value="for-drivers">السائقين</option>
            </select>
          </div>

          <div className="input-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isForOneUser}
                onChange={(e) => handleChange('isForOneUser', e.target.checked)}
              />
              <span>إرسال لمستخدم محدد</span>
            </label>
          </div>

          {formData.isForOneUser && (
            <div className="input-group">
              <label>رقم الهاتف</label>
              <input
                type="text"
                value={formData.targetPhoneNumber}
                onChange={(e) => handleChange('targetPhoneNumber', e.target.value)}
                placeholder="أدخل رقم الهاتف"
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
                  جاري الإرسال...
                </>
              ) : 'إرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;