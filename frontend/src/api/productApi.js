import axiosClient from './axiosClient';

const productApi = {
  getAll: () => axiosClient.get('/product'),
  getById: id => axiosClient.get(`/product/${id}`)
};

export default productApi;
