import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/logistics-underwriting-web/', // 저장소 이름과 정확히 일치시킴
})
