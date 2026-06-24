import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getContracts, 
  deleteContract 
} from '../services/contractService';
import * as dashboardService from '../services/dashboardService';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  PlusCircle, 
  Eye, 
  Trash2, 
  Edit3,
  Dumbbell,
  IndianRupee,
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractsData, activitiesData, summaryData] = await Promise.all([
        getContracts(),
        dashboardService.getActivities().catch(() => []),
        dashboardService.getSummary().catch(() => null)
      ]);
      setContracts(contractsData);
      setActivities(activitiesData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err);
      toast.error("Failed to load dashboard workspace. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const refreshData = () => {
    loadDashboardData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering row click / view
    if (confirm(`Are you sure you want to delete contract ${id}?`)) {
      try {
        await deleteContract(id);
        toast.success(`Contract ${id} deleted successfully.`);
        refreshData();
      } catch (err) {
        console.error("Delete contract error:", err);
        toast.error("Failed to delete contract. Please check authority.");
      }
    }
  };

  // Calculations (prefer backend summary, fallback to client calculations)
  const totalContracts = summary?.totalContracts ?? contracts.length;
  const activeContracts = summary?.activeContracts ?? contracts.filter(c => c.status === 'In Progress' || c.status === 'Approved').length;
  const completedProjects = summary?.completedProjects ?? contracts.filter(c => c.status === 'Completed').length;
  
  const totalPendingPayments = summary?.totalPendingPayments ?? contracts.reduce((acc, curr) => {
    return acc + (curr.payments?.pendingAmount || 0);
  }, 0);

  const totalValue = summary?.totalValue ?? contracts.reduce((acc, curr) => acc + curr.contractValue, 0);

  // Take top 5 recent contracts
  const recentContracts = summary?.recentContracts ?? [...contracts]
    .sort((a, b) => b.contractId.localeCompare(a.contractId))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Approved</span>;
      case 'Draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Draft</span>;
    }
  };

  const getClientTypeIcon = (type) => {
    switch(type) {
      case 'Apartment':
        return '🏢';
      case 'Hotel':
        return '🏨';
      case 'Corporate':
        return '💼';
      default:
        return '💼';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'bg-green-100 text-green-700';
    if (action.includes('payment')) return 'bg-amber-100 text-amber-700';
    if (action.includes('update') || action.includes('warranty')) return 'bg-indigo-100 text-indigo-700';
    if (action.includes('delete')) return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return <Loader message="Loading dashboard overview..." />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" onRetry={loadDashboardData} />;
  }


  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-600/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to IronForge B2B</h2>
            <p className="mt-2 text-slate-300 max-w-xl text-sm leading-relaxed">
              Manage multi-site gym installations, track client procurement milestones, audit contract terms, and review pending balances in one central workspace.
            </p>
          </div>
          <div className="flex gap-3.5 flex-shrink-0">
            <Link 
              to="/contract-form"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98]"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              New Gym Contract
            </Link>
            <Link 
              to="/contracts"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 border border-slate-700 transition-all"
            >
              Browse Database
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Contracts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Contracts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalContracts}</span>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                Active base
              </span>
            </div>
            <span className="text-xs text-slate-400 block">Total Booked: ₹{totalValue.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Active Contracts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Contracts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeContracts}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                Ongoing setups
              </span>
            </div>
            <span className="text-xs text-slate-400 block">Includes approved contracts</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Completed Projects</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completedProjects}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle className="h-3 w-3" />
                100% Handed over
              </span>
            </div>
            <span className="text-xs text-slate-400 block">Fully verified gym setups</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">₹{totalPendingPayments.toLocaleString()}</span>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                <AlertCircle className="h-3 w-3" />
                Milestones
              </span>
            </div>
            <span className="text-xs text-slate-400 block">Awaiting payment verification</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Contracts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Contracts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Recent Contracts</h3>
                <p className="text-xs text-slate-500">Recently created or updated client gym agreements</p>
              </div>
              <Link 
                to="/contracts" 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline transition-colors"
              >
                View all contracts
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Client</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Scope Summary</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentContracts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                        No contracts in database. Click "New Gym Contract" to begin.
                      </td>
                    </tr>
                  ) : (
                    recentContracts.map((c) => (
                      <tr 
                        key={c.contractId} 
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                        onClick={() => setSelectedContract(c)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg" title={c.clientType}>{getClientTypeIcon(c.clientType)}</span>
                            <div>
                              <span className="text-xs font-bold text-indigo-600 block">{c.contractId}</span>
                              <span className="text-sm font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">{c.clientName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[180px]">
                          <span className="text-xs font-medium text-slate-600 truncate block" title={c.projectScope}>
                            {c.projectScope}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Est. Install: {c.installationDate}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-slate-950">₹{c.contractValue.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedContract(c)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                              title="Quick View"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/contract-form?edit=${c.contractId}`)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-all"
                              title="Edit Details"
                            >
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(c.contractId, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center">
            <span className="text-xs text-slate-500">Showing top {recentContracts.length} recent contracts</span>
          </div>
        </div>

        {/* Recent Activity Log Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">System Audit Log</h3>
            <p className="text-xs text-slate-500 mb-5">Chronological system events and updates</p>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No system logs available.
                </div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-3.5 items-start">
                    <span className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider select-none shrink-0 ${getActionColor(act.action)}`}>
                      {act.action.split(' ')[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-950">
                        {act.user} <span className="text-slate-500 font-normal">action on</span> {act.target}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed" title={act.details}>
                        {act.details}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Auto Updating</span>
            <button 
              onClick={refreshData}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Refresh Log
            </button>
          </div>
        </div>
      </div>

      {/* Contract Detail Quick View Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getClientTypeIcon(selectedContract.clientType)}</span>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">{selectedContract.clientName}</h3>
                  <span className="text-xs text-indigo-400 font-semibold">{selectedContract.contractId} • {selectedContract.clientType} Segment</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contract Status</span>
                  {getStatusBadge(selectedContract.status)}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Contract Value</span>
                  <span className="text-lg font-extrabold text-slate-900">₹{selectedContract.contractValue.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outstanding Balance</span>
                  <span className={`text-lg font-extrabold block ${selectedContract.payments?.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{selectedContract.payments?.pendingAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Scope & Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5">Project Scope</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {selectedContract.projectScope}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5">Procurement List</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {selectedContract.equipmentList}
                  </p>
                </div>
              </div>

              {/* Contact and Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-5">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Client Point of Contact</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Representative:</span> {selectedContract.contactPerson}</p>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Phone:</span> {selectedContract.phoneNumber}</p>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Email:</span> {selectedContract.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Logistics & Support</h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Target Delivery:</span> {selectedContract.deliveryDate}</p>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Target Installation:</span> {selectedContract.installationDate}</p>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Support Terms:</span> {selectedContract.supportTerms}</p>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {selectedContract.payments?.history && (
                <div className="border-t pt-5">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Payment Milestones Schedule</h4>
                  <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-4 py-2 font-bold text-slate-600">Milestone</th>
                          <th className="px-4 py-2 font-bold text-slate-600">Expected Date</th>
                          <th className="px-4 py-2 font-bold text-slate-600">Amount</th>
                          <th className="px-4 py-2 font-bold text-slate-600 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedContract.payments.history.map((h, idx) => (
                          <tr key={idx} className="border-b last:border-0 border-slate-100">
                            <td className="px-4 py-2.5 font-medium text-slate-800">{h.milestone}</td>
                            <td className="px-4 py-2.5 text-slate-500">{h.date}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-900">₹{h.amount.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                h.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border rounded-lg shadow-sm"
              >
                Close View
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedContract(null);
                    navigate(`/contract-form?edit=${selectedContract.contractId}`);
                  }}
                  className="px-4.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-md shadow-indigo-600/10"
                >
                  Edit Contract Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
