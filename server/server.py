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
    try:
        while True:
            metrics = get_metrics()
            await websocket.send(json.dumps(metrics))
            await asyncio.sleep(2)
    except websocket.ConnectionClosed:
        print('Cliente desconectado')
    except Exception as e:
        print(f'erro no envio de metricas{e}')


async def main():
    async with websockets.serve(send_metrics, "localhost", 8080):
        print(" Servidor rodando em ws://localhost:8080")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n Servidor encerrado pelo usuário")
    except Exception as e:
        print(f" Erro crítico: {e}")
