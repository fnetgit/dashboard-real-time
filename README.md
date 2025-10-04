# Dashboard de Monitoramento de Sistema em Tempo Real

## Sobre o Projeto

Este projeto foi desenvolvido como um trabalho para a disciplina de Redes de Computadores.  
O objetivo é criar um **dashboard web** para o monitoramento em tempo real de métricas de um servidor, como uso de **CPU, memória e disco**.  

A aplicação atualiza os dados dinamicamente, sem a necessidade de recarregar a página, proporcionando uma visualização contínua do estado do sistema.  

Um servidor backend em **Python** coleta as métricas do sistema a cada 1-2 segundos e as envia proativamente via **WebSocket** para todos os clientes conectados.  
O frontend, construído com **HTML, CSS e JavaScript**, recebe esses dados e atualiza os gráficos em tempo real, utilizando bibliotecas como **Chart.js** ou **ApexCharts**.

## Como Usar o Projeto

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados:

* **Git**
* **Python 3.8 ou superior**

### Passo 1: Clonar o Repositório

Abra seu terminal, clone o repositório e navegue para o diretório do projeto:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### Passo 2: Criar e Ativar o Ambiente Virtual

É uma boa prática usar ambientes virtuais para isolar as dependências do projeto.  
Os comandos para criar e ativar o ambiente virtual variam entre os sistemas operacionais:

| Ação                | Comando para Linux/macOS     | Comando para Windows (CMD / PowerShell) |
| :------------------ | :--------------------------- | :-------------------------------------- |
| **Criar Ambiente**  | `$ python3 -m venv venv`     | `> python -m venv venv`                 |
| **Ativar Ambiente** | `$ source venv/bin/activate` | `> .\venv\Scripts\activate`             |

Após a ativação, o nome `(venv)` aparecerá no início do seu prompt de comando.

### Passo 3: Instalar as Dependências

Com o ambiente virtual ativado, instale as bibliotecas Python necessárias listadas no arquivo `requirements.txt`:

```bash
pip install -r requirements.txt
```

Para verificar se a instalação foi bem-sucedida, você pode usar o comando:

```bash
pip list
```

### Passo 4: Executar a Aplicação

Com tudo configurado, inicie o servidor backend:

```bash
python server/server.py
```

O terminal exibirá uma mensagem confirmando que o servidor WebSocket foi iniciado.

Em seguida, abra [http://localhost:8080](http://localhost:8080) no seu navegador.

## Tecnologias Utilizadas

* **Python** (coleta de métricas e backend com WebSocket)  
* **WebSocket** (comunicação em tempo real entre servidor e clientes)  
* **HTML5** (estrutura da página do dashboard)  
* **CSS3** (estilização da interface)  
* **JavaScript (ES6+)** (lógica do cliente e atualização dinâmica)  
* **Chart.js** ou **ApexCharts** (gráficos interativos em tempo real)  

## Estrutura do Projeto

```text
.
├── server/
│   └── server.py         # Lógica do servidor WebSocket e coleta de métricas
├── client/
│   ├── index.html        # Estrutura da página do dashboard
│   ├── css/style.css     # Estilos da aplicação
│   └── js/main.js        # Lógica do cliente e atualização dos gráficos
├── requirements.txt      # Dependências Python do projeto
└── README.md             # Este arquivo
```

## Equipe

* [Fabricio Fontenele Vieira](https://github.com/Fabricio-Fontenele)  
* [Francisco Alves Ribeiro Neto](https://github.com/fnetgit)  
* [Gabriel Oliveira Pinto](https://github.com/gaboliveira-alt)  
* [Ruan Pedro de Araujo Anjos](https://github.com/oAnjophb)  
* [Willamy Josué Santos Serejo](https://github.com/JosueSerejo)  
