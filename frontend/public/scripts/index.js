// Configuração do WebSocket
const WS_URL = `ws://${window.location.hostname}:8080`;
const MAX_DATA_POINTS = 30; // 30 pontos (60 segundos de histórico)
const RECONNECT_DELAY = 5000; // 5 segundos

// Referências aos elementos DOM
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const cpuValueElement = document.getElementById("cpu-value");
const memoryValueElement = document.getElementById("memory-value");
const diskValueElement = document.getElementById("disk-value");
const diskReadValueElement = document.getElementById("disk-read-value");
const diskWriteValueElement = document.getElementById("disk-write-value");

// Variáveis para armazenar os gráficos
let cpuChart, memoryChart, diskChart;

// Função para formatar Bytes
function formatBytes(bytesPerSecond) {
  if (bytesPerSecond === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  if (bytesPerSecond < 1) {
    return bytesPerSecond.toFixed(1) + " B/s";
  }
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Rótulos Estáticos Visíveis
const visibleIndexes = {
  0: "-60s",
  7: "-45s",
  15: "-30s",
  22: "-15s",
  29: "Agora",
};

// Função para criar gráficos PADRÃO (CPU e Memória)
function createChart(canvasId, label, color) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 150);
  gradient.addColorStop(0, color + "90");
  gradient.addColorStop(1, color + "00");

  const initialLabels = new Array(MAX_DATA_POINTS).fill(null);
  const initialData = new Array(MAX_DATA_POINTS).fill(null);

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: initialLabels,
      datasets: [
        {
          label: label,
          data: initialData,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: (context) => {
            if (context.raw === null) return 0;
            return visibleIndexes.hasOwnProperty(context.dataIndex) ? 3 : 0;
          },
          pointBorderWidth: (context) => {
            if (context.raw === null) return 0;
            return visibleIndexes.hasOwnProperty(context.dataIndex) ? 2 : 0;
          },
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750 },
      scales: {
        y: { // Eixo Y Padrão (0-100%)
          beginAtZero: true,
          max: 100,
          ticks: { callback: (value) => value + "%" },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        x: { // Eixo X Estático
          grid: { display: false },
          ticks: {
            color: "#B0B0B0",
            maxRotation: 0,
            autoSkip: false,
            callback: (value, index) => visibleIndexes[index] || null,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          filter: (item) => item.raw !== null,
          intersect: false,
          mode: "index",
          callbacks: {
            label: (context) =>
              context.dataset.label + ": " + context.parsed.y.toFixed(1) + "%",
            title: (context) => context[0].label,
          },
        },
      },
    },
  });
}

// --- NOVO: Função específica para o Gráfico de Disco (Leitura/Escrita) ---
function createDiskChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  
  const initialLabels = new Array(MAX_DATA_POINTS).fill(null);
  const initialDataRead = new Array(MAX_DATA_POINTS).fill(null);
  const initialDataWrite = new Array(MAX_DATA_POINTS).fill(null);

  // Cores estáticas para Leitura (Azul) e Escrita (Rosa)
  const readColor = "#3b82f6";
  const writeColor = "#ec4899";

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: initialLabels,
      datasets: [
        {
          label: "Leitura",
          data: initialDataRead,
          borderColor: readColor,
          backgroundColor: readColor + "90",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0, // Pontos zerados para um visual mais limpo
          pointHoverRadius: 6,
          pointBackgroundColor: readColor,
          pointBorderColor: "#fff",
        },
        {
          label: "Escrita",
          data: initialDataWrite,
          borderColor: writeColor,
          backgroundColor: writeColor + "90",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: writeColor,
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750 },
      scales: {
        y: { // Eixo Y Dinâmico (B/s, KB/s, etc.)
          beginAtZero: true,
          ticks: {
            callback: (value) => formatBytes(value), // Usa nossa função
          },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        x: { // Eixo X Estático
          grid: { display: false },
          ticks: {
            color: "#B0B0B0",
            maxRotation: 0,
            autoSkip: false,
            callback: (value, index) => visibleIndexes[index] || null,
          },
        },
      },
      plugins: {
        legend: { // Ativa a legenda para R/W
          display: true, 
          position: 'top',
          align: 'end',
          labels: { boxWidth: 12, padding: 15 } 
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          filter: (item) => item.raw !== null,
          intersect: false,
          mode: "index",
          callbacks: {
            label: (context) => // Formata o tooltip para B/s
              context.dataset.label + ": " + formatBytes(context.parsed.y),
            title: (context) => context[0].label,
          },
        },
      },
    },
  });
}
// --- FIM DA NOVA FUNÇÃO ---

