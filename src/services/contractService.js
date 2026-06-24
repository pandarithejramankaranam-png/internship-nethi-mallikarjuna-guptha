import api, { isOfflineError } from './api';
import { initialContracts, initialActivities } from '../data/mockData';

const CONTRACTS_KEY = 'gym_contracts_data';
const ACTIVITIES_KEY = 'gym_activities_data';

// Initialize data if not already present in localStorage (for fallback mode)
const initializeStorage = () => {
  if (!localStorage.getItem(CONTRACTS_KEY)) {
    localStorage.setItem(CONTRACTS_KEY, JSON.stringify(initialContracts));
  }
  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(initialActivities));
  }
};

export const getContracts = async (params = {}) => {
  try {
    const response = await api.get('/contracts', { params });
    return response.data; // Expected: array of contracts
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Fetching contracts from localStorage fallback.");
      initializeStorage();
      return JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || [];
    }
    throw error;
  }
};

export const getContractById = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`Backend offline. Fetching contract ${id} from localStorage fallback.`);
      initializeStorage();
      const contracts = JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || [];
      return contracts.find(c => c.contractId === id) || null;
    }
    throw error;
  }
};

export const saveContract = async (contractData) => {
  try {
    const payload = { ...contractData };
    payload.contractValue = Number(payload.contractValue);
    const isNew = !payload.contractId;
    if (isNew) {
      const response = await api.post('/contracts', payload);
      return response.data;
    } else {
      const response = await api.put(`/contracts/${payload.contractId}`, payload);
      return response.data;
    }
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Saving contract to localStorage fallback.");
      initializeStorage();
      const contracts = JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || [];
      let saved = { ...contractData };
      saved.contractValue = Number(saved.contractValue);

      if (!saved.contractId) {
        // Create new contract
        const count = contracts.length + 1;
        const paddedNum = String(count).padStart(3, '0');
        saved.contractId = `CON-2026-${paddedNum}`;
        saved.payments = {
          totalAmount: saved.contractValue,
          paidAmount: 0,
          pendingAmount: saved.contractValue,
          dueDate: saved.deliveryDate || new Date().toISOString().split('T')[0],
          paymentStatus: "Unpaid",
          history: [
            {
              date: saved.deliveryDate || new Date().toISOString().split('T')[0],
              amount: saved.contractValue,
              milestone: `Advance / Delivery Payment (100%)`,
              status: "Pending",
              method: "ACH Transfer"
            }
          ]
        };
        contracts.push(saved);
        addActivity("Admin Team", "created contract", saved.contractId, `Contract for ${saved.clientName} initialized at ₹${saved.contractValue.toLocaleString()} (Offline Fallback).`);
      } else {
        // Edit existing contract
        const index = contracts.findIndex(c => c.contractId === saved.contractId);
        if (index !== -1) {
          const existing = contracts[index];
          saved.payments = {
            ...existing.payments,
            totalAmount: saved.contractValue,
            pendingAmount: Math.max(0, saved.contractValue - (existing.payments?.paidAmount || 0)),
          };
          contracts[index] = saved;
          addActivity("Admin Team", "updated contract", saved.contractId, `Contract details for ${saved.clientName} were updated (Offline Fallback).`);
        }
      }
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
      return saved;
    }
    throw error;
  }
};

export const deleteContract = async (id) => {
  try {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`Backend offline. Deleting contract ${id} from localStorage fallback.`);
      initializeStorage();
      const contracts = JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || [];
      const contract = contracts.find(c => c.contractId === id);
      const filtered = contracts.filter(c => c.contractId !== id);
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(filtered));
      if (contract) {
        addActivity("Admin Team", "deleted contract", id, `Contract for ${contract.clientName} was deleted (Offline Fallback).`);
      }
      return true;
    }
    throw error;
  }
};

export const getActivities = async () => {
  try {
    const response = await api.get('/dashboard/activities');
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      initializeStorage();
      return JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || [];
    }
    console.error("Error fetching activities:", error);
    return [];
  }
};

export const addActivity = async (user, action, target, details) => {
  try {
    const response = await api.post('/dashboard/activities', { user, action, target, details });
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      initializeStorage();
      const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || [];
      const newActivity = {
        id: `act-${Date.now()}`,
        user,
        action,
        target,
        timestamp: new Date().toISOString(),
        details
      };
      activities.unshift(newActivity);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities.slice(0, 15)));
      return newActivity;
    }
    console.error("Error adding activity:", error);
    return null;
  }
};

export const recordPayment = async (contractId, historyIndex) => {
  try {
    const response = await api.put(`/contracts/${contractId}/payments/${historyIndex}/record`);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`Backend offline. Recording payment for contract ${contractId} milestone ${historyIndex} in localStorage fallback.`);
      initializeStorage();
      const contracts = JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || [];
      const index = contracts.findIndex(c => c.contractId === contractId);
      if (index !== -1) {
        const contract = contracts[index];
        if (contract.payments?.history && contract.payments.history[historyIndex]) {
          const payment = contract.payments.history[historyIndex];
          if (payment.status !== 'Paid') {
            payment.status = 'Paid';
            contract.payments.paidAmount += payment.amount;
            contract.payments.pendingAmount = Math.max(0, contract.payments.totalAmount - contract.payments.paidAmount);
            contract.payments.paymentStatus = contract.payments.pendingAmount === 0 ? 'Paid' : 'Partially Paid';
            contracts[index] = contract;
            localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
            addActivity("Finance Dept", "recorded payment", contractId, `Received payment of ₹${payment.amount.toLocaleString()} for milestone: "${payment.milestone}" (Offline Fallback).`);
            return true;
          }
        }
      }
      return false;
    }
    throw error;
  }
};
