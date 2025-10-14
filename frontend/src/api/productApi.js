import axiosClient from './axiosClient';

const productApi = {
  getAll: () => axiosClient.get('/products'),
  getById: id => axiosClient.get(`/products/${id}`)
};

export default productApi;
