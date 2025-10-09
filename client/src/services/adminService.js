import API from './api';

export const adminService = {
  getUnverifiedCounsellors: () => API.get('/admin/counsellors/unverified'),
  verifyCounsellor: (counsellorId) => API.put(`/admin/counsellors/${counsellorId}/verify`),
};