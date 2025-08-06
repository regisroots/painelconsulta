--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_consultas_status; Type: TYPE; Schema: public; Owner: painelconsulta
--

CREATE TYPE public.enum_consultas_status AS ENUM (
    'sucesso',
    'falha'
);


ALTER TYPE public.enum_consultas_status OWNER TO painelconsulta;

--
-- Name: enum_logs_tipo; Type: TYPE; Schema: public; Owner: painelconsulta
--

CREATE TYPE public.enum_logs_tipo AS ENUM (
    'admin_action',
    'revendedor_action',
    'consulta'
);


ALTER TYPE public.enum_logs_tipo OWNER TO painelconsulta;

--
-- Name: enum_modulos_tipo_limite; Type: TYPE; Schema: public; Owner: painelconsulta
--

CREATE TYPE public.enum_modulos_tipo_limite AS ENUM (
    'creditos',
    'quantidade'
);


ALTER TYPE public.enum_modulos_tipo_limite OWNER TO painelconsulta;

--
-- Name: enum_users_tipo; Type: TYPE; Schema: public; Owner: painelconsulta
--

CREATE TYPE public.enum_users_tipo AS ENUM (
    'admin',
    'revendedor',
    'usuario'
);


ALTER TYPE public.enum_users_tipo OWNER TO painelconsulta;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: consultas; Type: TABLE; Schema: public; Owner: painelconsulta
--

