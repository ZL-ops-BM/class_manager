// 座位表：二维矩阵可视化编排
import * as store from '../store.js';
import { toast, openModal, closeModal, esc } from '../ui.js';

export function renderSeating(view) {
  draw(view);
}

function draw(view) {
  const seating = store.getSeating();
  const { rows, cols, map } = seating;
  const seatedIds = new Set(Object.values(map));
  const unseated = store.getStudents().filter(s => !seatedIds.has(s.id));

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      const s = map[key] ? store.getStudent(map[key]) : null;
      cells.push(`<div class="seat-cell ${s ? 'filled' : ''}" data-key="${key}">${s ? esc(s.name) : '空'}</div>`);
    }
  }

  view.innerHTML = `
    <div class="card">
      <div class="card-title">🪑 座位表 <span class="link" id="sizeBtn">调整行列</span></div>
      <div class="podium-desk">讲 台</div>
      <div class="seat-grid" style="grid-template-columns:repeat(${cols},1fr);">
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

  const [r, c] = key.split('-');
  const box = openModal(`
    <div class="modal-title">第 ${Number(r) + 1} 排 · 第 ${Number(c) + 1} 座</div>
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
  const { rows, cols } = store.getSeating();
  const box = openModal(`
    <div class="modal-title">调整座位行列</div>
    <div style="display:flex;gap:10px;">
      <div class="form-group" style="flex:1;"><label class="form-label">排数</label><input class="form-input" type="number" id="szRows" value="${rows}" min="1" max="12" /></div>
      <div class="form-group" style="flex:1;"><label class="form-label">每排座位</label><input class="form-input" type="number" id="szCols" value="${cols}" min="1" max="10" /></div>
    </div>
    <p style="font-size:12px;color:var(--text-2);margin-bottom:12px;">缩小行列时，超出范围的座位安排会被清除。</p>
    <button class="btn btn-primary btn-block" id="szSave">保存</button>
  `);
  box.querySelector('#szSave').onclick = () => {
    const r = Math.max(1, Math.min(12, Number(box.querySelector('#szRows').value) || 1));
    const c = Math.max(1, Math.min(10, Number(box.querySelector('#szCols').value) || 1));
    store.setSeatingSize(r, c);
    toast('已调整');
    closeModal();
    draw(view);
  };
}
