/** src/main.tsx — نقطة دخول التطبيق (بديل app.vue في Nuxt) */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// خطوط Inter / Cairo / JetBrains Mono — نفس خطوط المشروع الأصلي
import '@fontsource-variable/inter'
import '@fontsource-variable/cairo'
import '@fontsource-variable/jetbrains-mono'

import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
