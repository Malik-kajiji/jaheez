import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useVoucherTypes } from '../hooks/useVoucherTypes'
import { AddVoucherTypeModal } from '../components/AddVoucherTypeModal'
import '../styles/vouchers.scss'
import { FaPlus, FaTrash } from 'react-icons/fa'

export const Vouchers = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const { getVoucherTypes, deleteVoucherType, loading } = useVoucherTypes()
    const [voucherTypes, setVoucherTypes] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState('')

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchVoucherTypes()
    }, [user])

    const fetchVoucherTypes = async () => {
        const types = await getVoucherTypes()
        if (types) {
            setVoucherTypes(types)
        }
    }

    const handleTypeClick = (type) => {
        navigate(`/vouchers/${type._id}/versions`)
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        // Refresh the list after adding new type
        fetchVoucherTypes()
    }

    const handleDelete = async (e, typeId) => {
        e.stopPropagation() // Prevent card click
        setDeleteLoading(typeId)
        try {
            await deleteVoucherType(typeId)
            // Refresh list after delete
            fetchVoucherTypes()
        } catch (error) {
            console.error('Error deleting voucher type:', error)
        } finally {
            setDeleteLoading('')
        }
    }

    if (loading) {
        return (
            <section className='container vouchers'>
                <div className="loading">جاري التحميل...</div>
            </section>
        )
    }

    return (
        <section className='container vouchers'>
            <div className="header">
                <div className="title">
                    <h1 className="TXT-heading color-normal">الكروت</h1>
                    <p className="TXT-normal color-light">إدارة الكروت</p>
                </div>
                <button 
                    className="create-btn"
                    onClick={handleOpenModal}
                >
                    <FaPlus />
                    <span>إضافة فئة جديدة</span>
                </button>
            </div>

            <div className="cards-container">
                <div className="voucher-types">
                    {voucherTypes.map(type => (
                        <div 
                            key={type._id} 
                            className="voucher-card"
                            onClick={() => handleTypeClick(type)}
                        >
                            <div className="delete-btn" onClick={(e) => handleDelete(e, type._id)}>
                                {deleteLoading === type._id ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    <FaTrash />
                                )}
                            </div>
                            <div className="value">
                                <h2>
                                    <span>{type.voucherValue}</span>
                                    دينار
                                </h2>
                            </div>
                            <div className="available-count">
                                <p>الكروت المتاحة:</p>
                                <span className="count">{type.availableCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddVoucherTypeModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </section>
    )
}

export default Vouchers