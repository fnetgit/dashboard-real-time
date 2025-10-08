import asyncio
import websockets
import json
import psutil
import os
from datetime import datetime

# Configurações do servidor (podem ser externalizadas via variáveis de ambiente)
HOST = os.getenv('WS_HOST', 'localhost')
PORT = int(os.getenv('WS_PORT', '8080'))
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
UPDATE_INTERVAL = float(os.getenv('UPDATE_INTERVAL', '2'))  # segundos

def get_metrics():
    """
    Coleta as métricas do sistema usando psutil.
    
    Returns:
        dict: Dicionário com as métricas de CPU, memória e disco.
    """
    try:
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent
        
        return {
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "disk": round(disk, 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f'Erro ao coletar métricas: {e}')
        return {
            "cpu": 0,
            "memory": 0,
            "disk": 0,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


async def send_metrics(websocket):
    """
    Envia métricas periodicamente para um cliente WebSocket conectado.
    
    Args:
        websocket: Conexão WebSocket do cliente.
    """
    client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    print(f'[{datetime.now().strftime("%H:%M:%S")}] Cliente conectado: {client_info}')
    
    try:
        while True:
            metrics = get_metrics()
            await websocket.send(json.dumps(metrics))
            await asyncio.sleep(UPDATE_INTERVAL)
    except websockets.ConnectionClosed:
        print(f'[{datetime.now().strftime("%H:%M:%S")}] Cliente desconectado: {client_info}')
    except Exception as e:
        print(f'[{datetime.now().strftime("%H:%M:%S")}] Erro ao enviar métricas para {client_info}: {e}')


async def main():
    """
    Inicializa o servidor WebSocket.
    """
    try:
        async with websockets.serve(
            send_metrics, 
            HOST, 
            PORT, 
            origins=ALLOWED_ORIGINS,
            ping_interval=20,
            ping_timeout=10
        ):
            print("=" * 60)
            print(f"Servidor WebSocket iniciado")
            print(f"Endereço: ws://{HOST}:{PORT}")
            print(f"Origens permitidas: {', '.join(ALLOWED_ORIGINS)}")
            print(f"Intervalo de atualização: {UPDATE_INTERVAL}s")
            print("=" * 60)
            print("Aguardando conexões...\n")
            
            await asyncio.Future()  # Mantém o servidor rodando
    except OSError as e:
        print(f"Erro ao iniciar servidor: {e}")
        print(f"Verifique se a porta {PORT} já está em uso.")
    except Exception as e:
        print(f"Erro crítico: {e}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nServidor parado pelo usuário")
    except Exception as e:
        print(f"Erro crítico: {e}")
