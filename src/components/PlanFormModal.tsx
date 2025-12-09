import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Plan, PlanFeatures } from '../types';
import { Button } from './Button';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Plan) => void;
    plan?: Plan | null;
}

const DEFAULT_FEATURES: PlanFeatures = {
    cashback: false,
    crm_campaigns: false,
    curva_abc: false,
    api_whatsapp: false,
    nota_fiscal: false,
    multi_loja: false,
    lista_inteligente: false,
};

const DEFAULT_PLAN: Plan = {
    id: '',
    name: 'START',
    priceMonthly: 0,
    priceYearly: 0,
    maxClients: 0,
    maxUsers: 0,
    features: DEFAULT_FEATURES,
};

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    plan,
}) => {
    const [formData, setFormData] = useState<Plan>(DEFAULT_PLAN);

    useEffect(() => {
        if (isOpen) {
            if (plan) {
                setFormData({ ...plan });
            } else {
                setFormData({
                    ...DEFAULT_PLAN,
                    id: `p_${Date.now()}`, // Generate a temp ID
                    features: { ...DEFAULT_FEATURES }
                });
            }
        }
    }, [isOpen, plan]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleFeatureChange = (key: keyof PlanFeatures) => {
        setFormData((prev) => ({
            ...prev,
            features: {
                ...prev.features,
                [key]: !prev.features[key],
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-900">
                        {plan ? 'Editar Plano' : 'Novo Plano'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nome do Plano
                            </label>
                            <select
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="START">START</option>
                                <option value="PREMIUM">PREMIUM</option>
                                <option value="ADVANCED">ADVANCED</option>
                                <option value="ENTERPRISE">ENTERPRISE</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Preço Mensal (R$)
                            </label>
                            <input
                                type="number"
                                name="priceMonthly"
                                value={formData.priceMonthly}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Preço Anual (R$)
                            </label>
                            <input
                                type="number"
                                name="priceYearly"
                                value={formData.priceYearly}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Máx. Clientes
                            </label>
                            <input
                                type="number"
                                name="maxClients"
                                value={formData.maxClients}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Máx. Usuários
                            </label>
                            <input
                                type="number"
                                name="maxUsers"
                                value={formData.maxUsers}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-slate-900 border-b pb-2">Recursos Inclusos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(DEFAULT_FEATURES) as Array<keyof PlanFeatures>).map((key) => (
                                <label key={key} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.features[key]}
                                        onChange={() => handleFeatureChange(key)}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-slate-700 capitalize">
                                        {key.replace('_', ' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
