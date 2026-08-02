import { api } from '../config/api';
import { unsupportedXanoEndpoint } from '../config/xanoRoutes';

const asList = (data: any) => {
  const value = data?.data || data || [];
  return Array.isArray(value) ? value : value?.items || value?.results || [];
};

export const getProducts = async (filters?: Record<string, any>) => {
  const { data } = await api.get('/marketplace/products/', { params: filters || {} });
  return asList(data);
};

export const redeemProduct = async (productId: string, quantity = 1) => {
  const { data } = await api.post('/marketplace/orders/redeem', { product_id: productId, quantity });
  return data?.data || data;
};

export const getMyProducts = async () => [];
export const createProduct = async (_payload: any) => unsupportedXanoEndpoint('Création de produit vendeur');
export const updateProduct = async (_id: string, _payload: any) => unsupportedXanoEndpoint('Modification de produit vendeur');
export const deleteProduct = async (_id: string) => unsupportedXanoEndpoint('Suppression de produit vendeur');
export const getMyPromos = async () => [];
export const createPromo = async (_payload: any) => unsupportedXanoEndpoint('Création de promotion');
export const checkPromoCode = async (_code: string): Promise<any> => unsupportedXanoEndpoint('Vérification de code promotionnel');
export const getSellerOrders = async () => [];
export const updateOrderStatus = async (_id: string, _status: string) => unsupportedXanoEndpoint('Mise à jour de commande vendeur');
export const placeOrder = async (productId: string) => redeemProduct(productId, 1);
