const ESC_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESC_MAP[ch] || ch)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Minimal markdown renderer (matches Nora's _renderMarkdown)
 * Supports: **bold**, _italic_, `code`, [link](url), lists, line breaks
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''
  let html = escapeHtml(text)
  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  )
  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic: _text_
  html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>')
  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code class="nora-ls-code">$1</code>')
  // Lists: lines starting with - or *
  html = html.replace(
    /((?:^|<br>)\s*[-*]\s+.+(?:<br>\s*[-*]\s+.+)*)/g,
    (block) => {
      const items = block
        .split('<br>')
        .map((line) => {
          const m = line.match(/^\s*[-*]\s+(.+)/)
          return m ? '<li>' + m[1] + '</li>' : line
        })
        .join('')
      return '<ul style="margin:4px 0;padding-left:20px;">' + items + '</ul>'
    }
  )
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  return html
}

/**
 * Translation helper — uses frappe._messages if available, else returns key
 */
export function translate(key: string, customFn?: (text: string) => string): string {
  if (customFn) return customFn(key)
  return window.frappe?._messages?.[key] || key
}

/**
 * Get user avatar URL from frappe.boot.user_info
 */
export function getUserAvatarUrl(user?: string): string | null {
  if (!user) user = window.frappe?.boot?.user?.name
  if (!user) return null
  const info = window.frappe?.boot?.user_info?.[user]
  return info?.image || null
}

/**
 * Get current user info from frappe.boot
 */
export function getCurrentUser(): { name: string; fullName: string } {
  const boot = window.frappe?.boot
  const name = boot?.user?.name || 'Guest'
  const fullName = boot?.user?.full_name || boot?.user_info?.[name]?.fullname || name
  return { name, fullName }
}
