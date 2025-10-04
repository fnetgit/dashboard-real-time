const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket!");
};

socket.onmessage = (event) => {
    try {
    const data = JSON.parse(event.data);

    document.getElementById("cpu").textContent = data.cpu + "%";
    document.getElementById("memory").textContent = data.memory + "%";
    document.getElementById("disk").textContent = data.disk + "%";
    } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    }
};

socket.onclose = () => {
    console.warn("Conexão com servidor WebSocket fechada.");
};

socket.onerror = (error) => {
    console.error("Erro WebSocket:", error);
};