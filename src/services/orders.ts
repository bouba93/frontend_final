import { unsupportedXanoEndpoint } from '../config/xanoRoutes';

export interface CartItem {
  document_id?: string;
  name: string;
  unit_price: number;
  quantity: number;
}

export async function createOrder(_items: CartItem[], _currency = 'GNF'): Promise<any> {
  return unsupportedXanoEndpoint("Création d'une commande monétaire");
}

export async function getOrders() {
  return [];
}
