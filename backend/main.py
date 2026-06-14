from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import calculator
import reporting_engine
import memo_engine
import dd_engine
import pandas as pd
import io
from fastapi.responses import StreamingResponse

app = FastAPI(title="Logistics Underwriting API")

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UWInputs(BaseModel):
    asset_name: str = "New Project"
    location: str = "Gyeonggi"
    purchase_price: float
    leasable_area_sqm: float
    annual_rent_per_sqm: float
    vacancy_rate: float = 0.05
    opex_ratio: float = 0.20
    annual_capex: float = 0.0
    ltv: float = 0.60
    interest_rate: float = 0.045
    hold_period_years: int = 5
    exit_cap_rate: float = 0.055
    tenant_concentration: float = 0.30
    property_tax_ratio: Optional[float] = 0.15 / 100
    opex_per_sqm: Optional[float] = 3000
    other_opex_ratio: Optional[float] = 0.02

class ScenarioParams(BaseModel):
    vacancy_rate: Optional[float] = 0.0
    annual_rent_per_sqm: Optional[float] = 0.0
    interest_rate: Optional[float] = 0.0
    exit_cap_rate: Optional[float] = 0.0

class AnalysisRequest(BaseModel):
    inputs: UWInputs
    scenarios: Optional[Dict[str, ScenarioParams]] = None

@app.get("/")
def read_root():
    return {"message": "Logistics Underwriting API is running"}

def _get_full_analysis_data(inputs_dict):
    # 기본 시나리오 설정
    scenario_map = {
        "downside": {"vacancy_rate": 0.05, "interest_rate": 0.01},
        "upside": {"exit_cap_rate": -0.005},
        "stress": {"vacancy_rate": 0.1, "interest_rate": 0.02, "exit_cap_rate": 0.01}
    }
    results = calculator.run_underwriting_for_scenarios(inputs_dict, scenario_map)
    
    # 1D 민감도 (공실률)
    v_steps = [v / 100 for v in range(0, 21, 2)]
    sens_data = []
    for v in v_steps:
        res = calculator.run_underwriting({**inputs_dict, "vacancy_rate": v})
        sens_data.append({
            "공실률 (%)": f"{v*100:.0f}%", 
            "NOI (억원)": res['kpis']['noi']/1e8,
            "IRR (%)": res['kpis']['equity_irr']
        })
    sens_df = pd.DataFrame(sens_data)
    
    # 2D 민감도 (공실률 vs 매각캡)
    v_steps_2d = [v / 100 for v in range(0, 11, 2)]
    cap_offsets = [-0.01, -0.005, 0.0, 0.005, 0.01]
    matrix_data = []
    for v in v_steps_2d:
        row = {r"공실률 \ 매각캡": f"{v*100:.0f}%"}
        for offset in cap_offsets:
            target_cap = inputs_dict['exit_cap_rate'] + offset
            res = calculator.run_underwriting({**inputs_dict, "vacancy_rate": v, "exit_cap_rate": max(0.001, target_cap)})
            irr = res['kpis']['equity_irr']
            row[f"{target_cap*100:.1f}%"] = f"{irr*100:.2f}%" if irr is not None else "N/A"
        matrix_data.append(row)
    matrix_df = pd.DataFrame(matrix_data)
    
    return results, sens_df, matrix_df

@app.post("/analyze")
def analyze(request: AnalysisRequest):
    try:
        inputs_dict = request.inputs.dict()
        results, sens_df, matrix_df = _get_full_analysis_data(inputs_dict)
        
        memo = memo_engine.generate_investment_memo(results, inputs_dict)
        dd = dd_engine.generate_dd_checklist(results, inputs_dict)
        
        return {
            "results": results,
            "memo": memo,
            "dd_checklist": dd,
            "sensitivity": {
                "1d": sens_df.to_dict(orient="records"),
                "2d": matrix_df.to_dict(orient="records")
            }
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export/excel")
def export_excel(request: AnalysisRequest):
    try:
        inputs_dict = request.inputs.dict()
        results, sens_df, matrix_df = _get_full_analysis_data(inputs_dict)
        excel_data = reporting_engine.get_excel_data(inputs_dict, results, results['base'], sens_df, matrix_df)
        
        return StreamingResponse(
            io.BytesIO(excel_data),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=UW_{request.inputs.asset_name}.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export/pdf")
def export_pdf(request: AnalysisRequest):
    try:
        inputs_dict = request.inputs.dict()
        results, _, _ = _get_full_analysis_data(inputs_dict)
        pdf_data = reporting_engine.get_pdf_data(inputs_dict, results, results['base'])
        
        return StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Report_{request.inputs.asset_name}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
