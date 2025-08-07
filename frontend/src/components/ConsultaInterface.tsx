import { useState } from 'react';
import { Modulo } from '../types';
import { consultaAPI } from '../services/api';
import DynamicJsonRenderer from './DynamicJsonRenderer';

interface ConsultaInterfaceProps {
  modulo: Modulo;
  onBack: () => void;
  onConsultaSuccess?: () => void;
}

export default function ConsultaInterface({ modulo, onBack, onConsultaSuccess }: ConsultaInterfaceProps) {
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (campo: string, valor: string) => {
    setInputData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleConsulta = async () => {
    setLoading(true);
    setError('');
    
    console.log('=== FRONTEND CONSULTA DEBUG ===');
    console.log('Modulo ID:', modulo.id);
    console.log('Input Data:', inputData);
    console.log('Modulo completo:', modulo);
    
    try {
      console.log('Chamando consultaAPI.realizarConsulta...');
      const response = await consultaAPI.realizarConsulta(modulo.id, inputData);
      console.log('Resposta recebida:', response);
      setResultado(response.retorno);
      if (onConsultaSuccess) {
        onConsultaSuccess();
      }
    } catch (err: any) {
      console.error('Erro na consulta:', err);
      setError(err.response?.data?.error || 'Erro ao realizar consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setInputData({});
    setResultado(null);
    setError('');
  };

  const handleSalvarPDF = () => {
    window.print();
  };

  const handleCopiar = () => {
    if (resultado) {
      navigator.clipboard.writeText(JSON.stringify(resultado, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    {modulo.nome}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Consulta Premium</p>
                </div>
              </div>
            </div>
            
            {resultado && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSalvarPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Salvar PDF
                </button>
                <button
                  onClick={handleCopiar}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Copiar
                </button>
                <button
                  onClick={handleSalvarPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={handleLimpar}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!resultado ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {modulo.nome}
                </h2>
                <p className="text-gray-600">
                  {modulo.descricao}
                </p>
              </div>

              <div className="space-y-4">
                {modulo.campos_entrada?.map((campo: any) => (
                  <div key={campo.nome}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {campo.nome.toUpperCase()}
                      {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={inputData[campo.nome] || ''}
                      onChange={(e) => handleInputChange(campo.nome, e.target.value)}
                      placeholder={campo.mascara || `Digite o ${campo.nome}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleConsulta}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Consultando...</span>
                    </>
                  ) : (
                    <span>Consultar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Consultation Field */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                  Nova Consulta Rápida
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {modulo.nome}
                </span>
              </div>
              
              <div className="flex gap-4">
                {modulo.campos_entrada?.map((campo: any) => (
                  <div key={campo.nome} className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {campo.nome.toUpperCase()}
                      {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={inputData[campo.nome] || ''}
                      onChange={(e) => handleInputChange(campo.nome, e.target.value)}
                      placeholder={campo.mascara || `Digite o ${campo.nome}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
                
                <div className="flex items-end">
                  <button
                    onClick={handleConsulta}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Consultando...</span>
                      </>
                    ) : (
                      <span>Consultar</span>
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
            
            {/* Results */}
            <DynamicJsonRenderer data={resultado} title="Resultado da Consulta" />
          </div>
        )}
      </div>
    </div>
  );
}
