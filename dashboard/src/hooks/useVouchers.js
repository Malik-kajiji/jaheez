import { useState } from 'react'
import { useSelector } from 'react-redux'

export const useVouchers = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const user = useSelector(state => state.userController.user)

    // Get all versions for a voucher type
    const getVersions = async (voucherTypeId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/vouchers/${voucherTypeId}/versions`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (!response.ok) {
                throw new Error(json.error)
            }

            setLoading(false)
            return json
        } catch (error) {
            setError(error.message)
            setLoading(false)
            return []
        }
    }

    // Create new vouchers
    const createVouchers = async (voucherTypeId, count) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/vouchers/${voucherTypeId}/vouchers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ count })
            })
            const json = await response.json()

            if (!response.ok) {
                throw new Error(json.error)
            }

            setLoading(false)
            return json
        } catch (error) {
            setError(error.message)
            setLoading(false)
            return null
        }
    }

    // Get vouchers for a specific version
    const getVouchersByVersion = async (voucherTypeId, version, search = '') => {
        setLoading(true)
        setError(null)

        try {
            const url = new URL(`${process.env.REACT_APP_API_BASE_URL}/api/admin/vouchers/${voucherTypeId}/versions/${version}/vouchers`)
            if (search) {
                url.searchParams.append('search', search)
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (!response.ok) {
                throw new Error(json.error)
            }

            setLoading(false)
            return json
        } catch (error) {
            setError(error.message)
            setLoading(false)
            return []
        }
    }

    // Download vouchers as CSV
    const downloadVouchersCSV = async (voucherTypeId, version) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/vouchers/${voucherTypeId}/versions/${version}/download`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (!response.ok) {
                const json = await response.json()
                throw new Error(json.error)
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition')
            const filenameMatch = contentDisposition && contentDisposition.match(/filename\*=UTF-8''(.+)/)
            const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `vouchers-${version}.csv`

            // Create download link
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            return true
        } catch (error) {
            setError(error.message)
            return false
        }
    }

    return {
        loading,
        error,
        getVersions,
        createVouchers,
        getVouchersByVersion,
        downloadVouchersCSV
    }
}