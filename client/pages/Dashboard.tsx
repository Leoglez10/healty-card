import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Usuario, AnalisisFinanciero } from '../types';
import { getFinancialAnalysis, formatCurrency } from '../services/data';

interface DashboardProps {
  currentUser: Usuario;
  users: Usuario[];
  onUserChange: (userId: number) => void;
}

const StatCard = ({ title, amount, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, onUserChange }) => {
  const [data, setData] = useState<AnalisisFinanciero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFinancialAnalysis(currentUser.id_usuario)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser.id_usuario]);

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Cargando análisis financiero...</div>;

  // Transform data for charts
  const debtData = data.tarjetas
    .filter(t => t.tipo === 'crédito')
    .map(t => ({
      name: t.alias,
      Deuda: t.deuda,
      Disponible: t.disponible
    }));

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hola, {currentUser.nombre} 👋</h1>
          <p className="text-gray-500">Aquí está tu resumen financiero de este mes.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Ver como:</span>
          <select
            value={currentUser.id_usuario}
            onChange={(e) => onUserChange(Number(e.target.value))}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm"
          >
            {users.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Deuda Total"
          amount={data.deuda_total}
          icon={TrendingDown}
          color="bg-rose-500"
        />
        <StatCard
          title="Disponible"
          amount={data.disponible_total}
          icon={Wallet}
          color="bg-emerald-500"
        />
        <StatCard
          title="Ingresos Mes"
          amount={data.ingresos_mes}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Saldo Neto"
          amount={data.saldo_neto}
          icon={TrendingUp}
          color={data.saldo_neto >= 0 ? "bg-indigo-500" : "bg-orange-500"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Gastos por Categoría</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.gastos_por_categoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.gastos_por_categoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt vs Available */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Utilización de Crédito</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={debtData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: '#F3F4F6' }} />
                <Legend />
                <Bar dataKey="Deuda" stackId="a" fill="#F43F5E" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Disponible" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Recomendaciones del Asistente</h3>
          </div>
          <div className="space-y-3">
            {data.recomendaciones.map((rec, idx) => (
              <div key={idx} className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg text-indigo-900 text-sm">
                {rec}
              </div>
            ))}
            {data.recomendaciones.length === 0 && (
              <div className="text-gray-500 text-sm italic">Todo se ve bien por ahora.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Estado de Tarjetas</h3>
          <div className="space-y-4">
            {data.tarjetas.filter(t => t.tipo === 'crédito').map(card => (
              <div key={card.id_tarjeta} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{card.alias}</p>
                  <p className="text-xs text-gray-500">{card.banco}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${card.estado === 'verde' ? 'bg-green-100 text-green-700' :
                    card.estado === 'amarillo' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                  {card.porcentaje_utilizado}% Uso
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
