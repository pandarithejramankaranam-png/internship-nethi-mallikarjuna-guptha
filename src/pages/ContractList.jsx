import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getContracts, 
  deleteContract 
} from '../services/contractService';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  X,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('contractId-desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContracts();
      setContracts(data);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError(err);
      toast.error("Failed to load contracts database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const refreshData = () => {
    loadContracts();
  };

  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete contract ${id}? This action is permanent.`)) {
      try {
        await deleteContract(id);
        toast.success(`Contract ${id} deleted successfully.`);
        refreshData();
      } catch (err) {
        console.error("Delete contract error:", err);
        toast.error("Failed to delete contract.");
      }
    }
  };

  // Filter & Sort Pipeline
  const filteredContracts = contracts.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      c.contractId.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.contactPerson.toLowerCase().includes(query) ||
      (c.equipmentList && c.equipmentList.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesType = typeFilter === 'All' || c.clientType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case 'contractId-asc':
        return a.contractId.localeCompare(b.contractId);
      case 'contractId-desc':
        return b.contractId.localeCompare(a.contractId);
      case 'clientName-asc':
        return a.clientName.localeCompare(b.clientName);
      case 'clientName-desc':
        return b.clientName.localeCompare(a.clientName);
      case 'value-desc':
        return b.contractValue - a.contractValue;
      case 'value-asc':
        return a.contractValue - b.contractValue;
      case 'deliveryDate-asc':
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      case 'deliveryDate-desc':
        return new Date(b.deliveryDate) - new Date(a.deliveryDate);
      default:
        return 0;
    }
  });

  // Pagination Calculations
  const totalItems = sortedContracts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedContracts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, sortBy]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-250">Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-250">In Progress</span>;
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-250">Approved</span>;
      case 'Draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Draft</span>;
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
    return <Loader message="Loading contracts database..." />;
  }

  if (error) {
    return <ErrorState title="Database Error" onRetry={loadContracts} />;
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-2xl">Gym Setup Contracts</h3>
          <p className="text-xs text-slate-500">Query, verify, modify, and audit all B2B installation agreements</p>
        </div>
        <Link
          to="/contract-form"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Gym Contract
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
              placeholder="Search by client, ID, representative, equipment..."
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Client Type Filter */}
          <div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-800 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
              >
                <option value="All">All Client Types</option>
                <option value="Apartment">Apartment Segment</option>
                <option value="Hotel">Hotel & Hospitality</option>
                <option value="Corporate">Corporate Offices</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Sort & Quick summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500">
            Filtered: <span className="text-slate-900 font-bold">{totalItems}</span> contracts out of <span className="text-slate-900 font-bold">{contracts.length}</span> total.
          </div>

          <div className="flex items-center gap-3.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block pl-3 pr-8 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="contractId-desc">Contract ID (Newest)</option>
                <option value="contractId-asc">Contract ID (Oldest)</option>
                <option value="clientName-asc">Client Name (A-Z)</option>
                <option value="clientName-desc">Client Name (Z-A)</option>
                <option value="value-desc">Value (High to Low)</option>
                <option value="value-asc">Value (Low to High)</option>
                <option value="deliveryDate-asc">Delivery (Nearest)</option>
                <option value="deliveryDate-desc">Delivery (Furthest)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Identity</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Logistics Target</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No contracts match the current search or filters.
                  </td>
                </tr>
              ) : (
                currentItems.map((c) => (
                <tr 
                  key={c.contractId} 
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/contracts/${c.contractId}`)}
                >
                  <td className="px-6 py-4.5 font-bold text-indigo-600">
                    {c.contractId}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={c.clientType}>{getClientTypeIcon(c.clientType)}</span>
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-all">{c.clientName}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">{c.clientType} Segment</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div>
                        <span className="font-semibold text-slate-700 block">{c.contactPerson}</span>
                        <span className="text-[10px] text-slate-400 block">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div>
                        <span className="font-medium text-slate-800 block">Deliver: {c.deliveryDate}</span>
                        <span className="text-[10px] text-slate-400 block">Install: {c.installationDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-bold text-slate-950">
                      ₹{c.contractValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/contracts/${c.contractId}`)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/contract-form?edit=${c.contractId}`)}
                          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Contract"
                        >
                          <Edit3 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.contractId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
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

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalItems}</span> contracts.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'border bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
