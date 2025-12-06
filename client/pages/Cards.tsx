import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as CardIcon, Calendar, Percent, Landmark } from 'lucide-react';
import { Tarjeta, Usuario } from '../types';
import { getCards, createCard, formatCurrency } from '../services/data';

interface CardsProps {
  currentUser: Usuario;
}

export const Cards: React.FC<CardsProps> = ({ currentUser }) => {
  const [cards, setCards] = useState<Tarjeta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCards(currentUser.id_usuario)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser.id_usuario]);

  // Form State
  const [newCard, setNewCard] = useState<Partial<Tarjeta>>({
    tipo: 'crédito',
    banco: '',
    alias: '',
    ultimos_digitos: '',
    limite_credito: 0,
    tasa_interes_mensual: 0,
    fecha_corte: 1,
    fecha_pago: 1
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdCard = await createCard({
        ...newCard as Tarjeta,
        id_usuario: currentUser.id_usuario
      });
      setCards([...cards, createdCard]);
      setIsModalOpen(false);
      // Reset form...
      setNewCard({ ...newCard, banco: '', alias: '', ultimos_digitos: '' });
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Error al crear la tarjeta");
    }
  };

  if (loading && cards.length === 0) return <div className="p-8 text-center text-gray-500">Cargando tarjetas...</div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Tarjetas</h1>
          <p className="text-gray-500">Administra tus métodos de pago.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Nueva Tarjeta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id_tarjeta} className="group relative">
            {/* Visual Representation of Card */}
            <div className={`
              h-56 rounded-2xl p-6 text-white shadow-xl transition-transform transform group-hover:-translate-y-1
              flex flex-col justify-between relative overflow-hidden
              ${card.tipo === 'crédito'
                ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
                : 'bg-gradient-to-br from-emerald-800 to-teal-600'}
            `}>

              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-5"></div>
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-5"></div>

              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-xs opacity-75 uppercase tracking-wider">{card.banco}</p>
                  <p className="font-bold text-lg tracking-wide">{card.alias}</p>
                </div>
                <CardIcon className="opacity-80" />
              </div>

              <div className="z-10 flex gap-4 items-center my-4">
                <div className="w-12 h-8 bg-yellow-400/20 rounded border border-yellow-400/40 flex items-center justify-center">
                  <div className="w-8 h-5 border border-yellow-500/50 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="bg-yellow-500/50 rounded-[1px]"></div>
                    <div className="bg-yellow-500/50 rounded-[1px]"></div>
                  </div>
                </div>
                <div className="font-mono text-xl tracking-widest text-shadow-sm">
                  •••• •••• •••• {card.ultimos_digitos}
                </div>
              </div>

              <div className="flex justify-between items-end z-10">
                <div>
                  <p className="text-[10px] opacity-75 uppercase">Titular</p>
                  <p className="font-medium text-sm tracking-wide">{currentUser.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-75 uppercase">Límite</p>
                  <p className="font-bold">{card.tipo === 'crédito' ? formatCurrency(card.limite_credito) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Details Panel below card */}
            <div className="bg-white mx-2 -mt-4 pt-6 pb-4 px-4 rounded-b-xl shadow-sm border-x border-b border-gray-100 z-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Corte</p>
                    <p className="font-semibold">Día {card.fecha_corte}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-indigo-500" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Pago</p>
                    <p className="font-semibold">Día {card.fecha_pago}</p>
                  </div>
                </div>
                {card.tipo === 'crédito' && (
                  <div className="flex items-center gap-2 text-gray-600 col-span-2">
                    <Percent size={16} className="text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Interés Mensual</p>
                      <p className="font-semibold">{card.tasa_interes_mensual}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Registrar Nueva Tarjeta</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                <input required className="w-full p-2 border rounded-lg" placeholder="Ej: Santander"
                  value={newCard.banco} onChange={e => setNewCard({ ...newCard, banco: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input required className="w-full p-2 border rounded-lg" placeholder="Ej: Visa Oro"
                    value={newCard.alias} onChange={e => setNewCard({ ...newCard, alias: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4</label>
                  <input required maxLength={4} className="w-full p-2 border rounded-lg" placeholder="1234"
                    value={newCard.ultimos_digitos} onChange={e => setNewCard({ ...newCard, ultimos_digitos: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full p-2 border rounded-lg bg-white"
                    value={newCard.tipo} onChange={e => setNewCard({ ...newCard, tipo: e.target.value as any })}>
                    <option value="crédito">Crédito</option>
                    <option value="débito">Débito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite</label>
                  <input type="number" required className="w-full p-2 border rounded-lg" placeholder="50000"
                    value={newCard.limite_credito || ''} onChange={e => setNewCard({ ...newCard, limite_credito: Number(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Día Corte</label>
                  <input type="number" max={31} min={1} className="w-full p-2 border rounded-lg"
                    value={newCard.fecha_corte || ''} onChange={e => setNewCard({ ...newCard, fecha_corte: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Día Pago</label>
                  <input type="number" max={31} min={1} className="w-full p-2 border rounded-lg"
                    value={newCard.fecha_pago || ''} onChange={e => setNewCard({ ...newCard, fecha_pago: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Interés %</label>
                  <input type="number" step="0.1" className="w-full p-2 border rounded-lg"
                    value={newCard.tasa_interes_mensual || ''} onChange={e => setNewCard({ ...newCard, tasa_interes_mensual: Number(e.target.value) })} />
                </div>
              </div>

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
