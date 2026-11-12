/** src/components/shared/WindowControls.tsx — أزرار التحكم في النافذة (تظهر فقط داخل Tauri) */
import { useEffect, useState } from 'react'
import { Minus, Square, X } from 'lucide-react'

export function WindowControls() {
  const [isTauri, setIsTauri] = useState(false)

  useEffect(() => {
    setIsTauri('__TAURI_INTERNALS__' in window)
  }, [])

  async function controlWindow(action: 'minimize' | 'maximize' | 'close'): Promise<void> {
    if (!isTauri) return
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const currentWindow = getCurrentWindow()
      if (action === 'minimize') await currentWindow.minimize()
      if (action === 'maximize') await currentWindow.toggleMaximize()
      if (action === 'close') await currentWindow.close()
    } catch {
      // فشل التحكم في النافذة — بنتجاهله بهدوء في وضع الويب
    }
  }

  if (!isTauri) return null

  return (
    <>
      <button
        className="titlebar-btn w-7 h-7 flex items-center justify-center rounded hover:bg-hover text-muted-f"
        aria-label="Minimize"
        onClick={() => controlWindow('minimize')}
      >
        <Minus className="w-3 h-3" />
      </button>
      <button
        className="titlebar-btn w-7 h-7 flex items-center justify-center rounded hover:bg-hover text-muted-f"
        aria-label="Maximize"
        onClick={() => controlWindow('maximize')}
      >
        <Square className="w-3 h-3" />
      </button>
      <button
        className="titlebar-btn titlebar-close-btn w-7 h-7 flex items-center justify-center rounded text-muted-f transition-colors"
        aria-label="Close"
        onClick={() => controlWindow('close')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </>
  )
}
