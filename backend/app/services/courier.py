from typing import Dict, Any, Optional
import requests
import json
from datetime import datetime

class CourierService:
    def __init__(self, api_key: str, secret_key: str, base_url: str):
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = base_url

    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an order in the courier system."""
        raise NotImplementedError("Each courier implementation must define this.")

    def get_status(self, tracking_id: str) -> str:
        """Get the current status of an order."""
        raise NotImplementedError("Each courier implementation must define this.")

class PathaoCourier(CourierService):
    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        # Simulated API call for Pathao
        # In a real scenario, this would POST to Pathao's API
        print(f"Creating Pathao order for {order_data['order_number']}")
        
        # Simulate success response
        return {
            "success": True,
            "consignment_id": f"PTH-{order_data['order_number']}",
            "tracking_url": f"https://pathao.com/track/{order_data['order_number']}"
        }

    def get_status(self, tracking_id: str) -> str:
        # Simulated status check
        return "In Transit"

class SteadfastCourier(CourierService):
    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        print(f"Creating Steadfast order for {order_data['order_number']}")
        return {
            "success": True,
            "consignment_id": f"SF-{order_data['order_number']}",
            "tracking_url": f"https://steadfast.com.bd/track/{order_data['order_number']}"
        }

    def get_status(self, tracking_id: str) -> str:
        return "Pending Pickup"

# Factory to get the correct courier service
def get_courier_service(provider_name: str) -> CourierService:
    if provider_name.lower() == "pathao":
        return PathaoCourier("API_KEY", "SECRET", "https://api.pathao.com")
    elif provider_name.lower() == "steadfast":
        return SteadfastCourier("API_KEY", "SECRET", "https://portal.steadfast.com.bd/api/v1")
    else:
        raise ValueError(f"Unknown courier provider: {provider_name}")
