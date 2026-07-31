// 学生档案管理
import * as store from '../store.js';
import { toast, openModal, closeModal, confirmDialog, esc, avatarHtml, el } from '../ui.js';
import { icon } from '../icons.js';

let keyword = '';
let filter = 'all'; // all | cadre | male | female

export function renderStudents(view) {
  keyword = '';
  filter = 'all';
  draw(view);
}

function draw(view) {
  const students = store.getStudents().filter(s => {
    if (keyword && !s.name.includes(keyword) && !s.no.includes(keyword)) return false;
    if (filter === 'cadre' && !s.role) return false;
    if (filter === 'male' && s.gender !== '男') return false;
    if (filter === 'female' && s.gender !== '女') return false;
    return true;
  });

  view.innerHTML = `
    <div class="search-box">
      <span>${icon('search')}</span>
      <input id="stuSearch" placeholder="搜索姓名 / 学号" value="${esc(keyword)}" />
    </div>
    <div class="chips">
      <span class="chip ${filter === 'all' ? 'active' : ''}" data-f="all">全部 ${store.getStudents().length}</span>
      <span class="chip ${filter === 'cadre' ? 'active' : ''}" data-f="cadre">班干部</span>
      <span class="chip ${filter === 'male' ? 'active' : ''}" data-f="male">男生</span>
      <span class="chip ${filter === 'female' ? 'active' : ''}" data-f="female">女生</span>
    </div>
    <div class="card" id="stuList">
      ${students.length ? students.map(s => `
        <div class="list-item" data-id="${s.id}" style="cursor:pointer;">
          ${avatarHtml(s)}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:15px;">${esc(s.name)}${s.role ? `<span class="badge">${esc(s.role)}</span>` : ''}</div>
            <div style="font-size:12px;color:var(--text-2);margin-top:2px;">学号 ${esc(s.no)} · ${esc(s.gender)}</div>
          </div>
          <span style="color:var(--text-3);font-size:18px;">›</span>
        </div>
      `).join('') : `<div class="empty"><div class="empty-icon">${icon('search-x')}</div>暂无匹配学生</div>`}
    </div>
    <button class="fab" id="addStuBtn" aria-label="添加学生">${icon('plus')}</button>
  `;

  view.querySelector('#stuSearch').oninput = e => {
    keyword = e.target.value.trim();
    const scroll = window.scrollY;
    draw(view);
    view.querySelector('#stuSearch').focus();
    const inp = view.querySelector('#stuSearch');
    inp.setSelectionRange(inp.value.length, inp.value.length);
    window.scrollTo(0, scroll);
  };
  view.querySelectorAll('.chip').forEach(c => c.onclick = () => { filter = c.dataset.f; draw(view); });
  view.querySelectorAll('.list-item').forEach(item => {
    item.onclick = () => showDetail(view, item.dataset.id);
  });
  view.querySelector('#addStuBtn').onclick = () => showForm(view, null);
}

function showDetail(view, id) {
  const s = store.getStudent(id);
  if (!s) return;
  const score = store.getStudentScore(id);
  const box = openModal(`
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:14px;">
      ${avatarHtml(s, 64)}
      <div style="font-size:18px;font-weight:700;">${esc(s.name)}${s.role ? `<span class="badge">${esc(s.role)}</span>` : ''}</div>
      <div style="font-size:13px;color:var(--text-2);">学号 ${esc(s.no)} · ${esc(s.gender)} · 积分 <b style="color:var(--primary);">${score}</b></div>
    </div>
    <div class="card" style="box-shadow:none;background:var(--surface-2);">
      <div style="font-size:13px;line-height:2;">
        <div style="display:flex;gap:8px;align-items:center;">${icon('phone', { size: 18 })}<span>本人电话：${esc(s.phone || '—')}</span></div>
        <div style="display:flex;gap:8px;align-items:center;">${icon('phone-call', { size: 18 })}<span>家长电话：${esc(s.parentPhone || '—')}</span></div>
        <div style="display:flex;gap:8px;align-items:flex-start;">${icon('pencil', { size: 18 })}<span>评语备注：${esc(s.note || '暂无')}</span></div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:6px;">
      <button class="btn btn-danger" data-act="del" style="flex:1;">删除</button>
      <button class="btn btn-primary" data-act="edit" style="flex:2;">编辑档案</button>
    </div>
  `);
  box.querySelector('[data-act="edit"]').onclick = () => { closeModal(); showForm(view, s); };
  box.querySelector('[data-act="del"]').onclick = () => {
    closeModal();
    confirmDialog(`确定删除学生「${s.name}」？其考勤、积分等关联数据将一并清除。`, () => {
      store.removeStudent(id);
      toast('已删除');
      draw(view);
    });
  };
}

function showForm(view, stu) {
  const isEdit = !!stu;
  const s = stu || { name: '', no: '', gender: '男', phone: '', parentPhone: '', role: '', note: '' };
  const box = openModal(`
    <div class="modal-title">${isEdit ? '编辑学生' : '新增学生'}</div>
    <div class="form-group"><label class="form-label">姓名 *</label><input class="form-input" id="fName" value="${esc(s.name)}" /></div>
    <div style="display:flex;gap:10px;">
      <div class="form-group" style="flex:1;"><label class="form-label">学号 *</label><input class="form-input" id="fNo" value="${esc(s.no)}" /></div>
      <div class="form-group" style="flex:1;"><label class="form-label">性别</label>
        <select class="form-select" id="fGender">
          <option ${s.gender === '男' ? 'selected' : ''}>男</option>
          <option ${s.gender === '女' ? 'selected' : ''}>女</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label class="form-label">班干部职务（可空）</label><input class="form-input" id="fRole" value="${esc(s.role)}" placeholder="如：班长、学习委员" /></div>
    <div class="form-group"><label class="form-label">本人电话</label><input class="form-input" id="fPhone" type="tel" value="${esc(s.phone)}" /></div>
    <div class="form-group"><label class="form-label">家长电话</label><input class="form-input" id="fPPhone" type="tel" value="${esc(s.parentPhone)}" /></div>
    <div class="form-group"><label class="form-label">评语 / 备注</label><textarea class="form-textarea" id="fNote">${esc(s.note)}</textarea></div>
    <button class="btn btn-primary btn-block" id="fSave">${isEdit ? '保存修改' : '添加学生'}</button>
  `);
  box.querySelector('#fSave').onclick = () => {
    const data = {
      name: box.querySelector('#fName').value.trim(),
      no: box.querySelector('#fNo').value.trim(),
      gender: box.querySelector('#fGender').value,
      role: box.querySelector('#fRole').value.trim(),
      phone: box.querySelector('#fPhone').value.trim(),
      parentPhone: box.querySelector('#fPPhone').value.trim(),
      note: box.querySelector('#fNote').value.trim()
    };
    if (!data.name || !data.no) { toast('姓名和学号为必填'); return; }
    if (isEdit) { store.updateStudent(stu.id, data); toast('已保存'); }
    else { store.addStudent(data); toast('已添加'); }
    closeModal();
    draw(view);
  };
}
