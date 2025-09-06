import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 5173, // ใช้พอร์ตที่ Render กำหนด หรือพอร์ตเริ่มต้น 5173
    host: '0.0.0.0', // ทำให้แอปสามารถเข้าถึงจากเครือข่ายภายนอกได้
  },
});
