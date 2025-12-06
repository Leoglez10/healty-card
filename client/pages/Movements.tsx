import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Tag, DollarSign, CreditCard } from 'lucide-react';
import { Usuario, Compra, Pago, Ingreso, Tarjeta } from '../types';
import { getCards, getPurchases, getPayments, getIncomes, createPurchase, createPayment, createIncome, formatCurrency, formatDate } from '../services/data';

interface MovementsProps {
  currentUser: Usuario;
}

type TabType = 'compras' | 'pagos' | 'ingresos';

export const Movements: React.FC<MovementsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('compras');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [compras, setCompras] = useState<Compra[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [userCards, setUserCards] = useState<Tarjeta[]>([]);

  // Load cards initially
  useEffect(() => {
    getCards(currentUser.id_usuario).then(setUserCards).catch(console.error);
  }, [currentUser.id_usuario]);

  // Load data based on tab
  useEffect(() => {
    setLoading(true);
    let promise;
    if (activeTab === 'compras') {
      // Need to fetch purchases for ALL cards. The API is by card.
      // Simplified: Fetch for the first card or all.
      // Wait, the API `getPurchases` takes `id_tarjeta`. I should probably change the API or loop here.
      // For now, let's assume we fetch for all cards.
      // But wait, the previous code had `TRANSACTIONS` global.
      // I will implement a loop or a new API endpoint. 
      // For simplicity, I'll fetch for each card and flatten.
      if (userCards.length > 0) {
        Promise.all(userCards.map(c => getPurchases(c.id_tarjeta)))
          .then(results => setCompras(results.flat().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setCompras([]);
        setLoading(false);
      }
    } else if (activeTab === 'pagos') {
      if (userCards.length > 0) {
        Promise.all(userCards.map(c => getPayments(c.id_tarjeta)))
          .then(results => setPagos(results.flat().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setPagos([]);
        setLoading(false);
      }
    } else {
      getIncomes(currentUser.id_usuario)
        .then(setIngresos)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, currentUser.id_usuario, userCards.length]); // Depend on userCards.length so if cards load, we fetch transactions

  // Form State
  const [formData, setFormData] = useState<any>({
    monto: '',
    descripcion: '',
    categoria: 'Comida',
    id_tarjeta: '', // Will update when cards load
    tipo_pago: 'total',
    fuente: 'Sueldo'
  });

  // Set default card when loading modal
  useEffect(() => {
    if (userCards.length > 0 && !formData.id_tarjeta) {
      setFormData(prev => ({ ...prev, id_tarjeta: userCards[0].id_tarjeta }));
    }
  }, [userCards]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.monto);

    try {
      if (activeTab === 'compras') {
        const newCompra = await createPurchase({
          id_tarjeta: Number(formData.id_tarjeta),
          descripcion: formData.descripcion,
          monto: amount,
          categoria: formData.categoria,
          fecha: new Date().toISOString().split('T')[0],
          es_msi: false
        });
        setCompras([newCompra, ...compras]);
      } else if (activeTab === 'pagos') {
        const newPago = await createPayment({
          id_tarjeta: Number(formData.id_tarjeta),
          monto: amount,
          tipo_pago: formData.tipo_pago,
          metodo: 'App',
          fecha: new Date().toISOString().split('T')[0]
        });
        setPagos([newPago, ...pagos]);
      } else {
        const newIngreso = await createIncome({
          id_usuario: currentUser.id_usuario,
          monto: amount,
          fuente: formData.fuente,
          fecha: new Date().toISOString().split('T')[0]
        });
        setIngresos([newIngreso, ...ingresos]);
      }
      setIsModalOpen(false);
      setFormData({ ...formData, monto: '', descripcion: '' });
    } catch (err: any) {
      console.error("Error creating movement:", err);
      alert(err.message || "Error al registrar movimiento");
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          <span className="capitalize">Nuevo {activeTab === 'compras' ? 'Gasto' : activeTab === 'pagos' ? 'Pago' : 'Ingreso'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['compras', 'pagos', 'ingresos'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                {activeTab !== 'ingresos' && <th className="px-6 py-4 font-medium">Tarjeta</th>}
                {activeTab === 'compras' && <th className="px-6 py-4 font-medium">Categoría</th>}
                <th className="px-6 py-4 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTab === 'compras' && compras.map(item => (
                <tr key={item.id_compra} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{formatDate(item.fecha)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.descripcion}</td>
                  <td className="px-6 py-4 text-gray-500">{userCards.find(c => c.id_tarjeta === item.id_tarjeta)?.alias}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-rose-600">
                    -{formatCurrency(item.monto)}
                  </td>
                </tr>
              ))}

              {activeTab === 'pagos' && pagos.map(item => (
                <tr key={item.id_pago} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{formatDate(item.fecha)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 capitalize">Pago {item.tipo_pago}</td>
                  <td className="px-6 py-4 text-gray-500">{userCards.find(c => c.id_tarjeta === item.id_tarjeta)?.alias}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                    +{formatCurrency(item.monto)}
                  </td>
                </tr>
              ))}

              {activeTab === 'ingresos' && ingresos.map(item => (
                <tr key={item.id_ingreso} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{formatDate(item.fecha)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.fuente}</td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-600">
                    +{formatCurrency(item.monto)}
                  </td>
                </tr>
              ))}

              {/* Empty States */}
              {((activeTab === 'compras' && compras.length === 0) ||
                (activeTab === 'pagos' && pagos.length === 0) ||
                (activeTab === 'ingresos' && ingresos.length === 0)) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 capitalize">Registrar {activeTab}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {activeTab !== 'ingresos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarjeta</label>
                  <select className="w-full p-2 border rounded-lg bg-white" required
                    value={formData.id_tarjeta} onChange={e => setFormData({ ...formData, id_tarjeta: e.target.value })}>
                    {userCards.map(c => <option key={c.id_tarjeta} value={c.id_tarjeta}>{c.alias} - {c.banco}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input type="number" step="0.01" required className="w-full pl-7 p-2 border rounded-lg"
                    value={formData.monto} onChange={e => setFormData({ ...formData, monto: e.target.value })} />
                </div>
              </div>

              {activeTab === 'compras' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input type="text" required className="w-full p-2 border rounded-lg" placeholder="Ej: Supermercado"
                      value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select className="w-full p-2 border rounded-lg bg-white"
                      value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                      {['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Compras', 'Salud', 'Otro'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'pagos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                  <select className="w-full p-2 border rounded-lg bg-white"
                    value={formData.tipo_pago} onChange={e => setFormData({ ...formData, tipo_pago: e.target.value })}>
                    <option value="total">Pago Total</option>
                    <option value="minimo">Pago Mínimo</option>
                    <option value="parcial">Pago Parcial</option>
                  </select>
                </div>
              )}

              {activeTab === 'ingresos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" placeholder="Ej: Bono"
                    value={formData.fuente} onChange={e => setFormData({ ...formData, fuente: e.target.value })} />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
