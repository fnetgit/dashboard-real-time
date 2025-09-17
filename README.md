## Dashboard de Monitoramento de Sistema em Tempo Real

Este projeto consiste em um dashboard web para monitorar métricas de um servidor, como uso de CPU, memória e disco, em tempo real. A aplicação atualiza os dados sem a necessidade de recarregar a página, proporcionando uma visualização dinâmica e contínua do sistema.

---

### Funcionalidades

* **Coleta de Dados**: Um servidor Python coleta periodicamente (a cada 1-2 segundos) as métricas do sistema.
* **Comunicação em Tempo Real**: Os dados são enviados proativamente via **WebSocket** para todos os clientes conectados.
* **Visualização Dinâmica**: O frontend (cliente) recebe os dados e atualiza gráficos ou medidores automaticamente.

---

### Tecnologias

O projeto utiliza **Python** no backend para a coleta e o envio de dados. Para a parte visual, o frontend é construído com **JavaScript** e uma biblioteca de gráficos, como o **Chart.js** ou **ApexCharts**.

---

### Desafios e Aprendizados

* Trabalhar com tarefas agendadas no lado do servidor, utilizando `asyncio.sleep` para envio proativo de dados.
* Integrar a comunicação em tempo real via **WebSockets** com bibliotecas de visualização de dados no frontend.

---

### Equipe

* Gabriel Oliveira Pinto

* Fabricio Fontenele Vieira

* Francisco Alves Ribeiro Neto

* Willamy Josue Santos Serejo

* Ruan Pedro de Araujo Anjos