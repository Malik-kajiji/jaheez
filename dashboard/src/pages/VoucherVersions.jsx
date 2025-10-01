import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/voucherVersions.scss'
import { useVoucherTypes } from '../hooks/useVoucherTypes'
import { useVouchers } from '../hooks/useVouchers'
import { alertActions } from '../redux/AlertController'
import { FaArrowLeft, FaEye, FaPlus, FaDownload } from 'react-icons/fa'

export const VoucherVersions = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { voucherTypeId } = useParams()
    const { getVoucherTypes } = useVoucherTypes()
    const { getVersions, createVouchers, getVouchersByVersion, downloadVouchersCSV, loading: vouchersLoading } = useVouchers()

    const [voucherType, setVoucherType] = useState(null)
    const [versions, setVersions] = useState([])
    const [versionCounts, setVersionCounts] = useState({})
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showVouchersModal, setShowVouchersModal] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState(null)
    const [voucherCount, setVoucherCount] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [currentVouchers, setCurrentVouchers] = useState([])
    const [isLoadingVouchers, setIsLoadingVouchers] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredVouchers, setFilteredVouchers] = useState([])

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchVoucherType()
    }, [user, voucherTypeId])

    const fetchVoucherType = async () => {
        const types = await getVoucherTypes()
        if (types) {
            const type = types.find(t => t._id === voucherTypeId)
            if (type) {
                setVoucherType(type)
                // Fetch actual versions from backend
                const versionsData = await getVersions(voucherTypeId)
                setVersions(versionsData)

                // Fetch voucher counts for each version
                const counts = {}
                for (const version of versionsData) {
                    const vouchers = await getVouchersByVersion(voucherTypeId, version)
                    counts[version] = vouchers.length
                }
                setVersionCounts(counts)
            } else {
                navigate('/vouchers')
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredVouchers(currentVouchers)
        } else {
            const filtered = currentVouchers.filter(voucher =>
                voucher.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                voucher.secretNumber.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredVouchers(filtered)
        }
    }, [searchTerm, currentVouchers])

    const fetchVouchers = async (version, search = '') => {
        setIsLoadingVouchers(true)
        try {
            const vouchers = await getVouchersByVersion(voucherTypeId, version, search)
            setCurrentVouchers(vouchers)
            setFilteredVouchers(vouchers)
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: error.message, type: 'error' }))
        }
        setIsLoadingVouchers(false)
    }

    const handleShowVouchers = async (version) => {
        setSelectedVersion(version)
        setShowVouchersModal(true)
        setSearchTerm('')
        await fetchVouchers(version)
    }

    const handleSearch = (value) => {
        setSearchTerm(value)
    }

    const handleCreateVouchers = async (e) => {
        e.preventDefault()

        if (!voucherCount) {
            dispatch(alertActions.showAlert({ msg: 'الرجاء إدخال عدد الكروت', type: 'warrning' }))
            return
        }

        const count = parseInt(voucherCount)
        if (isNaN(count) || count <= 0 || count > 3000) {
            dispatch(alertActions.showAlert({ msg: 'الرجاء إدخال عدد صحيح (أقل من 3000)', type: 'warrning' }))
            return
        }

        setIsCreating(true)
        const result = await createVouchers(voucherTypeId, count)
        setIsCreating(false)

        if (result) {
            setShowCreateModal(false)
            setVoucherCount('')
            dispatch(alertActions.showAlert({ msg: result.message, type: 'success' }))
            // Refresh versions to show the new version
            fetchVoucherType()
        }
    }

    const handleDownloadCSV = async (version) => {
        try {
            await downloadVouchersCSV(voucherTypeId, version)
            dispatch(alertActions.showAlert({ msg: 'تم تحميل الملف بنجاح', type: 'success' }))
        } catch (error) {
            dispatch(alertActions.showAlert({ msg: 'فشل تحميل الملف', type: 'error' }))
        }
    }

    if (loading) {
        return (
            <section className='container voucher-versions'>
                <div className="loading">جاري التحميل...</div>
            </section>
        )
    }

    if (!voucherType) {
        return (
            <section className='container voucher-versions'>
                <div className="error">فئة الكرت غير موجودة</div>
            </section>
        )
    }

    return (
        <section className='container voucher-versions'>
            <div className="header">
                <button
                    className="back-btn"
                    onClick={() => navigate('/vouchers')}
                >
                    <FaArrowLeft />
                    <span>العودة</span>
                </button>
                <div className="title">
                    <h1>فئة {voucherType.voucherValue} دينار</h1>
                    <p>إدارة إصدارات الكروت</p>
                </div>
    
                <div className={`modal ${showVouchersModal ? 'show' : ''}`}>
                    <div className="modal-content">
                        <h2>كروت الإصدار رقم {selectedVersion}</h2>
                        
                        {isLoadingVouchers ? (
                            <div className="loading">جاري التحميل...</div>
                        ) : (
                            <>
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="بحث بالرقم التسلسلي أو السري"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
    
                                <div className="table-container">
                                    <table className="vouchers-table">
                                        <thead>
                                            <tr>
                                                <th>الرقم التسلسلي</th>
                                                <th>الرقم السري</th>
                                                <th>القيمة</th>
                                                <th>الحالة</th>
                                                <th>تاريخ الاستخدام</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVouchers.map(voucher => (
                                            <tr key={voucher._id}>
                                                <td>{voucher.serialNumber}</td>
                                                <td>{voucher.secretNumber}</td>
                                                <td>{voucher.value} دينار</td>
                                                <td>
                                                    <span className={`status-indicator ${voucher.isUsed ? 'used' : 'available'}`}></span>
                                                    {voucher.isUsed ? 'مستخدم' : 'متاح'}
                                                </td>
                                                <td>
                                                    {voucher.useDate ? new Date(voucher.useDate).toLocaleDateString('ar-LY') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                                
                                <div className="table-actions">
                                    <button
                                        className="download-btn"
                                        onClick={() => downloadVouchersCSV(voucherTypeId, selectedVersion)}
                                    >
                                        <FaDownload />
                                        <span>تحميل CSV</span>
                                    </button>
                                </div>
                            </>
                        )}
    
                        <div className="buttons">
                            <button
                                type="button"
                                className="cancel"
                                onClick={() => {
                                    setShowVouchersModal(false)
                                    setSelectedVersion(null)
                                    setCurrentVouchers([])
                                }}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    className="create-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FaPlus />
                    <span>إنشاء كروت جديدة</span>
                </button>
            </div>

            <div className="versions-grid">
                {versions.map(version => (
                    <div key={version} className="version-card">
                        <div className="version-info">
                            <h3>الإصدار رقم {version}</h3>
                            <p>عدد الكروت:</p>
                            <div className="voucher-count">{versionCounts[version] || 0}</div>
                        </div>
                        <div className="actions">
                            <button
                                className="show-btn"
                                onClick={() => handleShowVouchers(version)}
                            >
                                <FaEye />
                                <span>عرض الكروت</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`modal create-modal ${showCreateModal ? 'show' : ''}`}>
                <div className="modal-content">
                    <h2>إنشاء كروت جديدة</h2>
                    <form onSubmit={handleCreateVouchers}>
                        <div className="input-group">
                            <label htmlFor="count">عدد الكروت المراد إنشاؤها</label>
                            <input
                                type="number"
                                id="count"
                                value={voucherCount}
                                onChange={(e) => setVoucherCount(e.target.value)}
                                placeholder="أدخل العدد (أقصى 3000)"
                                max="3000"
                                min="1"
                            />
                        </div>
                        <div className="buttons">
                            <button
                                type="button"
                                className="cancel"
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setVoucherCount('')
                                }}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className={`create ${isCreating ? 'clicked' : ''}`}
                                disabled={isCreating}
                            >
                                {isCreating ? 'جاري الإنشاء...' : 'إنشاء'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}