"""
QUANTUM-SHIELD: Event Logger & Alert Module
Logs key generation, Eve activity, QBER metrics, key decisions, and command dispatches.
"""

from datetime import datetime
from typing import List, Dict, Any


class QuantumEventLogger:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []

    def log(self, event_type: str, severity: str, description: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        entry = {
            "id": f"log-{len(self.events) + 1}",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "event_type": event_type,
            "severity": severity,  # INFO, NOTICE, WARNING, ALERT
            "description": description,
            "data": data or {}
        }
        self.events.insert(0, entry)
        if len(self.events) > 200:
            self.events = self.events[:200]
        return entry

    def get_events(self) -> List[Dict[str, Any]]:
        return self.events

    def clear(self):
        self.events = []


logger = QuantumEventLogger()
