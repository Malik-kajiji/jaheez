import React, { useState } from 'react';
import { useVoucherTypes } from '../hooks/useVoucherTypes';
import '../styles/modal.scss';

export const AddVoucherTypeModal = ({ isOpen, onClose }) => {
  const [voucherValue, setVoucherValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createVoucherType } = useVoucherTypes();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    if (!voucherValue) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Send just the voucherValue as expected by the backend
      const result = await createVoucherType({ voucherValue: Number(voucherValue) });
      if (result) {
        setVoucherValue('');
        onClose(); // Close modal only on success
      }
    } catch (error) {
      console.error('Error creating voucher type:', error);
      setError(error.message || 'حدث خطأ أثناء إضافة فئة الكرت');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVoucherValue('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="TXT-heading2 color-normal">إضافة فئة جديدة</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="voucherValue">قيمة الكرت</label>
            <input
              type="number"
              id="voucherValue"
              value={voucherValue}
              onChange={(e) => setVoucherValue(e.target.value)}
              placeholder="أدخل قيمة الكرت"
              min="1"
              required
            />
            {error && <span className="error-message">{error}</span>}
          </div>

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
              disabled={isLoading || !voucherValue}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  جاري الإضافة...
                </>
              ) : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVoucherTypeModal;