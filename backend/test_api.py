import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_analyze():
    payload = {
        "inputs": {
            "asset_name": "Test Asset",
            "location": "Seoul",
            "purchase_price": 50000000000,
            "leasable_area_sqm": 20000,
            "annual_rent_per_sqm": 120000,
            "vacancy_rate": 0.05,
            "opex_ratio": 0.2,
            "annual_capex": 200000000,
            "ltv": 0.6,
            "interest_rate": 0.045,
            "hold_period_years": 5,
            "exit_cap_rate": 0.055,
            "tenant_concentration": 0.3
        }
    }
    try:
        response = requests.post(f"{BASE_URL}/analyze", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Analyze Success!")
            print(f"Base IRR: {data['results']['base']['kpis']['equity_irr']*100:.2f}%")
            print(f"Memo Summary Length: {len(data['memo']['summary'])}")
        else:
            print(f"Analyze Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Analyze Request Failed: {e}")

if __name__ == "__main__":
    print("Backend API Test Script")
    print("Note: Ensure the FastAPI server is running before executing this script.")
    test_health()
    # test_analyze() # Uncomment to run when server is up
