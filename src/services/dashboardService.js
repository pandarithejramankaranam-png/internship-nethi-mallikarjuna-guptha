import api, { isOfflineError } from './api';
import { getContracts, getActivities as getLocalActivities } from './contractService';

export const getSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating dashboard summary fallback.");
      const contracts = await getContracts();
      const totalContracts = contracts.length;
      const activeContracts = contracts.filter(c => c.status === 'In Progress' || c.status === 'Approved').length;
      const completedProjects = contracts.filter(c => c.status === 'Completed').length;
      
      const totalPendingPayments = contracts.reduce((acc, curr) => {
        return acc + (curr.payments?.pendingAmount || 0);
      }, 0);

      const totalValue = contracts.reduce((acc, curr) => acc + curr.contractValue, 0);

      const recentContracts = [...contracts]
        .sort((a, b) => b.contractId.localeCompare(a.contractId))
        .slice(0, 5);

      return {
        totalContracts,
        activeContracts,
        completedProjects,
        totalPendingPayments,
        totalValue,
        recentContracts
      };
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
      return await getLocalActivities();
    }
    throw error;
  }
};
