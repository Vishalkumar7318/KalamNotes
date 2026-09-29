import html2canvas from 'html2canvas';

export async function downloadPageAsImage(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Hide controls marked no-print during capture
    const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
    noPrintElements.forEach((el) => {
      el.style.visibility = 'hidden';
    });

    // Capture with high fidelity & proper width for crisp mobile/desktop exports
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina display quality)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#faf8f5',
      logging: false,
      windowWidth: Math.max(document.documentElement.clientWidth, 1024),
    });

    // Restore controls
    noPrintElements.forEach((el) => {
      el.style.visibility = '';
    });

    const cleanFilename = (filename || 'handwritten-notes')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_');

    const link = document.createElement('a');
    link.download = `${cleanFilename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export page as image:', error);
    return false;
  }
}

export function downloadNotesAsText(title: string, fullText: string): void {
  const cleanFilename = (title || 'handwritten_notes')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${cleanFilename}.txt`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