// Função para atualizar gráficos PADRÃO (CPU e Memória)
function updateChart(chart, value, newColor) {
  const now = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > MAX_DATA_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.data.datasets[0].borderColor = newColor;
  chart.data.datasets[0].pointBackgroundColor = newColor;
  const gradient = chart.ctx.createLinearGradient(0, 0, 0, 150);
  gradient.addColorStop(0, newColor + "90");
  gradient.addColorStop(1, newColor + "00");
  chart.data.datasets[0].backgroundColor = gradient;
  chart.update("none");
}

// --- NOVO: Função para atualizar o gráfico de Disco ---
function updateDiskChart(chart, readValue, writeValue) {
   const now = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Adiciona dados
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(readValue);  // Dataset 0: Leitura
  chart.data.datasets[1].data.push(writeValue); // Dataset 1: Escrita

  // Remove dados antigos
  if (chart.data.labels.length > MAX_DATA_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update("none");
}
// --- FIM DA NOVA FUNÇÃO ---


// Função para obter cor baseada no valor (usada pela CPU, Memória e % Disco)
function getColorByValue(value) {
  if (value < 50) return "#10b981"; // Verde
  if (value < 80) return "#f59e0b"; // Amarelo
  return "#ef4444"; // Vermelho
}

// Função para atualizar o status da conexão
function updateConnectionStatus(connected) {
  if (connected) {
    statusIndicator.className = "status-dot connected";
    statusText.textContent = "Conectado";
  } else {
    statusIndicator.className = "status-dot disconnected";
    statusText.textContent = "Desconectado";
    if (diskReadValueElement) diskReadValueElement.textContent = "---";
    if (diskWriteValueElement) diskWriteValueElement.textContent = "---";
  }
}

// --- Lógica de Conexão e Reconexão ---
function connect() {
  console.log("Tentando conectar ao WebSocket...");
  updateConnectionStatus(false);
  statusText.textContent = "Conectando...";

  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket!");
    updateConnectionStatus(true);

    if (!cpuChart) {
      // Cria gráficos de CPU e Memória
      cpuChart = createChart("cpuChart", "Uso de CPU", getColorByValue(0));
      memoryChart = createChart("memoryChart", "Uso de Memória", getColorByValue(0));
      
      // --- MUDANÇA: Usa a nova função para o gráfico de Disco ---
      diskChart = createDiskChart("diskChart");
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Atualiza textos de CPU e Memória
      cpuValueElement.textContent = data.cpu.toFixed(1) + "%";
      cpuValueElement.style.color = getColorByValue(data.cpu);
      memoryValueElement.textContent = data.memory.toFixed(1) + "%";
      memoryValueElement.style.color = getColorByValue(data.memory);

      // Atualiza textos de Disco (% de Uso)
      diskValueElement.textContent = data.disk.toFixed(1) + "%";
      diskValueElement.style.color = getColorByValue(data.disk);

      // Atualiza textos de Disco (Leitura/Escrita)
      if (diskReadValueElement) {
        diskReadValueElement.textContent = formatBytes(data.disk_read);
      }
      if (diskWriteValueElement) {
        diskWriteValueElement.textContent = formatBytes(data.disk_write);
      }

      // Atualiza os gráficos
      if (cpuChart && memoryChart && diskChart) {
        // Gráficos de CPU e Memória (com % e cor dinâmica)
        updateChart(cpuChart, data.cpu, getColorByValue(data.cpu));
        updateChart(memoryChart, data.memory, getColorByValue(data.memory));
        
        // --- MUDANÇA: Usa a nova função para o gráfico de Disco ---
        // Alimenta o gráfico com dados de Leitura e Escrita
        updateDiskChart(diskChart, data.disk_read, data.disk_write);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      statusText.textContent = "Erro ao processar dados";
      statusIndicator.className = "status-dot error";
    }
  };

  socket.onclose = () => {
    console.warn("Conexão com servidor WebSocket fechada.");
    updateConnectionStatus(false);
    setTimeout(connect, RECONNECT_DELAY);
  };

  socket.onerror = (error) => {
    console.error("Erro WebSocket:", error);
    updateConnectionStatus(false);
    statusText.textContent = "Erro de conexão";
    statusIndicator.className = "status-dot error";
  };
}

// Inicia a primeira tentativa de conexão
connect();

// Atualiza o ano no rodapé
document.getElementById("current-year-footer").textContent =
  new Date().getFullYear();