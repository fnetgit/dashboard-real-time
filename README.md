# Dashboard de Monitoramento de Sistema em Tempo Real

Este projeto é um dashboard de monitoramento de sistema em tempo real, que exibe métricas de CPU, memória e disco de um servidor. Desenvolvido para a disciplina de Redes de Computadores.

## Funcionalidades

- **Monitoramento em Tempo Real:** Exibe o uso de CPU, memória e disco em tempo real.
- **Visualização Gráfica:** Utiliza Chart.js para apresentar as métricas em gráficos de linha dinâmicos.
- **Indicador de Status de Conexão:** Mostra o estado da conexão WebSocket (conectado/desconectado/erro).
- **Configurações Externalizadas:** Utiliza variáveis de ambiente para configurar o servidor Python e o servidor Node.js.
- **Tratamento de Erros:** Mensagens de erro mais informativas e tentativa de reconexão automática do frontend.

## Tecnologias Utilizadas

- **Backend:** Python (asyncio, websockets, psutil, python-dotenv)
- **Frontend:** HTML5, CSS3, JavaScript (Chart.js, WebSocket API)
- **Servidor Frontend:** Node.js (Express, dotenv)

## Estrutura do Projeto

```
DASHBOARD-REAL-TIME
├── frontend
│   ├── public
│   │   ├── scripts
│   │   │   └── index.js
│   │   ├── styles
│   │   │   └── style.css
│   │   └── index.html
│   ├── .env.example
│   ├── app.js
│   └── package.json
├── server
│   ├── .env.example
│   ├── server.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Como Configurar e Executar

Siga os passos abaixo para configurar e executar o projeto.

### 1. Backend (Servidor Python)

1.  **Navegue até o diretório do servidor:**
    ```bash
    cd server
    ```
2.  **Crie um ambiente virtual (opcional, mas recomendado):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Crie o arquivo `.env`:**
    Copie o `.env.example` para `.env` e ajuste as configurações se necessário.
    ```bash
    cp .env.example .env
    ```
    Conteúdo de `.env` (exemplo):
    ```
    WS_HOST=localhost
    WS_PORT=8080
    ALLOWED_ORIGINS=http://localhost:3000
    UPDATE_INTERVAL=2
    ```
5.  **Execute o servidor Python:**
    ```bash
    python3 server.py
    ```
    O servidor WebSocket será iniciado em `ws://localhost:8080` (ou na porta configurada).

### 2. Frontend (Servidor Node.js)

1.  **Abra um novo terminal e navegue até o diretório do frontend:**
    ```bash
    cd frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Crie o arquivo `.env`:**
    Copie o `.env.example` para `.env` e ajuste as configurações se necessário.
    ```bash
    cp .env.example .env
    ```
    Conteúdo de `.env` (exemplo):
    ```
    PORT=3000
    ```
4.  **Execute o servidor Node.js:**
    ```bash
    npm start
    ```
    O servidor HTTP será iniciado em `http://localhost:3000` (ou na porta configurada).

### 3. Acessar o Dashboard

Abra seu navegador e acesse `http://localhost:3000` (ou a porta configurada para o frontend). Você verá o dashboard com os gráficos de monitoramento em tempo real.

## Equipe

- [Fabricio Fontenele Vieira](https://github.com/Fabricio-Fontenele)
- [Francisco Alves Ribeiro Neto](https://github.com/fnetgit)
- [Gabriel Oliveira Pinto](https://github.com/gaboliveira-alt)
- [Ruan Pedro de Araujo Anjos](https://github.com/oAnjophb)
- [Willamy Josué Santos Serejo](https://github.com/JosueSerejo)
