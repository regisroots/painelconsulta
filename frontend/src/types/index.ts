export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'revendedor' | 'usuario';
  creditos: number;
  data_expiracao: string | null;
  modulos: Record<string, { limite: number; usado: number }>;
  ativo: boolean;
  banido: boolean;
  motivo_banimento?: string;
  revendedor_id?: number;
  whatsapp_contato?: string;
  telegram_contato?: string;
  revendedor?: User;
}

export interface Modulo {
  id: number;
  nome: string;
  descricao: string;
  api_url: string;
  tipo_limite: 'creditos' | 'quantidade';
  preco_por_consulta: number;
  campos_entrada: CampoEntrada[];
  ativo: boolean;
  manutencao: boolean;
  imagem_url?: string;
  timeout_segundos?: number;
}

export interface CampoEntrada {
  nome: string;
  tipo: 'string' | 'email' | 'number';
  obrigatorio: boolean;
  mascara?: string;
}

export interface Consulta {
  id: number;
  modulo_id: number;
  usuario_id: number;
  data: string;
  input: Record<string, any>;
  retorno_resumido: any;
  status: 'sucesso' | 'falha';
  modulo?: Modulo;
}

export interface Log {
  id: number;
  tipo: 'admin_action' | 'revendedor_action' | 'consulta';
  usuario_id: number;
  acao: string;
  detalhes: any;
  data: string;
  usuario?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
