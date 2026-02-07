from typing import Dict, Any, Optional, List
import httpx
import json
import hashlib
import hmac
from datetime import datetime, timedelta
from abc import ABC, abstractmethod

from app.config import settings


class CourierService(ABC):
    """Abstract base class for courier integrations."""

    @abstractmethod
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an order in the courier system."""
        pass

    @abstractmethod
    async def get_status(self, tracking_id: str) -> Dict[str, Any]:
        """Get the current status of an order."""
        pass

    @abstractmethod
    async def get_bulk_status(self, tracking_ids: List[str]) -> List[Dict[str, Any]]:
        """Get status for multiple orders at once."""
        pass

    @abstractmethod
    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """Verify webhook signature from the courier."""
        pass

    @abstractmethod
    def map_status(self, courier_status: str) -> str:
        """Map courier-specific status to internal status."""
        pass


class PathaoCourier(CourierService):
    """Pathao Courier API integration."""

    def __init__(self):
        self.base_url = settings.pathao_base_url
        self.client_id = settings.pathao_client_id
        self.client_secret = settings.pathao_client_secret
        self.webhook_secret = settings.pathao_webhook_secret
        self._access_token = None
        self._token_expiry = None

    async def _get_access_token(self) -> str:
        """Get or refresh access token for Pathao API using client credentials."""
        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token

        async with httpx.AsyncClient() as client:
            # Production uses client_credentials grant type
            response = await client.post(
                f"{self.base_url}/aladdin/api/v1/issue-token",
                json={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials"
                }
            )

            if response.status_code != 200:
                raise Exception(f"Failed to get Pathao access token: {response.text}")

            data = response.json()
            self._access_token = data["access_token"]
            self._token_expiry = datetime.now() + timedelta(seconds=data.get("expires_in", 3600) - 300)
            return self._access_token

    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a delivery order with Pathao."""
        token = await self._get_access_token()

        payload = {
            "store_id": order_data.get("store_id", 1),
            "merchant_order_id": order_data["order_number"],
            "recipient_name": order_data["recipient_name"],
            "recipient_phone": order_data["recipient_phone"],
            "recipient_address": order_data["recipient_address"],
            "recipient_city": self._get_city_id(order_data.get("recipient_city", "Dhaka")),
            "recipient_zone": order_data.get("recipient_zone", 1),
            "recipient_area": order_data.get("recipient_area", 1),
            "delivery_type": 48,  # Normal delivery
            "item_type": 2,  # Parcel
            "special_instruction": order_data.get("notes", ""),
            "item_quantity": order_data.get("item_count", 1),
            "item_weight": order_data.get("weight", 0.5),
            "amount_to_collect": order_data.get("amount_to_collect", 0),
            "item_description": order_data.get("description", "E-commerce order")
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/aladdin/api/v1/orders",
                headers={"Authorization": f"Bearer {token}"},
                json=payload
            )

            if response.status_code not in [200, 201]:
                raise Exception(f"Failed to create Pathao order: {response.text}")

            data = response.json()
            return {
                "success": True,
                "consignment_id": data["data"]["consignment_id"],
                "tracking_url": f"https://merchant.pathao.com/tracking?consignment_id={data['data']['consignment_id']}",
                "delivery_fee": data["data"].get("delivery_fee", 0)
            }

    async def get_status(self, tracking_id: str) -> Dict[str, Any]:
        """Get order status from Pathao."""
        token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/aladdin/api/v1/orders/{tracking_id}",
                headers={"Authorization": f"Bearer {token}"}
            )

            if response.status_code != 200:
                return {"success": False, "status": "unknown", "error": response.text}

            data = response.json()
            order_data = data.get("data", {})
            return {
                "success": True,
                "tracking_id": tracking_id,
                "status": order_data.get("order_status", "unknown"),
                "internal_status": self.map_status(order_data.get("order_status", "")),
                "updated_at": order_data.get("updated_at")
            }

    async def get_bulk_status(self, tracking_ids: List[str]) -> List[Dict[str, Any]]:
        """Get status for multiple orders."""
        results = []
        for tracking_id in tracking_ids:
            result = await self.get_status(tracking_id)
            results.append(result)
        return results

    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """Verify Pathao webhook signature."""
        if not self.webhook_secret:
            return True  # Skip verification if no secret configured

        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)

    def map_status(self, courier_status: str) -> str:
        """Map Pathao status to internal order status."""
        status_map = {
            "Pending": "pending",
            "Pickup Pending": "confirmed",
            "Pickup Assigned": "processing",
            "Picked": "shipped",
            "In Transit": "shipped",
            "At Sorting Hub": "shipped",
            "On Hold": "shipped",
            "Out for Delivery": "shipped",
            "Delivered": "delivered",
            "Partial Delivered": "delivered",
            "Returned": "cancelled",
            "Return In Transit": "cancelled",
            "Return Pending": "cancelled",
            "Exchange": "shipped",
            "Cancelled": "cancelled"
        }
        return status_map.get(courier_status, "pending")

    def _get_city_id(self, city_name: str) -> int:
        """Map city name to Pathao city ID."""
        city_map = {
            "dhaka": 1,
            "chittagong": 2,
            "chattogram": 2,
            "sylhet": 3,
            "rajshahi": 4,
            "khulna": 5,
            "rangpur": 6,
            "barisal": 7,
            "mymensingh": 8
        }
        return city_map.get(city_name.lower(), 1)


