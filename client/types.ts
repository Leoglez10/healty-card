export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  presupuesto_mensual: number;
}

export interface Tarjeta {
  id_tarjeta: number;
  id_usuario: number;
  banco: string;
  tipo: 'crédito' | 'débito';
  alias: string;
  ultimos_digitos: string;
  limite_credito: number;
  tasa_interes_mensual: number;
  fecha_corte: number;
  fecha_pago: number;
}

export interface Compra {
  id_compra: number;
  id_tarjeta: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string; // ISO Date string
  es_msi: boolean;
  meses_msi?: number;
}

export interface Pago {
  id_pago: number;
  id_tarjeta: number;
  tipo_pago: 'total' | 'minimo' | 'parcial';
  monto: number;
  metodo: string;
  notas?: string;
  fecha: string;
}

export interface Ingreso {
  id_ingreso: number;
  id_usuario: number;
  fuente: string;
  monto: number;
  fecha: string;
}

// Interfaces for Analysis
export interface TarjetaAnalisis extends Tarjeta {
  deuda: number;
  disponible: number;
  porcentaje_utilizado: number;
  estado: 'verde' | 'amarillo' | 'rojo';
}

export interface GastoCategoria {
  name: string; // Changed from 'categoria' to 'name' for Recharts compatibility
  value: number; // Changed from 'monto' to 'value' for Recharts compatibility
  porcentaje: number;
  color: string;
}

export interface AnalisisFinanciero {
  usuario: string;
  deuda_total: number;
  disponible_total: number;
  interes_estimado_mensual: number;
  tarjetas: TarjetaAnalisis[];
  gastos_por_categoria: GastoCategoria[];
  ingresos_mes: number;
  gastos_mes: number;
  saldo_neto: number;
  recomendaciones: string[];
}