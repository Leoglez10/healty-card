import { Usuario, Tarjeta, Compra, Pago, Ingreso, AnalisisFinanciero } from '../types';

// --- API Client ---

const API_URL = '/api';

export const getUsers = async (): Promise<Usuario[]> => {
  const res = await fetch(`${API_URL}/usuarios`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const createUser = async (user: Omit<Usuario, 'id_usuario' | 'fecha_registro'>): Promise<Usuario> => {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

export const getCards = async (userId: number): Promise<Tarjeta[]> => {
  const res = await fetch(`${API_URL}/tarjetas/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
};

export const createCard = async (card: Omit<Tarjeta, 'id_tarjeta' | 'fecha_creacion'>): Promise<Tarjeta> => {
  const res = await fetch(`${API_URL}/tarjetas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card)
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
};

export const getPurchases = async (cardId: number): Promise<Compra[]> => {
  const res = await fetch(`${API_URL}/compras/${cardId}`);
  if (!res.ok) throw new Error('Failed to fetch purchases');
  return res.json();
};

export const createPurchase = async (purchase: Omit<Compra, 'id_compra' | 'fecha_creacion'>): Promise<Compra> => {
  const res = await fetch(`${API_URL}/compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchase)
  });
  if (!res.ok) throw new Error('Failed to create purchase');
  return res.json();
};

export const getPayments = async (cardId: number): Promise<Pago[]> => {
  const res = await fetch(`${API_URL}/pagos/${cardId}`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
};

export const createPayment = async (payment: Omit<Pago, 'id_pago' | 'fecha_creacion'>): Promise<Pago> => {
  const res = await fetch(`${API_URL}/pagos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment)
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
};

export const getIncomes = async (userId: number): Promise<Ingreso[]> => {
  const res = await fetch(`${API_URL}/ingresos/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch incomes');
  return res.json();
};

export const createIncome = async (income: Omit<Ingreso, 'id_ingreso' | 'fecha_creacion'>): Promise<Ingreso> => {
  const res = await fetch(`${API_URL}/ingresos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(income)
  });
  if (!res.ok) throw new Error('Failed to create income');
  return res.json();
};

export const getFinancialAnalysis = async (userId: number): Promise<AnalisisFinanciero> => {
  const res = await fetch(`${API_URL}/analisis-financiero/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch financial analysis');
  return res.json();
};

export const simulateInterest = async (data: { monto_compra: number, tasa_anual: number, meses_pago?: number }) => {
  const res = await fetch(`${API_URL}/simular-intereses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to simulate interest');
  return res.json();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- Deprecated / Mock Data Exporters ---
// Keeping empty arrays or fetchers to avoid breaking imports in untouched files if any.
// But mostly we should replace usage.
export const USERS: Usuario[] = [];
export const CARDS: Tarjeta[] = [];
export const TRANSACTIONS: Compra[] = [];
export const PAYMENTS: Pago[] = [];
export const INCOMES: Ingreso[] = [];