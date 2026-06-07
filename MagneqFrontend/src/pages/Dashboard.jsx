import React from 'react';
import Metrics from '../components/dashboard/Metrics';
import StatisticsChart from '../components/dashboard/StatisticsChart';
import SalesTable from '../components/sales/adminSales/SalesTable';

const Home = () => {
  return (
      <div className="grid grid-cols-12 gap-4 md:gap-6 bg-background text-text">
        <div className="col-span-12 space-y-6 ">
          <Metrics />
        </div>

        <div className="col-span-12 ">
          <SalesTable isDashboard/>
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>
      </div>
  );
};

export default Home;