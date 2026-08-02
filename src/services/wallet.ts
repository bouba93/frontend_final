import { api } from '../config/api';

export interface WalletTransaction {
  id: string | number;
  type: 'credit' | 'debit' | string;
  amount: number;
  description?: string;
  created_at?: string;
  status?: string;
}

export interface WalletData {
  balance: number;
  gnf_value?: number;
  transactions: WalletTransaction[];
}

export async function getWallet(): Promise<WalletData> {
  const { data } = await api.get('/auth/wallet/');
  const payload = data?.data || data || {};
  return {
    balance: Number(payload.balance ?? payload.points ?? 0),
    gnf_value: Number(payload.gnf_value ?? (payload.balance ?? payload.points ?? 0) * 100),
    transactions: payload.transactions || [],
  };
}
