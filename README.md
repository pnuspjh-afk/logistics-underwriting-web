# 🏗️ Logistics Underwriting Platform

본 프로젝트는 Python 기반의 고도화된 분석 엔진과 React 기반의 현대적인 웹 인터페이스를 통합한 물류 자산 투자 분석 플랫폼입니다.

## 📂 프로젝트 구조
- **backend/**: FastAPI 서버, 분석 엔진 (calculator, reporting, memo, dd)
- **frontend/**: React (Vite) 대시보드 UI

## 🚀 시작하기

### 1. 백엔드 실행 (Python)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*백엔드 서버는 `http://localhost:8000`에서 실행됩니다.*

### 2. 프론트엔드 실행 (React)
```bash
cd frontend
npm install
npm run dev
```
*프론트엔드 접속 주소는 터미널에 표시됩니다 (보통 `http://localhost:5173`).*

## ✨ 주요 기능
- **실시간 UW 시뮬레이션**: 금리, LTV, 공실률 변경에 따른 IRR/DSCR 실시간 산출
- **시나리오 분석**: Base, Downside, Upside 시나리오 자동 비교
- **투자 메모 생성**: 분석 결과를 바탕으로 한 투자 포인트 요약 (Python NLP 엔진)
- **엑셀 리포트 출력**: 상세 수지 및 민감도 분석 결과가 포함된 엑셀 파일 생성
- **다크 모드 대시보드**: 전문 금융 터미널 스타일의 세련된 UI

## 🛠 기술 스택
- **Backend**: Python, FastAPI, Pandas, fpdf2, openpyxl
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React
