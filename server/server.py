import asyncio
import websockets
import json
import psutil

def get_metrics():
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent
    }


async def send_metrics(websocket):
    if websockets.connect:
        print(f'Cliente conectado')
    try:
        while True:
            metrics = get_metrics()
            await websocket.send(json.dumps(metrics))
            await asyncio.sleep(2)
    except websockets.ConnectionClosed:
        print('Cliente desconectado')
    except Exception as e:
        print(f'Erro ao enviar métricas: {e}')


async def main():
    async with websockets.serve(send_metrics, "localhost", 8080, origins=["http://localhost:3000"]):
        print("O servidor está rodando em ws://localhost:8080")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServidor parado pelo usuário")
    except Exception as e:
        print(f"Erro crítico: {e}")