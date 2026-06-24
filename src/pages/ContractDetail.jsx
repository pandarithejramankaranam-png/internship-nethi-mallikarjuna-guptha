import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContractById, recordPayment } from '../services/contractService';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { 
  ArrowLeft, 
  Edit3, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Dumbbell, 
  ShieldAlert, 
  Percent, 
  TrendingUp,
  Briefcase,
  Wrench
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContract = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContractById(id);
      if (!data) {
        setError(new Error("Contract not found"));
      } else {
        setContract(data);
      }
    } catch (err) {
      console.error("Error fetching contract details:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleRecordPayment = async (historyIndex) => {
    if (confirm("Verify payment received for this milestone? This will update outstanding balances.")) {
      try {
        await recordPayment(contract.contractId, historyIndex);
        toast.success("Payment recorded successfully!");
        fetchContract(); // Reload details
      } catch (err) {
        console.error("Failed to record payment:", err);
        toast.error("Failed to record milestone payment. Please check authority.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-250">Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-250">In Progress</span>;
      case 'Approved':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-250">Approved</span>;
      case 'Draft':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">Draft</span>;
    }
  };

  const getClientTypeIcon = (type) => {
    switch(type) {
      case 'Apartment': return '🏢';
      case 'Hotel': return '🏨';
      case 'Corporate': return '💼';
      default: return '💼';
    }
  };

  if (loading) {
    return <Loader message="Loading contract workspace details..." />;
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => navigate('/contracts')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Database
        </button>
        <ErrorState 
          title="Contract Details Unavailable" 
          message={error?.message || "We could not locate the contract record. It may have been deleted or the ID is invalid."} 
          onRetry={fetchContract} 
        />
      </div>
    );
  }

  const paidPercent = contract.contractValue > 0 
    ? Math.round(((contract.payments?.paidAmount || 0) / contract.contractValue) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Navigation and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={() => navigate('/contracts')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors self-start"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Contracts Database
        </button>
        <button
          onClick={() => navigate(`/contract-form?edit=${contract.contractId}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Edit3 className="h-4 w-4" />
          Modify Agreement Details
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Contract summary, details, milestones */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-850">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-650/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{getClientTypeIcon(contract.clientType)}</span>
                <div>
                  <span className="text-[10px] sm:text-xs text-indigo-400 font-bold uppercase tracking-widest block">{contract.contractId}</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">{contract.clientName}</h2>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-slate-350 text-xs">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-indigo-400" />
                  <span>Client Segment: <span className="font-semibold text-white">{contract.clientType}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>Logistics Handover: <span className="font-semibold text-white">{contract.deliveryDate}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Scope and List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-slate-500" />
                  Project Scope & Setup
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {contract.projectScope || "No scope summary registered."}
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-slate-500" />
                  Equipment Procurement
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {contract.equipmentList || "No equipment items listed."}
                </p>
              </div>
            </div>

            {/* Logistics & Support */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Logistics Targets & Warranties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-slate-450 block font-semibold mb-0.5">Est. Delivery</span>
                  <span className="font-bold text-slate-800">{contract.deliveryDate}</span>
                </div>
                <div className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-slate-450 block font-semibold mb-0.5">Est. Installation</span>
                  <span className="font-bold text-slate-800">{contract.installationDate}</span>
                </div>
                <div className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-slate-450 block font-semibold mb-0.5">Support Warranty</span>
                  <span className="font-bold text-slate-800">{contract.supportTerms}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Milestone Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Milestone Payments Ledger</h3>
              <p className="text-xs text-slate-500">Track paid allocations and verify pending schedule receipts</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150">
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Milestone Details</th>
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Portion Value</th>
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!contract.payments?.history || contract.payments.history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                        No payment schedules allocated to this contract.
                      </td>
                    </tr>
                  ) : (
                    contract.payments.history.map((milestone, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-800">{milestone.milestone}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-500">
                          {milestone.date}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-950">
                          ₹{milestone.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                          {milestone.method}
                        </td>
                        <td className="px-5 py-3.5">
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
                        <td className="px-5 py-3.5 text-right">
                          {milestone.status === 'Pending' ? (
                            <button
                              onClick={() => handleRecordPayment(idx)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Record Receipt
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-end gap-1 font-bold text-emerald-600">
                              <CheckCircle className="h-4 w-4 shrink-0" />
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

        {/* Right Column: Financial health and Contact cards */}
        <div className="space-y-6">
          
          {/* Financial Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Financial Statement</h3>
            
            {/* Status Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Cleared Balance portion</span>
                <span className="font-bold text-emerald-600">{paidPercent}% Collected</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-550" 
                  style={{ width: `${paidPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Rows */}
            <div className="divide-y divide-slate-100 space-y-3.5">
              <div className="flex justify-between items-center text-xs pt-3.5">
                <span className="text-slate-500 font-medium">Contract Status</span>
                {getStatusBadge(contract.status)}
              </div>
              <div className="flex justify-between items-center text-xs pt-3.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  Agreement Valuation
                </span>
                <span className="font-extrabold text-slate-900 text-sm">₹{contract.contractValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Cash Received (Paid)
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">₹{(contract.payments?.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                  Receivable Portions (Pending)
                </span>
                <span className={`font-extrabold text-sm ${(contract.payments?.pendingAmount || 0) > 0 ? 'text-rose-600' : 'text-slate-550'}`}>
                  ₹{(contract.payments?.pendingAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <User className="h-5 w-5 text-slate-500" />
              Primary Contact Details
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-650 pt-2">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Representative</span>
                  <span className="font-bold text-slate-800 text-sm">{contract.contactPerson || "Not Provided"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Corporate Line</span>
                  <span className="font-semibold text-slate-800">{contract.phoneNumber || "Not Provided"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Email Dispatch</span>
                  <a href={`mailto:${contract.email}`} className="font-semibold text-indigo-650 hover:underline">{contract.email || "Not Provided"}</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
