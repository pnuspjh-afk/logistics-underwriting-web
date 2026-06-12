import calculator

def test_underwriting_logic():
    print("--- [1] 기본 언더라이팅 로직 테스트 ---")
    inputs = {
        "asset_name": "Test Asset",
        "purchase_price": 1000,
        "leasable_area_sqm": 100,
        "annual_rent_per_sqm": 10,
        "vacancy_rate": 0.1,  # 10%
        "opex_ratio": 0.2,    # EGI의 20%
        "annual_capex": 50,
        "ltv": 0.6,
        "interest_rate": 0.05,
        "hold_period_years": 5,
        "exit_cap_rate": 0.05,
        "tenant_concentration": 0.3
    }
    
    # 계산 실행
    res = calculator.run_underwriting(inputs)
    k = res['kpis']
    
    # 1. NOI 확인
    # GRI = 100 * 10 = 1000
    # EGI = 1000 * 0.9 = 900
    # Opex = 900 * 0.2 = 180
    # NOI = 900 - 180 - 50 = 670
    assert k['noi'] == 670.0, f"NOI 오류: {k['noi']}"
    print(f"✅ NOI 계산 일치: {k['noi']}")
    
    # 2. DSCR 확인
    # Loan = 1000 * 0.6 = 600
    # Interest = 600 * 0.05 = 30
    # DSCR = 670 / 30 = 22.33
    assert abs(k['dscr'] - 22.33) < 0.1, f"DSCR 오류: {k['dscr']}"
    print(f"✅ DSCR 계산 일치: {k['dscr']}")
    
    # 3. Score 확인 (0~100 범위)
    score = calculator.calculate_investment_score({"base": res, "downside": res}, inputs)
    assert 0 <= score <= 100, f"Score 범위 이탈: {score}"
    print(f"✅ Score 엔진 정상 작동: {score}")

def test_edge_cases():
    print("\n--- [2] 엣지 케이스 테스트 ---")
    # 금리 0% (무부채)
    inputs_no_debt = {
        "purchase_price": 1000, "leasable_area_sqm": 100, "annual_rent_per_sqm": 10,
        "vacancy_rate": 0, "opex_ratio": 0, "annual_capex": 0, "ltv": 0,
        "interest_rate": 0, "hold_period_years": 5, "exit_cap_rate": 0.05
    }
    res = calculator.run_underwriting(inputs_no_debt)
    assert res['kpis']['dscr'] is None, "무부채 시 DSCR은 None이어야 함"
    print("✅ 무부채(이자 0) 케이스 대응 완료")

if __name__ == "__main__":
    try:
        test_underwriting_logic()
        test_edge_cases()
        print("\n[SUCCESS] 모든 로직 테스트 통과")
    except Exception as e:
        print(f"\n[FAILURE] 테스트 중 오류 발생: {e}")