CREATE TABLE public.consultas (
    id integer NOT NULL,
    modulo_id integer NOT NULL,
    usuario_id integer NOT NULL,
    data timestamp with time zone NOT NULL,
    input json NOT NULL,
    retorno_resumido json,
    status public.enum_consultas_status NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.consultas OWNER TO painelconsulta;

--
-- Name: consultas_id_seq; Type: SEQUENCE; Schema: public; Owner: painelconsulta
--

CREATE SEQUENCE public.consultas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.consultas_id_seq OWNER TO painelconsulta;

--
-- Name: consultas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: painelconsulta
--

ALTER SEQUENCE public.consultas_id_seq OWNED BY public.consultas.id;


--
-- Name: logs; Type: TABLE; Schema: public; Owner: painelconsulta
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    tipo public.enum_logs_tipo NOT NULL,
    usuario_id integer,
    acao character varying(255) NOT NULL,
    detalhes json,
    data timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.logs OWNER TO painelconsulta;

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: painelconsulta
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_id_seq OWNER TO painelconsulta;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: painelconsulta
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: modulos; Type: TABLE; Schema: public; Owner: painelconsulta
--

CREATE TABLE public.modulos (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    tipo_limite public.enum_modulos_tipo_limite DEFAULT 'creditos'::public.enum_modulos_tipo_limite NOT NULL,
    preco_por_consulta numeric(10,2),
    api_url character varying(255) NOT NULL,
    campos_entrada json DEFAULT '[]'::json NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    manutencao boolean DEFAULT false,
    imagem_url character varying(255),
    timeout_segundos integer DEFAULT 30 NOT NULL
);


ALTER TABLE public.modulos OWNER TO painelconsulta;

--
-- Name: modulos_id_seq; Type: SEQUENCE; Schema: public; Owner: painelconsulta
--

CREATE SEQUENCE public.modulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.modulos_id_seq OWNER TO painelconsulta;

--
-- Name: modulos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: painelconsulta
--

ALTER SEQUENCE public.modulos_id_seq OWNED BY public.modulos.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: painelconsulta
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    tipo public.enum_users_tipo DEFAULT 'usuario'::public.enum_users_tipo NOT NULL,
    dias_ativos integer DEFAULT 0 NOT NULL,
    data_criacao timestamp with time zone NOT NULL,
    data_expiracao timestamp with time zone,
    ativo boolean DEFAULT true NOT NULL,
    banido boolean DEFAULT false NOT NULL,
    motivo_banimento text,
    creditos integer DEFAULT 0 NOT NULL,
    modulos json DEFAULT '{}'::json NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO painelconsulta;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: painelconsulta
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO painelconsulta;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: painelconsulta
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: consultas id; Type: DEFAULT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.consultas ALTER COLUMN id SET DEFAULT nextval('public.consultas_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: modulos id; Type: DEFAULT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.modulos ALTER COLUMN id SET DEFAULT nextval('public.modulos_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: consultas; Type: TABLE DATA; Schema: public; Owner: painelconsulta
--

COPY public.consultas (id, modulo_id, usuario_id, data, input, retorno_resumido, status, "updatedAt") FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: painelconsulta
--

COPY public.logs (id, tipo, usuario_id, acao, detalhes, data, "updatedAt") FROM stdin;
1	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 05:42:34.025+00	2025-08-06 05:42:34.026+00
2	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 05:47:22.224+00	2025-08-06 05:47:22.224+00
3	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 06:57:35.928+00	2025-08-06 06:57:35.929+00
4	consulta	1	Consulta Consulta CPF	{"modulo_id":1,"input":{"cpf":"04119989194"},"status":"sucesso"}	2025-08-06 06:57:49.391+00	2025-08-06 06:57:49.391+00
5	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:11:50.294+00	2025-08-06 08:11:50.295+00
6	admin_action	1	Timeout do módulo atualizado	{"modulo_id":"1","timeout_segundos":45}	2025-08-06 08:13:35.13+00	2025-08-06 08:13:35.13+00
7	consulta	1	Erro na consulta	{"modulo_id":3,"erro":"Limite de consultas excedido para este módulo"}	2025-08-06 08:19:50.161+00	2025-08-06 08:19:50.162+00
12	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:32:56.264+00	2025-08-06 08:32:56.265+00
13	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:40:55.224+00	2025-08-06 08:40:55.224+00
14	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:44:15.28+00	2025-08-06 08:44:15.28+00
15	admin_action	1	Usuário criado	{"email":"test@example.com","tipo":"usuario","dias_ativos":0,"creditos":100}	2025-08-06 08:44:15.39+00	2025-08-06 08:44:15.39+00
16	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:44:16.804+00	2025-08-06 08:44:16.804+00
17	admin_action	1	Módulo criado	{"modulo_id":4,"nome":"Test Module","api_url":"https://api.test.com"}	2025-08-06 08:44:16.827+00	2025-08-06 08:44:16.827+00
18	admin_action	1	Timeout do módulo atualizado	{"modulo_id":"4","timeout_segundos":35}	2025-08-06 08:46:40.508+00	2025-08-06 08:46:40.508+00
19	admin_action	1	Módulo criado	{"modulo_id":5,"nome":"Test API Module","api_url":"https://jsonplaceholder.typicode.com/posts/1"}	2025-08-06 08:48:10.68+00	2025-08-06 08:48:10.68+00
20	admin_action	1	Login	{"email":"admin@painelconsulta.com"}	2025-08-06 08:50:17.32+00	2025-08-06 08:50:17.321+00
21	admin_action	1	Usuário criado	{"email":"eita@vidabela.com","tipo":"usuario","dias_ativos":30,"creditos":0}	2025-08-06 09:02:07.947+00	2025-08-06 09:02:07.947+00
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: painelconsulta
--

COPY public.modulos (id, nome, descricao, ativo, tipo_limite, preco_por_consulta, api_url, campos_entrada, "createdAt", "updatedAt", manutencao, imagem_url, timeout_segundos) FROM stdin;
3	Consulta CEP	Consulta endereço por CEP	t	quantidade	0.50	https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=cep&Info=12289365	[{"nome":"cep","tipo":"string","obrigatorio":true,"mascara":"00000-000"}]	2025-08-06 05:37:16.996+00	2025-08-06 05:37:16.996+00	f	\N	30
1	Consulta CPF	Consulta dados por CPF	t	creditos	1.00	https://jsonplaceholder.typicode.com/users/1	[{"nome":"cpf","tipo":"string","obrigatorio":true,"mascara":"000.000.000-00"}]	2025-08-06 05:37:16.996+00	2025-08-06 08:13:35.127+00	f	\N	45
2	Consulta CNPJ	Consulta dados por CNPJ	t	creditos	2.00	https://jsonplaceholder.typicode.com/users/2	[{"nome":"cnpj","tipo":"string","obrigatorio":true,"mascara":"00.000.000/0000-00"}]	2025-08-06 05:37:16.996+00	2025-08-06 08:21:14.674+00	f	\N	60
4	Test Module	Test Description	t	creditos	5.00	https://api.test.com	[]	2025-08-06 08:44:16.826+00	2025-08-06 08:46:40.505+00	f	\N	35
5	Test API Module	API de teste para demonstração	t	creditos	3.00	https://jsonplaceholder.typicode.com/posts/1	[]	2025-08-06 08:48:10.679+00	2025-08-06 08:48:10.679+00	f	\N	30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: painelconsulta
--

COPY public.users (id, nome, email, senha_hash, tipo, dias_ativos, data_criacao, data_expiracao, ativo, banido, motivo_banimento, creditos, modulos, "updatedAt") FROM stdin;
1	Administrador	admin@painelconsulta.com	$2b$10$DpMtGISQ0HP8p5/ZJ.SbS./GnRj1oTJnKbKZdCyQgWyEaz1LASyva	admin	0	2025-08-06 05:37:16.985+00	\N	t	f	\N	1000	{}	2025-08-06 05:37:16.986+00
2	Test User	test@example.com	$2b$10$DBnhbe/XQvVYfZV4S1Gqf.1AkCAgmmWgDTP2L3oUfaeivPYMhkTBq	usuario	0	2025-08-06 08:44:15.386+00	\N	t	f	\N	100	{}	2025-08-06 08:44:15.386+00
3	eita	eita@vidabela.com	$2b$10$4JEAAx7hRPqbFLAmZRFOQeuInk.WP1DyPoPD1S2rhWuW8diUubsEC	usuario	30	2025-08-06 09:02:07.944+00	2025-09-05 09:02:07.944+00	t	f	\N	0	{}	2025-08-06 09:02:07.944+00
\.


--
-- Name: consultas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: painelconsulta
--

SELECT pg_catalog.setval('public.consultas_id_seq', 2, true);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: painelconsulta
--

SELECT pg_catalog.setval('public.logs_id_seq', 21, true);


--
-- Name: modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: painelconsulta
--

SELECT pg_catalog.setval('public.modulos_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: painelconsulta
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: consultas consultas_pkey; Type: CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT consultas_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: consultas consultas_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT consultas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultas consultas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT consultas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logs logs_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: painelconsulta
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