class SteadfastCourier(CourierService):
    """Steadfast Courier API integration."""

    def __init__(self):
        self.base_url = settings.steadfast_base_url
        self.api_key = settings.steadfast_api_key
        self.secret_key = settings.steadfast_secret_key
        self.webhook_secret = settings.steadfast_webhook_secret

    def _get_headers(self) -> Dict[str, str]:
        """Get authorization headers for Steadfast API."""
        return {
            "Api-Key": self.api_key,
            "Secret-Key": self.secret_key,
            "Content-Type": "application/json"
        }

    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a delivery order with Steadfast."""
        payload = {
            "invoice": order_data["order_number"],
            "recipient_name": order_data["recipient_name"],
            "recipient_phone": order_data["recipient_phone"],
            "recipient_address": order_data["recipient_address"],
            "cod_amount": order_data.get("amount_to_collect", 0),
            "note": order_data.get("notes", "")
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/create_order",
                headers=self._get_headers(),
                json=payload
            )

            if response.status_code not in [200, 201]:
                raise Exception(f"Failed to create Steadfast order: {response.text}")

            data = response.json()
            if data.get("status") != 200:
                raise Exception(f"Steadfast API error: {data.get('message', 'Unknown error')}")

            consignment = data.get("consignment", {})
            return {
                "success": True,
                "consignment_id": consignment.get("consignment_id"),
                "tracking_url": f"https://steadfast.com.bd/t/{consignment.get('tracking_code')}",
                "tracking_code": consignment.get("tracking_code")
            }

    async def get_status(self, tracking_id: str) -> Dict[str, Any]:
        """Get order status from Steadfast."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/status_by_cid/{tracking_id}",
                headers=self._get_headers()
            )

            if response.status_code != 200:
                return {"success": False, "status": "unknown", "error": response.text}

            data = response.json()
            if data.get("status") != 200:
                return {"success": False, "status": "unknown", "error": data.get("message")}

            delivery_status = data.get("delivery_status", "unknown")
            return {
                "success": True,
                "tracking_id": tracking_id,
                "status": delivery_status,
                "internal_status": self.map_status(delivery_status),
                "updated_at": data.get("updated_at")
            }

    async def get_bulk_status(self, tracking_ids: List[str]) -> List[Dict[str, Any]]:
        """Get status for multiple orders using bulk API."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/status_by_cid_bulk",
                headers=self._get_headers(),
                json={"consignment_ids": tracking_ids}
            )

            if response.status_code != 200:
                # Fallback to individual requests
                results = []
                for tracking_id in tracking_ids:
                    result = await self.get_status(tracking_id)
                    results.append(result)
                return results

            data = response.json()
            results = []
            for item in data.get("data", []):
                results.append({
                    "success": True,
                    "tracking_id": item.get("consignment_id"),
                    "status": item.get("delivery_status"),
                    "internal_status": self.map_status(item.get("delivery_status", ""))
                })
            return results

    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """Verify Steadfast webhook signature."""
        if not self.webhook_secret:
            return True  # Skip verification if no secret configured

        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)

    def map_status(self, courier_status: str) -> str:
        """Map Steadfast status to internal order status."""
        status_map = {
            "pending": "confirmed",
            "in_review": "processing",
            "picked": "shipped",
            "on_the_way": "shipped",
            "delivered": "delivered",
            "partial_delivered": "delivered",
            "cancelled": "cancelled",
            "hold": "shipped",
            "return": "cancelled",
            "returned": "cancelled",
            "unknown": "pending"
        }
        return status_map.get(courier_status.lower(), "pending")


def get_courier_service(provider_name: str) -> CourierService:
    """Factory to get the correct courier service."""
    if provider_name.lower() == "pathao":
        return PathaoCourier()
    elif provider_name.lower() == "steadfast":
        return SteadfastCourier()
    else:
        raise ValueError(f"Unknown courier provider: {provider_name}")


def get_default_courier() -> CourierService:
    """Get the default courier service based on config."""
    return get_courier_service(settings.default_courier)
