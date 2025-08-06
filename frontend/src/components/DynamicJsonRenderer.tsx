import { cn } from '../lib/utils';

interface DynamicJsonRendererProps {
  data: any;
  title?: string;
  className?: string;
}

interface JsonSection {
  title: string;
  data: any;
  type: 'object' | 'array' | 'primitive';
}

export default function DynamicJsonRenderer({ data, className }: DynamicJsonRendererProps) {
  if (!data) return null;

  const formatFieldName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return new Date(value).toLocaleString('pt-BR');
    }
    return String(value);
  };

  const getStatusColor = (value: string): string => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('ativa') || lowerValue.includes('regular') || lowerValue.includes('sucesso')) {
      return 'bg-green-100 text-green-800';
    }
    if (lowerValue.includes('inativa') || lowerValue.includes('irregular') || lowerValue.includes('erro')) {
      return 'bg-red-100 text-red-800';
    }
    if (lowerValue.includes('pendente') || lowerValue.includes('processando')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const shouldDisplayAsBadge = (key: string, value: any): boolean => {
    if (typeof value !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const lowerValue = value.toLowerCase();
    
    return (
      lowerKey.includes('situacao') ||
      lowerKey.includes('status') ||
      lowerKey.includes('classificacao') ||
      lowerValue.includes('ativa') ||
      lowerValue.includes('inativa') ||
      lowerValue.includes('regular') ||
      lowerValue.includes('irregular') ||
      lowerValue.includes('sucesso') ||
      lowerValue.includes('erro')
    );
  };

  const analyzeJsonStructure = (obj: any): JsonSection[] => {
    const sections: JsonSection[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          sections.push({
            title: formatFieldName(key),
            data: value,
            type: 'array'
          });
        }
      } else if (typeof value === 'object') {
        sections.push({
          title: formatFieldName(key),
          data: value,
          type: 'object'
        });
      } else {
        const existingPrimitiveSection = sections.find(s => s.type === 'primitive');
        if (existingPrimitiveSection) {
          existingPrimitiveSection.data[key] = value;
        } else {
          sections.unshift({
            title: 'Informações Gerais',
            data: { [key]: value },
            type: 'primitive'
          });
        }
      }
    });

    return sections;
  };

  const renderPrimitiveSection = (sectionData: any, sectionTitle: string) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-900 text-white px-6 py-4">
        <h3 className="text-lg font-semibold">{sectionTitle}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(sectionData).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                  {formatFieldName(key)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {shouldDisplayAsBadge(key, value) ? (
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(String(value))
                    )}>
                      {formatValue(value)}
                    </span>
                  ) : (
                    formatValue(value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderArraySection = (sectionData: any[], sectionTitle: string) => {
    if (sectionData.length === 0) return null;

    const firstItem = sectionData[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      const headers = Object.keys(firstItem);
      
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{sectionTitle}</h3>
            <span className="bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-medium">
              {sectionData.length} item(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {formatFieldName(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sectionData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {headers.map(header => (
                      <td key={header} className="px-6 py-4 text-sm text-gray-700">
                        {shouldDisplayAsBadge(header, item[header]) ? (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(String(item[header]))
                          )}>
                            {formatValue(item[header])}
                          </span>
                        ) : (
                          formatValue(item[header])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{sectionTitle}</h3>
            <span className="bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-medium">
              {sectionData.length} item(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                {sectionData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatValue(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  const renderObjectSection = (sectionData: any, sectionTitle: string) => {
    const hasArrays = Object.values(sectionData).some(value => Array.isArray(value) && value.length > 0);
    
    if (hasArrays) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-900 text-white px-6 py-4">
            <h3 className="text-lg font-semibold">{sectionTitle}</h3>
          </div>
          <div className="space-y-4 p-6">
            {Object.entries(sectionData).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0];
                if (typeof firstItem === 'object' && firstItem !== null) {
                  const headers = Object.keys(firstItem);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-900">{formatFieldName(key)}</h4>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {value.length} item(s)
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {headers.map(header => (
                                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {formatFieldName(header)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {value.map((item: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {headers.map(header => (
                                  <td key={header} className="px-4 py-2 text-sm text-gray-700">
                                    {shouldDisplayAsBadge(header, item[header]) ? (
                                      <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                        getStatusColor(String(item[header]))
                                      )}>
                                        {formatValue(item[header])}
                                      </span>
                                    ) : (
                                      formatValue(item[header])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
              } else if (!Array.isArray(value)) {
                return (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-900">{formatFieldName(key)}</span>
                    <span className="text-sm text-gray-700">
                      {shouldDisplayAsBadge(key, value) ? (
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(String(value))
                        )}>
                          {formatValue(value)}
                        </span>
                      ) : (
                        formatValue(value)
                      )}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    } else {
      return renderPrimitiveSection(sectionData, sectionTitle);
    }
  };

  const sections = analyzeJsonStructure(data);

  return (
    <div className={cn("space-y-6", className)}>
      {sections.map((section, index) => (
        <div key={index}>
          {section.type === 'primitive' && renderPrimitiveSection(section.data, section.title)}
          {section.type === 'array' && renderArraySection(section.data, section.title)}
          {section.type === 'object' && renderObjectSection(section.data, section.title)}
        </div>
      ))}
    </div>
  );
}
