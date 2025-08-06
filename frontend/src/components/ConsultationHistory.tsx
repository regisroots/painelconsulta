import { useState, useEffect } from 'react';
import { consultaAPI } from '../services/api';
import { Consulta } from '../types';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';

interface ConsultationHistoryProps {
  onBack?: () => void;
}

export default function ConsultationHistory({ onBack }: ConsultationHistoryProps) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultas();
  }, []);

  const loadConsultas = async () => {
    try {
      setLoading(true);
      const response = await consultaAPI.getConsultas();
      setConsultas(Array.isArray(response) ? response : (response as any).consultas || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    return status === 'sucesso' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'sucesso' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Sucesso
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Falha
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => onBack ? onBack() : window.location.href = '/'}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Histórico de Consultas
          </h1>
          <p className="text-xl text-gray-600">
            Visualize todas as suas consultas realizadas
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Suas Consultas
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="ml-4 text-gray-600 text-lg">Carregando histórico...</p>
            </div>
          ) : consultas.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma consulta encontrada
              </h4>
              <p className="text-gray-600">
                Suas consultas aparecerão aqui quando você realizar alguma.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dados Consultados
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consultas.map((consulta) => (
                    <tr key={consulta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(consulta.data)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="font-medium">{(consulta as any).Modulo?.nome || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{(consulta as any).Modulo?.descricao || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(consulta.status)}
                          {getStatusBadge(consulta.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="text-xs bg-gray-100 rounded px-2 py-1 font-mono">
                          {Object.entries(consulta.input).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
