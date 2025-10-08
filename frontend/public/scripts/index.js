// Configuração do WebSocket
const WS_URL = "ws://localhost:8080";
const MAX_DATA_POINTS = 20; // Número de pontos a serem exibidos no gráfico

// Referências aos elementos DOM
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const cpuValueElement = document.getElementById("cpu-value");
const memoryValueElement = document.getElementById("memory-value");
const diskValueElement = document.getElementById("disk-value");

// Variáveis para armazenar os gráficos
let cpuChart, memoryChart, diskChart;

// Função para criar um gráfico
function createChart(canvasId, label, color) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: label,
          data: [],
          borderColor: color,
          backgroundColor: color + "20", // Adiciona transparência
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: "easeInOutQuart",
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: {
            size: 14,
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            label: function (context) {
              return context.parsed.y.toFixed(1) + "%";
            },
          },
        },
      },
    },
  });
}

// Função para atualizar o status da conexão
function updateConnectionStatus(connected) {
  if (connected) {
    statusIndicator.className = "status-dot connected";
    statusText.textContent = "Conectado";
  } else {
    statusIndicator.className = "status-dot disconnected";
    statusText.textContent = "Desconectado";
  }
}

// Função para atualizar um gráfico com novos dados
function updateChart(chart, value) {
  const now = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Adiciona o novo ponto
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(value);

  // Remove pontos antigos se exceder o limite
  if (chart.data.labels.length > MAX_DATA_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  // Atualiza o gráfico
  chart.update("none"); // 'none' desabilita animação para melhor performance
}

// Função para obter cor baseada no valor (verde -> amarelo -> vermelho)
function getColorByValue(value) {
  if (value < 50) return "#10b981"; // Verde
  if (value < 80) return "#f59e0b"; // Amarelo
  return "#ef4444"; // Vermelho
}

// Inicialização do WebSocket
const socket = new WebSocket(WS_URL);

socket.onopen = () => {
  console.log("Conectado ao servidor WebSocket!");
  updateConnectionStatus(true);

  // Inicializa os gráficos após a conexão
  cpuChart = createChart("cpuChart", "Uso de CPU", "#3b82f6");
  memoryChart = createChart("memoryChart", "Uso de Memória", "#8b5cf6");
  diskChart = createChart("diskChart", "Uso de Disco", "#ec4899");
};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    // Atualiza os valores numéricos
    cpuValueElement.textContent = data.cpu.toFixed(1) + "%";
    cpuValueElement.style.color = getColorByValue(data.cpu);

    memoryValueElement.textContent = data.memory.toFixed(1) + "%";
    memoryValueElement.style.color = getColorByValue(data.memory);

    diskValueElement.textContent = data.disk.toFixed(1) + "%";
    diskValueElement.style.color = getColorByValue(data.disk);

    // Atualiza os gráficos
    if (cpuChart && memoryChart && diskChart) {
      updateChart(cpuChart, data.cpu);
      updateChart(memoryChart, data.memory);
      updateChart(diskChart, data.disk);
    }
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    // Exibe erro visual para o usuário
    statusText.textContent = "Erro ao processar dados";
    statusIndicator.className = "status-dot error";
  }
};

socket.onclose = () => {
  console.warn("Conexão com servidor WebSocket fechada.");
  updateConnectionStatus(false);

  // Tenta reconectar após 5 segundos
  setTimeout(() => {
    console.log("Tentando reconectar...");
    location.reload();
  }, 5000);
};

socket.onerror = (error) => {
  console.error("Erro WebSocket:", error);
  updateConnectionStatus(false);
  statusText.textContent = "Erro de conexão";
  statusIndicator.className = "status-dot error";
};
