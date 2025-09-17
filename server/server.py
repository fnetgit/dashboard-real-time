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
        print('Client disconnected')
    except Exception as e:
        print(f'Error sending metrics: {e}')


async def main():
    async with websockets.serve(send_metrics, "localhost", 8080):
        print("Server running at ws://localhost:8080")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Critical error: {e}")
