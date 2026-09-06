import os
import time
from typing import Dict, Any
from .provider import VirtualTryOnProvider, VTORequest, VTOResult

class FashnAIProvider(VirtualTryOnProvider):
    def __init__(self):
        self.api_key = os.getenv("FASHN_API_KEY")

    def validate_inputs(self, request: VTORequest) -> bool:
        # Fashn API supports tops, bottoms, and one-pieces.
        if request.category not in ["tops", "bottoms", "one-pieces"]:
            print(f"Warning: Fashn.ai expects 'tops', 'bottoms', or 'one-pieces', got {request.category}")
        return True

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "name": "Fashn.ai API",
            "supported_categories": ["tops", "bottoms", "one-pieces"],
            "supports_tops": True,
            "supports_bottoms": True,
            "supports_multi_garment": False, # Typically requires iterative generation
            "license": "Commercial API Agreement",
            "commercial_use": "YES (Production Approved depending on plan)",
            "cost_per_gen": "~$0.02 - $0.05 (estimate depending on tier)"
        }

    def generate_try_on(self, request: VTORequest) -> VTOResult:
        if not self.api_key:
            # For POC, if no API key is provided, mock a successful response
            # by simply returning the garment image as the result image
            # in a real scenario, this would be an error.
            print("MOCKING VTO: No FASHN_API_KEY found, returning mocked successful result.")
            time.sleep(2)  # Simulate network latency
            return VTOResult(
                success=True, 
                result_image_url=request.garment_image_path,
                latency_sec=2.0,
                is_mock=True,
                status="completed"
            )

        try:
            start_time = time.time()
            # headers = {"Authorization": f"Bearer {self.api_key}"}
            # files = {
            #     "model_image": open(request.user_image_path, "rb"),
            #     "garment_image": open(request.garment_image_path, "rb")
            # }
            # data = {"category": request.category} # e.g., 'tops', 'bottoms'
            # response = requests.post("https://api.fashn.ai/v1/run", headers=headers, files=files, data=data)
            latency = time.time() - start_time
            
            return VTOResult(
                success=False,
                error_message="Integration ready. Fashn API call skipped due to missing API key."
            )
        except Exception as e:
            return VTOResult(success=False, error_message=str(e))
