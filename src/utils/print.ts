/**
 * src/utils/print.ts — محرك طباعة الفواتير (بديل print-js بنفس العقد).
 * بيفتح iframe مخفي، بينسخ قالب الطباعة من الـ DOM جواه بكل الستايلات، وبينادي
 * print() على نافذة الـ iframe — من غير ما يأثر على صفحة التطبيق نفسها.
 */

/** طباعة عنصر من الـ DOM (byId) بقالبه وستايلاته الكاملة */
export function printElementById(elementId: string, documentTitle: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  // نسخ ستايلات الصفحة عشان القالب ياخد نفس الخطوط والألوان المحسوبة
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(node => node.outerHTML)
    .join('\n')

  iframeDoc.open()
  iframeDoc.write(`<!doctype html>
<html><head>
<meta charset="utf-8">
<title>${documentTitle}</title>
${styles}
<style>
  html, body { margin: 0; padding: 0; background: white; }
  .print-anchor { position: static !important; inset-inline-start: auto !important; width: 100% !important; }
</style>
</head><body>${element.outerHTML}</body></html>`)
  iframeDoc.close()

  const cleanup = (): void => {
    window.setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 500)
  }

  const contentWindow = iframe.contentWindow
  if (contentWindow) {
    contentWindow.onafterprint = cleanup
    // إعطاء لحظة للـ resources (خطوط) قبل الطباعة
    contentWindow.focus()
    window.setTimeout(() => {
      contentWindow.print()
      cleanup()
    }, 300)
  } else {
    cleanup()
  }
}
