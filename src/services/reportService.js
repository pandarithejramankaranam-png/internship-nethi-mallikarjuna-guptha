import api, { isOfflineError } from './api';
import { getContracts } from './contractService';

export const getStatusStats = async () => {
  try {
    const response = await api.get('/reports/status');
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating status stats report fallback.");
      const contracts = await getContracts();
      return contracts.reduce((acc, curr) => {
        const status = curr.status || 'Draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    }
    throw error;
  }
};

export const getRevenueStats = async () => {
  try {
    const response = await api.get('/reports/revenue');
    return response.data;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Backend offline. Simulating revenue stats report fallback.");
      const contracts = await getContracts();
      return contracts.reduce((acc, curr) => {
        const type = curr.clientType || 'Corporate';
        acc[type] = (acc[type] || 0) + curr.contractValue;
        return acc;
      }, {});
    }
    throw error;
  }
};
