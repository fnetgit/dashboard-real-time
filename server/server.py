import asyncio
import websockets
import json
import psutil
import os
from datetime import datetime

HOST = os.getenv('WS_HOST', 'localhost')
PORT = int(os.getenv('WS_PORT', '8080'))
ALLOWED_ORIGINS = os.getenv(
    'ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
UPDATE_INTERVAL = float(os.getenv('UPDATE_INTERVAL', '2'))

psutil.cpu_percent(interval=None)

last_io_stats = psutil.disk_io_counters()

CLIENTS = set()


def get_metrics():
    global last_io_stats

    try:
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
        disk_usage = psutil.disk_usage('/').percent
        current_io_stats = psutil.disk_io_counters()

        read_bytes = current_io_stats.read_bytes - last_io_stats.read_bytes
        write_bytes = current_io_stats.write_bytes - last_io_stats.write_bytes

        read_speed = read_bytes / UPDATE_INTERVAL
        write_speed = write_bytes / UPDATE_INTERVAL

        last_io_stats = current_io_stats

        return {
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "disk": round(disk_usage, 2),
            "disk_read": round(read_speed, 2),  
            "disk_write": round(write_speed, 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f'Erro ao coletar métricas: {e}')
        return {"cpu": 0, "memory": 0, "disk": 0, "disk_read": 0, "disk_write": 0,
                "error": str(e), "timestamp": datetime.now().isoformat()}


async def register_client(websocket):
    client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    print(f'[{datetime.now().strftime("%H:%M:%S")}] Cliente conectado: {client_info}')
    CLIENTS.add(websocket)
    try:
        await websocket.wait_closed()  
    finally:
        CLIENTS.remove(websocket)
        print(
            f'[{datetime.now().strftime("%H:%M:%S")}] Cliente desconectado: {client_info}')


async def broadcast_metrics():
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
