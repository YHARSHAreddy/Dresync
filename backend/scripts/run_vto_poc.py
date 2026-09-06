import os
import sys
import argparse
from typing import List

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.vto.provider import VTORequest
from app.services.vto.replicate_idm import ReplicateIDMProvider
from app.services.vto.fashn import FashnAIProvider

def run_poc():
    print("==================================================")
    print("Phase 3: Virtual Try-On POC Standalone Test")
    print("==================================================\n")

    providers = [ReplicateIDMProvider(), FashnAIProvider()]
    
    # Mock finding real images from storage for POC tests
    user_ref_img = "./uploads/mock_user_profile.jpg"
    shirt_orig_img = "./uploads/mock_shirt_orig.jpg"
    shirt_proc_img = "./uploads/mock_shirt_processed.png"
    pants_orig_img = "./uploads/mock_pants_orig.jpg"

    os.makedirs("./poc_results", exist_ok=True)

    for provider in providers:
        print(f"Testing Provider: {provider.get_capabilities()['name']}")
        print(f"Commercial Status: {provider.get_capabilities()['commercial_use']}\n")

        # Test A1: Shirt (Original)
        print("  Running Test A1: User + Shirt (Original)")
        req_a1 = VTORequest(user_image_path=user_ref_img, garment_image_path=shirt_orig_img, category="tops")
        if provider.validate_inputs(req_a1):
            res_a1 = provider.generate_try_on(req_a1)
            print(f"    Result: {res_a1.success}")
            if not res_a1.success:
                print(f"    Message: {res_a1.error_message}")
        print()

        # Test A2: Shirt (Processed)
        print("  Running Test A2: User + Shirt (Processed/rembg)")
        req_a2 = VTORequest(user_image_path=user_ref_img, garment_image_path=shirt_proc_img, category="tops", is_processed=True)
        if provider.validate_inputs(req_a2):
            res_a2 = provider.generate_try_on(req_a2)
            print(f"    Result: {res_a2.success}")
            if not res_a2.success:
                print(f"    Message: {res_a2.error_message}")
        print()

        # Test B: Pants
        print("  Running Test B: User + Pants")
        if provider.get_capabilities().get("supports_bottoms"):
            req_b = VTORequest(user_image_path=user_ref_img, garment_image_path=pants_orig_img, category="bottoms")
            if provider.validate_inputs(req_b):
                res_b = provider.generate_try_on(req_b)
                print(f"    Result: {res_b.success}")
                if not res_b.success:
                    print(f"    Message: {res_b.error_message}")
        else:
            print("    Skipped: Provider does not officially support bottoms in a reliable way.")
        
        print("\n--------------------------------------------------\n")

if __name__ == "__main__":
    run_poc()
