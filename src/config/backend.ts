/**
 * Configuration centralisée du backend Kharandi.
 * VITE_API_URL cible le groupe API public créé dans Xano.
 */
export const BASE_API_URL         = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const API_URL              = BASE_API_URL;
export const XANO_API_URL         = BASE_API_URL;
export const OTP_API_URL          = `${BASE_API_URL}/auth`;
export const PAYMENT_API_URL      = `${BASE_API_URL}/payments`;
export const SUBSCRIPTION_API_URL = `${BASE_API_URL}/payments/subscriptions`;
