import asyncio
import websockets
import json
import psutil
import os
from datetime import datetime

# Configurações (sem alteração)
HOST = os.getenv('WS_HOST', 'localhost')
PORT = int(os.getenv('WS_PORT', '8080'))
ALLOWED_ORIGINS = os.getenv(
    'ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
UPDATE_INTERVAL = float(os.getenv('UPDATE_INTERVAL', '2'))

# --- Melhorias Iniciais (psutil) ---
psutil.cpu_percent(interval=None)

# --- MUDANÇA 1: Variável global para I/O de Disco ---
# Armazena a última leitura do I/O para calcular a diferença
last_io_stats = psutil.disk_io_counters()

# --- Padrão Produtor/Consumidor ---
CLIENTS = set()


def get_metrics():
    """Coleta as métricas do sistema."""

    # --- MUDANÇA 2: Declarar que vamos usar a variável global ---
    global last_io_stats

    try:
        # Métricas existentes
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
        # Renomeado para clareza
        disk_usage = psutil.disk_usage('/').percent

        # --- MUDANÇA 3: Calcular I/O de Disco (Leitura/Escrita) ---
        current_io_stats = psutil.disk_io_counters()

        # Calcula a diferença em bytes desde a última chamada
        read_bytes = current_io_stats.read_bytes - last_io_stats.read_bytes
        write_bytes = current_io_stats.write_bytes - last_io_stats.write_bytes

        # Calcula a velocidade em bytes por segundo (B/s)
        # Usamos UPDATE_INTERVAL como nosso delta de tempo
        read_speed = read_bytes / UPDATE_INTERVAL
        write_speed = write_bytes / UPDATE_INTERVAL

        # Atualiza a última leitura para a próxima iteração
        last_io_stats = current_io_stats
        # --- Fim da Mudança 3 ---

        # --- MUDANÇA 4: Adicionar os novos dados ao JSON ---
        return {
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "disk": round(disk_usage, 2),  # A % de uso que você já tinha
            "disk_read": round(read_speed, 2),  # NOVO DADO (em B/s)
            "disk_write": round(write_speed, 2),  # NOVO DADO (em B/s)
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f'Erro ao coletar métricas: {e}')
        # Adiciona os novos campos ao retorno de erro também
        return {"cpu": 0, "memory": 0, "disk": 0, "disk_read": 0, "disk_write": 0,
                "error": str(e), "timestamp": datetime.now().isoformat()}


async def register_client(websocket):
    """Registra um novo cliente e o mantém na conexão."""
    client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    print(f'[{datetime.now().strftime("%H:%M:%S")}] Cliente conectado: {client_info}')
    CLIENTS.add(websocket)
    try:
        await websocket.wait_closed()  # Mantém a conexão aberta
    finally:
        CLIENTS.remove(websocket)
        print(
            f'[{datetime.now().strftime("%H:%M:%S")}] Cliente desconectado: {client_info}')


async def broadcast_metrics():
    """(Produtor) Coleta e envia métricas para todos os clientes."""
    # (Esta função não precisa de NENHUMA alteração)
    while True:
        await asyncio.sleep(UPDATE_INTERVAL)

        if CLIENTS:
            metrics = get_metrics()
            message = json.dumps(metrics)

            tasks = [ws.send(message) for ws in CLIENTS]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for ws, result in zip(list(CLIENTS), results):
                if isinstance(result, Exception):
                    print(f"Erro ao enviar para {ws.remote_address}: {result}")


async def main():
    """Inicializa o servidor WebSocket e o loop de broadcast."""
    # (Esta função não precisa de NENHUMA alteração)
    print_server_info()

    try:
        broadcast_task = asyncio.create_task(broadcast_metrics())

        async with websockets.serve(
            register_client,
            HOST,
            PORT,
            origins=ALLOWED_ORIGINS,
            ping_interval=20,
            ping_timeout=10
        ):
            await asyncio.Future()

    except OSError as e:
        print(
            f"Erro ao iniciar servidor: {e} (A porta {PORT} já está em uso?)")
    except Exception as e:
        print(f"Erro crítico: {e}")
    finally:
        if 'broadcast_task' in locals():
            broadcast_task.cancel()


def print_server_info():
    # (Esta função não precisa de NENHUMA alteração)
    print("=" * 60)
    print(f"Servidor WebSocket iniciado")
    print(f"Endereço: ws://{HOST}:{PORT}")
    print(f"Origens permitidas: {', '.join(ALLOWED_ORIGINS)}")
    print(f"Intervalo de atualização: {UPDATE_INTERVAL}s")
    print("=" * 60)
    print("Aguardando conexões...\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nServidor parado pelo usuário")
