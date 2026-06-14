import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/logistics-underwriting-web/', // GitHub Pages용 설정은 주석 처리 또는 삭제
})
