export async function downloadStandaloneHtml(): Promise<boolean> {
  try {
    let htmlContent = '';

    if (window.location.protocol !== 'file:') {
      const response = await fetch('/api/download-standalone-html');
      if (response.ok) {
        htmlContent = await response.text();
      }
    }

    if (!htmlContent) {
      // Fallback: serialize the full current document if already running standalone
      htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '덴탈패스_치의예과면접마스터_독립형.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return true;
  } catch (err) {
    console.warn('Failed to download standalone HTML:', err);
    return false;
  }
}
