// 考勤点名
import * as store from '../store.js';
import { toast, openModal, closeModal, esc, avatarHtml, confirmDialog } from '../ui.js';
import { icon, iconBadge } from '../icons.js';

const STATUS = [
  { key: 'present', label: '出勤', cls: 'on-present' },
  { key: 'late', label: '迟到', cls: 'on-late' },
  { key: 'leave', label: '请假', cls: 'on-leave' },
  { key: 'absent', label: '缺勤', cls: 'on-absent' }
];

let date = '';

export function renderAttendance(view) {
  date = store.todayStr();
  draw(view);
}

function draw(view) {
  const students = store.getStudents();
  const att = store.getAttendance(date);
  const count = { present: 0, late: 0, leave: 0, absent: 0 };
  students.forEach(s => { if (att[s.id]) count[att[s.id]]++; });
  const marked = Object.values(count).reduce((a, b) => a + b, 0);

  view.innerHTML = `
    <div class="date-row">
      <input type="date" id="attDate" value="${date}" />
      <button class="btn btn-ghost btn-sm" id="allPresent">一键全勤</button>
    </div>

    <div class="card">
      <div class="stat-grid">
        <div class="stat-cell"><div class="stat-num green">${count.present}</div><div class="stat-label">出勤</div></div>
        <div class="stat-cell"><div class="stat-num orange">${count.late}</div><div class="stat-label">迟到</div></div>
        <div class="stat-cell"><div class="stat-num">${count.leave}</div><div class="stat-label">请假</div></div>
        <div class="stat-cell"><div class="stat-num red">${count.absent}</div><div class="stat-label">缺勤</div></div>
      </div>
      <div style="text-align:center;font-size:12px;color:var(--text-2);margin-top:10px;">
        已点名 ${marked}/${students.length} 人${marked === students.length && students.length ? ' · 点名完成 ' + icon('check-circle', { size: 16 }) : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-title">点名册 <span class="link" id="leaveBtn">请假登记 ›</span></div>
      ${students.map(s => {
        const cur = att[s.id] || '';
        return `
        <div class="list-item">
          ${avatarHtml(s)}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:14px;">${esc(s.name)}</div>
          </div>
          <div class="seg" data-id="${s.id}">
            ${STATUS.map(st => `<button class="seg-btn ${cur === st.key ? st.cls : ''}" data-st="${st.key}">${st.label}</button>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-title">请假记录</div>
      ${renderLeaves()}
    </div>
  `;

  view.querySelector('#attDate').onchange = e => { date = e.target.value; draw(view); };
  view.querySelector('#allPresent').onclick = () => {
    store.setAllAttendance(date, 'present');
    toast('已全部标记为出勤');
    draw(view);
  };
  view.querySelectorAll('.seg').forEach(seg => {
    seg.querySelectorAll('.seg-btn').forEach(btn => {
      btn.onclick = () => {
        store.setAttendance(date, seg.dataset.id, btn.dataset.st);
        draw(view);
      };
    });
  });
  view.querySelector('#leaveBtn').onclick = () => showLeaveForm(view);
  view.querySelectorAll('[data-del-leave]').forEach(b => {
    b.onclick = () => confirmDialog('删除该条请假记录？', () => {
      store.removeLeave(b.dataset.delLeave);
      draw(view);
    });
  });
}

function renderLeaves() {
  const leaves = store.getLeaves();
  if (!leaves.length) return '<div class="empty" style="padding:16px 0;">暂无请假记录</div>';
  return leaves.map(l => {
    const s = store.getStudent(l.studentId);
    return `
      <div class="log-item">
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;">${esc(s ? s.name : '（已删除）')}<span class="badge orange">${esc(l.days)}天</span></div>
          <div class="log-meta">${esc(l.date)} · ${esc(l.reason)}</div>
        </div>
        <button class="btn btn-danger btn-sm" data-del-leave="${l.id}">删除</button>
      </div>`;
  }).join('');
}

function showLeaveForm(view) {
  const students = store.getStudents();
  const box = openModal(`
    <div class="modal-title">请假登记</div>
    <div class="form-group"><label class="form-label">学生</label>
      <select class="form-select" id="lvStu">${students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:10px;">
      <div class="form-group" style="flex:1.5;"><label class="form-label">日期</label><input class="form-input" type="date" id="lvDate" value="${date}" /></div>
      <div class="form-group" style="flex:1;"><label class="form-label">天数</label><input class="form-input" type="number" id="lvDays" value="1" min="0.5" step="0.5" /></div>
    </div>
    <div class="form-group"><label class="form-label">请假事由</label><textarea class="form-textarea" id="lvReason" placeholder="如：感冒发烧，家长已电话确认"></textarea></div>
    <button class="btn btn-primary btn-block" id="lvSave">登记并标记请假</button>
  `);
  box.querySelector('#lvSave').onclick = () => {
    const studentId = box.querySelector('#lvStu').value;
    const d = box.querySelector('#lvDate').value;
    const days = box.querySelector('#lvDays').value;
    const reason = box.querySelector('#lvReason').value.trim() || '未填写事由';
    store.addLeave({ studentId, date: d, days, reason });
    if (d === date) store.setAttendance(date, studentId, 'leave');
    toast('请假已登记');
    closeModal();
    draw(view);
  };
}
