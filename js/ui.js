// 通用 UI 工具：toast / modal / helpers

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2000);
}
window.toast = toast;

export function openModal(html) {
  const mask = document.getElementById('modalMask');
  const box = document.getElementById('modalBox');
  box.innerHTML = html;
  mask.classList.remove('hidden');
  mask.onclick = e => { if (e.target === mask) closeModal(); };
  return box;
}

export function closeModal() {
  document.getElementById('modalMask').classList.add('hidden');
  document.getElementById('modalBox').innerHTML = '';
}

export function confirmDialog(msg, onOk) {
  const box = openModal(`
    <div class="modal-title">提示</div>
    <p style="text-align:center;color:var(--text-2);margin-bottom:18px;">${esc(msg)}</p>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-ghost btn-block" data-act="cancel">取消</button>
      <button class="btn btn-danger btn-block" data-act="ok" style="background:var(--danger);color:#fff;">确定</button>
    </div>
  `);
  box.querySelector('[data-act="cancel"]').onclick = closeModal;
  box.querySelector('[data-act="ok"]').onclick = () => { closeModal(); onOk(); };
}

export function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function avatarHtml(student, size) {
  const cls = student.gender === '女' ? 'avatar girl' : 'avatar';
  const style = size ? `style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px;"` : '';
  return `<div class="${cls}" ${style}>${esc(student.name[0])}</div>`;
}

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
