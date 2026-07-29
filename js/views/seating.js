// 座位表：二维矩阵可视化编排
import * as store from '../store.js';
import { toast, openModal, closeModal, esc } from '../ui.js';

export function renderSeating(view) {
  draw(view);
}

function draw(view) {
  const seating = store.getSeating();
  const { rows, map } = seating;
  const seatedIds = new Set(Object.values(map));
  const unseated = store.getStudents().filter(s => !seatedIds.has(s.id));

  // 列结构固定为 2-4-2：左2列 / 过道 / 中4列 / 过道 / 右2列，共 8 个座位列 + 2 条过道
  const groups = [2, 4, 2];
  const template = groups.map(n => `repeat(${n},1fr)`).join(' var(--aisle-w) ');

  const cells = [];
  for (let r = 0; r < rows; r++) {
    let c = 0;
    for (let g = 0; g < groups.length; g++) {
      if (g > 0) {
        // 仅首行插入跨整列高度的过道（grid-row span = 全部排数）
        if (r === 0) cells.push(`<div class="aisle" style="grid-row:span ${rows};">过道</div>`);
      }
      for (let i = 0; i < groups[g]; i++) {
        const key = `${r}-${c}`;
        const s = map[key] ? store.getStudent(map[key]) : null;
        cells.push(`<div class="seat-cell ${s ? 'filled' : ''}" data-key="${key}">${s ? esc(s.name) : '空'}</div>`);
        c++;
      }
    }
  }

  const leftS = seating.map['p-l'] ? store.getStudent(seating.map['p-l']) : null;
  const rightS = seating.map['p-r'] ? store.getStudent(seating.map['p-r']) : null;

  view.innerHTML = `
    <div class="card">
      <div class="card-title">🪑 座位表 <span class="link" id="sizeBtn">调整排数</span></div>
      <div class="podium-row" style="grid-template-columns:${template};">
        <div class="seat-cell podium-side ${leftS ? 'filled' : ''}" style="grid-column:1/3" data-key="p-l">${leftS ? esc(leftS.name) : '空'}</div>
        <div class="podium-desk" style="grid-column:3/9">讲 台</div>
        <div class="seat-cell podium-side ${rightS ? 'filled' : ''}" style="grid-column:9/11" data-key="p-r">${rightS ? esc(rightS.name) : '空'}</div>
      </div>
      <div class="seat-grid" style="grid-template-columns:${template};">
        ${cells.join('')}
      </div>
      <div style="font-size:12px;color:var(--text-2);margin-top:10px;text-align:center;">点击座位可安排 / 更换 / 清空学生</div>
    </div>

    <div class="card">
      <div class="card-title">未安排座位（${unseated.length}）</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${unseated.length ? unseated.map(s => `<span class="duty-chip">${esc(s.name)}</span>`).join('') : '<span style="font-size:13px;color:var(--text-2);">全部学生已安排座位 ✅</span>'}
      </div>
    </div>
  `;

  view.querySelectorAll('.seat-cell').forEach(cell => {
    cell.onclick = () => showAssign(view, cell.dataset.key);
  });
  view.querySelector('#sizeBtn').onclick = () => showSize(view);
}

function showAssign(view, key) {
  const seating = store.getSeating();
  const currentId = seating.map[key];
  const seatedIds = new Set(Object.values(seating.map));
  const candidates = store.getStudents().filter(s => !seatedIds.has(s.id) || s.id === currentId);

  let title;
  if (key === 'p-l') title = '讲台左侧座位';
  else if (key === 'p-r') title = '讲台右侧座位';
  else {
    const [r, c] = key.split('-');
    title = `第 ${Number(r) + 1} 排 · 第 ${Number(c) + 1} 座`;
  }
  const box = openModal(`
    <div class="modal-title">${title}</div>
    ${currentId ? `<button class="btn btn-danger btn-block" id="clearSeat" style="margin-bottom:12px;">清空该座位（当前：${esc(store.getStudent(currentId)?.name || '')}）</button>` : ''}
    <div class="chips" style="flex-wrap:wrap;">
      ${candidates.length ? candidates.map(s => `
        <span class="chip ${s.id === currentId ? 'active' : ''}" data-id="${s.id}">${esc(s.name)}</span>`).join('')
        : '<span style="font-size:13px;color:var(--text-2);">没有可安排的学生</span>'}
    </div>
  `);
  const clearBtn = box.querySelector('#clearSeat');
  if (clearBtn) clearBtn.onclick = () => {
    store.setSeat(key, null);
    toast('座位已清空');
    closeModal();
    draw(view);
  };
  box.querySelectorAll('.chip').forEach(chip => {
    chip.onclick = () => {
      store.setSeat(key, chip.dataset.id);
      toast('座位已安排');
      closeModal();
      draw(view);
    };
  });
}

function showSize(view) {
  const { rows } = store.getSeating();
  const box = openModal(`
    <div class="modal-title">调整座位排数</div>
    <div class="form-group"><label class="form-label">排数（列固定为 2-4-2 共 8 列）</label><input class="form-input" type="number" id="szRows" value="${rows}" min="1" max="12" /></div>
    <p style="font-size:12px;color:var(--text-2);margin-bottom:12px;">缩小排数时，超出范围的座位安排会被清除。</p>
    <button class="btn btn-primary btn-block" id="szSave">保存</button>
  `);
  box.querySelector('#szSave').onclick = () => {
    const r = Math.max(1, Math.min(12, Number(box.querySelector('#szRows').value) || 1));
    store.setSeatingSize(r, 8);
    toast('已调整');
    closeModal();
    draw(view);
  };
}
