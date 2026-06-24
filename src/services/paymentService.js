import api, { isOfflineError } from './api';
import { getContracts, recordPayment } from './contractService';

export const getPayments = async () => {
  try {
    const response = await api.get('/payments');
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating getPayments milestone collection.");
      const contracts = await getContracts();
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
      return allMilestones;
    }
    throw error;
  }
};

export const createPayment = async (data) => {
  try {
    const response = await api.post('/payments', data);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating createPayment stub.");
      return data;
    }
    throw error;
  }
};

export const updatePaymentStatus = async (id, data) => {
  try {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating updatePaymentStatus stub.");
      return { id, ...data };
    }
    throw error;
  }
};

// Record payment for a specific milestone index of a contract
export const recordMilestonePayment = async (contractId, milestoneIndex) => {
  try {
    const response = await api.put(`/contracts/${contractId}/payments/${milestoneIndex}/record`);
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating recordMilestonePayment via contractService.");
      return await recordPayment(contractId, milestoneIndex);
    }
    throw error;
  }
};
