import { useState } from 'react'
import { useSelector } from 'react-redux'

export const useVoucherTypes = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const user = useSelector(state => state.userController.user)

    // Get all voucher types
    const getVoucherTypes = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/voucher-types`, {
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
            return null
        }
    }

    // Create new voucher type
    const createVoucherType = async (data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/voucher-types`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(data)
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
            throw error // Re-throw to handle in component
        }
    }

    // Delete voucher type
    const deleteVoucherType = async (id) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/voucher-types/${id}`, {
                method: 'DELETE',
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
            throw error // Re-throw to handle in component
        }
    }

    return {
        loading,
        error,
        getVoucherTypes,
        createVoucherType,
        deleteVoucherType
    }
}