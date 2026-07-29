// 班务备忘
import * as store from '../store.js';
import { toast, confirmDialog, esc } from '../ui.js';

export function renderMemo(view) {
  draw(view);
}

function draw(view) {
  const memos = store.getMemos();
  const undone = memos.filter(m => !m.done);
  const done = memos.filter(m => m.done);

  view.innerHTML = `
    <div class="card">
      <div style="display:flex;gap:8px;">
        <input class="form-input" id="memoInput" placeholder="记一条班务待办，如：周五收回执单" style="flex:1;" />
        <button class="btn btn-primary" id="memoAdd" style="min-width:70px;">添加</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">待办事项（${undone.length}）</div>
      ${undone.length ? undone.map(m => memoItem(m)).join('') : '<div class="empty" style="padding:14px 0;">全部完成，太棒了 🎉</div>'}
    </div>

    ${done.length ? `
    <div class="card">
      <div class="card-title">已完成（${done.length}）</div>
      ${done.map(m => memoItem(m)).join('')}
    </div>` : ''}
  `;

  const addFn = () => {
    const inp = view.querySelector('#memoInput');
    const text = inp.value.trim();
    if (!text) { toast('请输入内容'); return; }
    store.addMemo(text);
    toast('已添加');
    draw(view);
  };
  view.querySelector('#memoAdd').onclick = addFn;
  view.querySelector('#memoInput').onkeydown = e => { if (e.key === 'Enter') addFn(); };

  view.querySelectorAll('.memo-check').forEach(c => {
    c.onclick = () => { store.toggleMemo(c.dataset.id); draw(view); };
  });
  view.querySelectorAll('[data-del-memo]').forEach(b => {
    b.onclick = () => confirmDialog('删除这条备忘？', () => {
      store.removeMemo(b.dataset.delMemo);
      draw(view);
    });
  });
}

function memoItem(m) {
  return `
    <div class="memo-item">
      <div class="memo-check ${m.done ? 'done' : ''}" data-id="${m.id}">✓</div>
      <div style="flex:1;min-width:0;">
        <div class="memo-text ${m.done ? 'done' : ''}" style="font-size:14px;">${esc(m.text)}</div>
        <div class="log-meta">${esc(m.time)}</div>
      </div>
      <button class="btn btn-sm" data-del-memo="${m.id}" style="background:#F3F4F6;color:var(--text-2);">删除</button>
    </div>`;
}
