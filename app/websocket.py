import logging
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_address: str):
        await websocket.accept()
        if user_address not in self.active_connections:
            self.active_connections[user_address] = set()
        self.active_connections[user_address].add(websocket)

    def disconnect(self, websocket: WebSocket, user_address: str):
        if user_address not in self.active_connections:
            return
        self.active_connections[user_address].discard(websocket)
        if not self.active_connections[user_address]:
            del self.active_connections[user_address]

    async def send_personal_message(self, message: dict, user_address: str):
        if user_address not in self.active_connections:
            return
        stale_connections: Set[WebSocket] = set()
        for connection in self.active_connections[user_address]:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.error("Failed to send WebSocket message: %s", exc)
                stale_connections.add(connection)
        for connection in stale_connections:
            self.disconnect(connection, user_address)


manager = ConnectionManager()


@router.websocket("/ws/{user_address}")
async def websocket_endpoint(websocket: WebSocket, user_address: str):
    await manager.connect(websocket, user_address)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_address)
