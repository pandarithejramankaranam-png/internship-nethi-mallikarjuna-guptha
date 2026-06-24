import React, { useState, useEffect } from 'react';
import { getContracts, recordPayment } from '../services/contractService';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { toast } from 'react-toastify';
import { 
  IndianRupee, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Banknote,
  Percent
} from 'lucide-react';

export default function PaymentTracker() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContracts();
      setContracts(data);
    } catch (err) {
      console.error("Failed to load payment tracker data:", err);
      setError(err);
      toast.error("Failed to load milestone schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  const handleRecordPayment = async (contractId, index) => {
    if (confirm("Verify payment received for this milestone? This will update outstanding balances.")) {
      try {
        await recordPayment(contractId, index);
        toast.success("Milestone payment recorded successfully.");
        refreshData();
      } catch (err) {
        console.error("Failed to record payment:", err);
        toast.error("Failed to record payment. Please check authority.");
      }
    }
  };

  // Calculations
  const totalValue = contracts.reduce((acc, curr) => acc + curr.contractValue, 0);
  const totalPaid = contracts.reduce((acc, curr) => acc + (curr.payments?.paidAmount || 0), 0);
  const totalPending = contracts.reduce((acc, curr) => acc + (curr.payments?.pendingAmount || 0), 0);
  const paidPercent = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0;

  // Gather all milestone items from all contracts
  const allMilestones = [];
  contracts.forEach(contract => {
    if (contract.payments?.history) {
      contract.payments.history.forEach((payment, idx) => {
        allMilestones.push({
          contractId: contract.contractId,
          clientName: contract.clientName,
          clientType: contract.clientType,
          milestoneIndex: idx,
          ...payment
        });
      });
    }
  });

  // Filter milestones
  const filteredMilestones = allMilestones.filter(m => {
    const matchesSearch = 
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.milestone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort milestones: Pendings first, then by date nearest
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'Pending' ? -1 : 1;
    }
    return new Date(a.date) - new Date(b.date);
  });

  if (loading) {
    return <Loader message="Compiling payment milestones..." />;
  }

  if (error) {
    return <ErrorState title="Tracker Error" onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Booked Invoices */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Booked Billings</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{totalValue.toLocaleString()}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Across {contracts.length} active B2B contracts
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Banknote className="h-6 w-6" />
          </div>
        </div>

        {/* Aggregated Received Cash */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cleared Capital (Paid)</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{totalPaid.toLocaleString()}</span>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${paidPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <Percent className="h-3.5 w-3.5" />
              {paidPercent}% of contract assets collected
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Total Outstanding Balances */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Outstanding Receivables</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{totalPending.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {allMilestones.filter(m => m.status === 'Pending').length} pending milestones remaining
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Table Title and Filters */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Milestones Payment Schedule</h3>
              <p className="text-xs text-slate-500">Track and collect payment portions allocated to project milestones</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-950 placeholder-slate-400 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Search milestones by client, ID, name..."
              />
            </div>

            {/* Status Selector */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Schedules</option>
                <option value="Paid">Cleared (Paid)</option>
                <option value="Pending">Awaiting (Pending)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Milestone Schedule Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Contract</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Description</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Portion Value</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMilestones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-450">
                    No milestone schedules found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                sortedMilestones.map((milestone, idx) => (
                  <tr key={`${milestone.contractId}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{milestone.clientName}</span>
                        <span className="text-[10px] text-indigo-600 font-bold block">{milestone.contractId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{milestone.milestone}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      Method: <span className="font-medium text-slate-700">{milestone.method}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {milestone.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-950">
                      ₹{milestone.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {milestone.status === 'Paid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-250">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-250">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {milestone.status === 'Pending' ? (
                        <button
                          onClick={() => handleRecordPayment(milestone.contractId, milestone.milestoneIndex)}
                          className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="h-4.5 w-4.5" />
                          Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
