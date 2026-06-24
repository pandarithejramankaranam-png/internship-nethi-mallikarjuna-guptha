import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getContractById, saveContract } from '../services/contractService';
import { ArrowLeft, Save, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

export default function ContractForm() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    contractId: '',
    clientName: '',
    clientType: 'Corporate',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    projectScope: '',
    equipmentList: '',
    deliveryDate: '',
    installationDate: '',
    contractValue: '',
    paymentMilestone: '50% Advance, 50% Installation',
    supportTerms: '2 Years Full Parts and Labor Warranty',
    status: 'Draft'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load contract for editing
  useEffect(() => {
    if (editId) {
      const fetchContractForEdit = async () => {
        setLoading(true);
        setServerError('');
        try {
          const contract = await getContractById(editId);
          if (contract) {
            setFormData({
              contractId: contract.contractId,
              clientName: contract.clientName,
              clientType: contract.clientType,
              contactPerson: contract.contactPerson,
              phoneNumber: contract.phoneNumber,
              email: contract.email,
              projectScope: contract.projectScope,
              equipmentList: contract.equipmentList,
              deliveryDate: contract.deliveryDate,
              installationDate: contract.installationDate,
              contractValue: contract.contractValue,
              paymentMilestone: contract.paymentMilestone,
              supportTerms: contract.supportTerms,
              status: contract.status
            });
          } else {
            setServerError(`Contract ID ${editId} not found in database.`);
          }
        } catch (err) {
          console.error("Error loading contract for edit:", err);
          setServerError("Failed to retrieve contract from database.");
        } finally {
          setLoading(false);
        }
      };
      fetchContractForEdit();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'Client Name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact representative is required';
    
    // Email regex
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid corporate email (e.g., name@company.com)';
    }

    // Phone regex
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid telephone number';
    }

    if (!formData.projectScope.trim()) newErrors.projectScope = 'Scope definition is required';
    if (!formData.equipmentList.trim()) newErrors.equipmentList = 'Equipment list is required';
    
    // Dates validation
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }
    if (!formData.installationDate) {
      newErrors.installationDate = 'Installation date is required';
    }
    if (formData.deliveryDate && formData.installationDate) {
      const delDate = new Date(formData.deliveryDate);
      const instDate = new Date(formData.installationDate);
      if (instDate < delDate) {
        newErrors.installationDate = 'Installation cannot occur prior to equipment delivery';
      }
    }

    // Value validation
    if (formData.contractValue === '') {
      newErrors.contractValue = 'Contract value is required';
    } else {
      const val = Number(formData.contractValue);
      if (isNaN(val) || val <= 0) {
        newErrors.contractValue = 'Value must be a positive number';
      }
    }

    if (!formData.paymentMilestone.trim()) newErrors.paymentMilestone = 'Payment milestone terms are required';
    if (!formData.supportTerms.trim()) newErrors.supportTerms = 'Warranty & maintenance terms are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      setServerError('Form contains validation errors. Please check the marked fields.');
      return;
    }

    setLoading(true);
    try {
      await saveContract(formData);
      toast.success(editId ? 'Contract updated successfully!' : 'Contract created successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        navigate('/contracts');
      }, 1500);
    } catch (err) {
      console.error("Save error:", err);
      const msg = err.response?.data?.message || err.message || 'An error occurred while saving the contract data.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  if (loading && editId && !formData.clientName) {
    return <Loader message="Retrieving contract details..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white hover:bg-slate-100 rounded-lg border text-slate-500 hover:text-slate-700 transition-all"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-900 text-2xl">
              {editId ? `Edit Contract: ${editId}` : 'Create Procurement Agreement'}
            </h3>
            <p className="text-xs text-slate-500">
              {editId ? 'Modify client parameters, logistics scheduling, or transaction scopes' : 'Initialize a new B2B gym infrastructure contract'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Alert Banners */}
      {serverError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-sm">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Form Submission Incomplete:</span> {serverError}
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-4 rounded-xl flex items-center gap-3 shadow-md animate-bounce">
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-extrabold">Changes Dispatched Successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Database storage synced. Redirecting back to records dashboard...</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Client Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
            <h4 className="font-bold text-slate-900 text-base">Section 1: Client Identity & Relations</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contract ID (Readonly indicator) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contract Reference ID
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={formData.contractId || '[Auto-assigned on Submission]'}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Identifier is immutable once indexed.</span>
            </div>

            {/* Client Corporate Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Client Corporate Entity <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.clientName ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="e.g. Vertex Heights Residents HOA"
              />
              {errors.clientName && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.clientName}</p>}
            </div>

            {/* Client Business Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Industry Segment <span className="text-rose-500">*</span>
              </label>
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="Apartment">Apartment (Residential HOA)</option>
                <option value="Hotel">Hotel & Hospitality</option>
                <option value="Corporate">Corporate Office Gym</option>
              </select>
            </div>

            {/* Primary Representative */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contact Person Representative <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.contactPerson ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="e.g. David Chen"
              />
              {errors.contactPerson && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.contactPerson}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Business Telephone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.phoneNumber ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phoneNumber && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Contact Email */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Representative Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.email ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="dchen@innovatetech.com"
              />
              {errors.email && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Project Specifications & Logistics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
            <h4 className="font-bold text-slate-900 text-base">Section 2: Engineering Scope & Logistics</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Scope Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Project Scope & Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="projectScope"
                rows="4"
                value={formData.projectScope}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all resize-none ${
                  errors.projectScope ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="Detail site layouts, special acoustic flooring needs, mirror configurations, structural wiring requirements..."
              ></textarea>
              {errors.projectScope && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.projectScope}</p>}
            </div>

            {/* Equipment Manifest */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Equipment Manifest / List <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="equipmentList"
                rows="4"
                value={formData.equipmentList}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all resize-none ${
                  errors.equipmentList ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
                placeholder="e.g. 5x Treadmills model X4, 3x Multi-gym systems, 15x dumbbell pairs (5-100lbs) with horizontal rack..."
              ></textarea>
              {errors.equipmentList && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.equipmentList}</p>}
            </div>

            {/* Target Delivery Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Target Delivery Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.deliveryDate ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
              />
              {errors.deliveryDate && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.deliveryDate}</p>}
            </div>

            {/* Target Installation Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Target Installation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.installationDate ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                }`}
              />
              {errors.installationDate && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.installationDate}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Finance, Terms & Milestones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
            <h4 className="font-bold text-slate-900 text-base">Section 3: Financials, Support & Project Status</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contract Value */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contract Value (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  name="contractValue"
                  value={formData.contractValue}
                  onChange={handleChange}
                  className={`block w-full pl-8 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                    errors.contractValue ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-250'
                  }`}
                  placeholder="85000"
                />
              </div>
              {errors.contractValue && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.contractValue}</p>}
            </div>

            {/* Payment Milestone Structure */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Payment Milestone Structure <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="paymentMilestone"
                value={formData.paymentMilestone}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.paymentMilestone ? 'border-rose-400' : 'border-slate-250'
                }`}
                placeholder="e.g. 50% Advance, 50% Installation"
              />
              {errors.paymentMilestone && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.paymentMilestone}</p>}
            </div>

            {/* Contract Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Project Contract Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="Draft">Draft (Proposal Phase)</option>
                <option value="Approved">Approved (Awaiting Logistical Scheduling)</option>
                <option value="In Progress">In Progress (Delivery or Assembly underway)</option>
                <option value="Completed">Completed (Project sign-off achieved)</option>
              </select>
            </div>

            {/* Warranty & support terms */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Warranty & Ongoing Service Terms <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="supportTerms"
                value={formData.supportTerms}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all ${
                  errors.supportTerms ? 'border-rose-400' : 'border-slate-250'
                }`}
                placeholder="e.g. 3 Years Preventive Maintenance, Annual Inspections, 5 Years Parts Warranty"
              />
              {errors.supportTerms && <p className="text-rose-600 text-xs font-semibold mt-1">{errors.supportTerms}</p>}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl border bg-white shadow-sm transition-all"
          >
            Cancel and Discard
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Save className="h-4.5 w-4.5" />
            {editId ? 'Commit Modifications' : 'Create Contract Registry'}
          </button>
        </div>
      </form>
    </div>
  );
}
