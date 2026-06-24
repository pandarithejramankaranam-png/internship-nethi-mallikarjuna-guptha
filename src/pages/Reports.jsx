import React, { useState, useEffect } from 'react';
import { getContracts } from '../services/contractService';
import * as reportService from '../services/reportService';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { toast } from 'react-toastify';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  IndianRupee, 
  Percent, 
  PieChart as PieIcon, 
  BarChart3, 
  FolderLock,
  Building,
  Hotel,
  Briefcase
} from 'lucide-react';

export default function Reports() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusStats, setStatusStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractsData, statusData, revenueData] = await Promise.all([
        getContracts(),
        reportService.getStatusStats().catch(() => null),
        reportService.getRevenueStats().catch(() => null)
      ]);
      setContracts(contractsData);
      setStatusStats(statusData);
      setRevenueStats(revenueData);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(err);
      toast.error("Failed to load reports workspace analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Aggregate Revenue by Client Type
  const revenueByType = revenueStats || contracts.reduce((acc, curr) => {
    const type = curr.clientType || 'Corporate';
    acc[type] = (acc[type] || 0) + curr.contractValue;
    return acc;
  }, {});

  const barChartData = [
    { name: 'Apartment Seg.', Value: revenueByType['Apartment'] || 0, fill: '#6366f1' },
    { name: 'Hotel & Hosp.', Value: revenueByType['Hotel'] || 0, fill: '#0ea5e9' },
    { name: 'Corporate Org.', Value: revenueByType['Corporate'] || 0, fill: '#4f46e5' }
  ];

  // Aggregate Contracts by Status
  const statusCounts = statusStats || contracts.reduce((acc, curr) => {
    const status = curr.status || 'Draft';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = [
    { name: 'Draft', value: statusCounts['Draft'] || 0, color: '#94a3b8' },
    { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#6366f1' },
    { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: '#0ea5e9' },
    { name: 'Completed', value: statusCounts['Completed'] || 0, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Financial Statistics
  const totalRevenue = contracts.reduce((acc, curr) => acc + curr.contractValue, 0);
  const totalPaid = contracts.reduce((acc, curr) => acc + (curr.payments?.paidAmount || 0), 0);
  const collectionRate = totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : '0.0';
  const averageContractValue = contracts.length > 0 ? Math.round(totalRevenue / contracts.length) : 0;

  // Segment metrics
  const getSegmentCount = (type) => contracts.filter(c => c.clientType === type).length;

  if (loading) {
    return <Loader message="Analyzing report parameters..." />;
  }

  if (error) {
    return <ErrorState title="Reporting Error" onRetry={loadReportData} />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Booked Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contracted Revenue</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 block">System bookings value</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Realized Capital Cash */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Realized Capital (Paid)</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{totalPaid.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <Percent className="h-3.5 w-3.5" />
              {collectionRate}% collection speed
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Average Contract Size */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Deal Size</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{averageContractValue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 block">Average billings per contract</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>

        {/* Segment counts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5 w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Client Distributions</span>
            <div className="grid grid-cols-3 gap-1 text-center pt-1">
              <div>
                <span className="text-xs text-slate-400 block" title="Apartments">🏢 Apt</span>
                <span className="text-sm font-bold text-slate-800">{getSegmentCount('Apartment')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block" title="Hotels">🏨 Htl</span>
                <span className="text-sm font-bold text-slate-800">{getSegmentCount('Hotel')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block" title="Corporate Offices">💼 Corp</span>
                <span className="text-sm font-bold text-slate-800">{getSegmentCount('Corporate')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue by Client Segment (Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Booked Revenue by Segment</h4>
            <p className="text-xs text-slate-500">Distribution of gross contracted volume by business vertical</p>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#64748b" 
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Contract Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Bar dataKey="Value" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contract Status Split (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Projects Status Distribution</h4>
            <p className="text-xs text-slate-500">Breakdown of contract agreements by project lifecycle phase</p>
          </div>
          <div className="h-80 w-full flex flex-col justify-center text-xs">
            {pieChartData.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                No active contracts to generate split reports.
              </div>
            ) : (
              <div className="h-full w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Contracts']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value, entry) => {
                        const count = pieChartData.find(item => item.name === value)?.value || 0;
                        return <span className="text-slate-700 font-semibold text-xs">{value} ({count})</span>;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
