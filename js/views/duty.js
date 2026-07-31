// 值日排班
import * as store from '../store.js';
import { toast, openModal, closeModal, esc } from '../ui.js';
import { icon, iconBadge } from '../icons.js';

export function renderDuty(view) {
  draw(view);
}

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function draw(view) {
  const duty = store.getDuty();
  const todayName = DAY_NAMES[new Date().getDay()];

  view.innerHTML = `
    <div class="card">
      <div class="card-title"><span class="title-main">${iconBadge('broom', '#0891B2')}本周值日安排</span><span class="link" id="rotateBtn">${icon('rotate-cw', { size: 16 })} 轮换一周</span></div>
      ${duty.groups.map((g, i) => `
        <div class="duty-day">
          <div class="duty-label ${g.day === todayName ? 'today' : ''}">
            <span>${esc(g.day)}</span>
            ${g.day === todayName ? '<span style="font-size:10px;font-weight:400;">今天</span>' : ''}
          </div>
          <div style="flex:1;">
            <div class="duty-members">
              ${g.members.length ? g.members.map(id => {
                const s = store.getStudent(id);
                return s ? `<span class="duty-chip">${esc(s.name)}</span>` : '';
              }).join('') : '<span style="font-size:12px;color:var(--text-2);">未安排</span>'}
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" data-edit="${i}">编辑</button>
        </div>`).join('')}
    </div>
    <div class="info-card">
      <div class="info-title">${icon('lightbulb', { size: 16 })} 值日小贴士</div>
      <div class="info-text">点击「轮换一周」可将各天值日小组整体顺移一位，实现周期轮换，无需手动重排。</div>
    </div>
  `;

  view.querySelector('#rotateBtn').onclick = () => {
    store.rotateDuty();
    toast('已轮换值日小组');
    draw(view);
  };
  view.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => showEdit(view, Number(b.dataset.edit));
  });
}

function showEdit(view, idx) {
  const duty = store.getDuty();
  const group = duty.groups[idx];
  const students = store.getStudents();
  const box = openModal(`
    <div class="modal-title">${esc(group.day)} · 值日成员</div>
    <div class="chips" style="flex-wrap:wrap;margin-bottom:16px;">
      ${students.map(s => `
        <span class="chip ${group.members.includes(s.id) ? 'active' : ''}" data-id="${s.id}">${esc(s.name)}</span>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" id="dtSave">保存</button>
  `);
  box.querySelectorAll('.chip').forEach(c => c.onclick = () => c.classList.toggle('active'));
  box.querySelector('#dtSave').onclick = () => {
    group.members = [...box.querySelectorAll('.chip.active')].map(c => c.dataset.id);
    store.setDutyGroups(duty.groups);
    toast('值日安排已保存');
    closeModal();
    draw(view);
  };
}
