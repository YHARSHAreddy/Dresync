from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class VTORequest(BaseModel):
    user_image_path: str
    garment_image_path: str
    category: str  # 'tops', 'bottoms', 'dresses'
    is_processed: bool = False

class VTOResult(BaseModel):
    success: bool
    result_image_url: Optional[str] = None
    result_image_path: Optional[str] = None
    error_message: Optional[str] = None
    latency_sec: Optional[float] = None
    cost_estimate: Optional[float] = None
    is_mock: bool = False
    status: str = "completed"

class VirtualTryOnProvider(ABC):
    @abstractmethod
    def validate_inputs(self, request: VTORequest) -> bool:
        """Validates if the inputs are acceptable for this provider."""
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Returns the capabilities of this provider (e.g., supported categories)."""
        pass

    @abstractmethod
    def generate_try_on(self, request: VTORequest) -> VTOResult:
        """Executes the virtual try-on and returns the result."""
        pass
