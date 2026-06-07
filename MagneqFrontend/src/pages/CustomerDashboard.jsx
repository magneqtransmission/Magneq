import React from 'react'
import CustomerMetrics from '../components/dashboard/CustomerMetrics'

const CustomerDashboard = () => {

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 bg-background text-text">
            <div className="col-span-12 space-y-6 ">
                <h2>Customer Dashboard</h2>
                <CustomerMetrics/>
            </div>
        </div>
    )
}

export default CustomerDashboard