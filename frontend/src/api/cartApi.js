import axiosClient from './axiosClient';

const cartApi = {
    getCartByAccountId: (accountId) => axiosClient.get(`/Cart/GetCartByAccountId/${accountId}`),
    AddItem: (data) => axiosClient.post('/Cart/AddItem', data),
    UpdateItem: (req) => axiosClient.put('/Cart/UpdateItem', req),
    RemoveItem: (accountId, productId, variantId) => axiosClient.delete('/Cart/RemoveItem', {
        params: { accountId, productId, variantId }
    })
};

export default cartApi;
