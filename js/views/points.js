// 积分评价：排行榜 / 评价 / 规则管理 / 流水
import * as store from '../store.js';
import { toast, openModal, closeModal, confirmDialog, esc, avatarHtml } from '../ui.js';
import { icon } from '../icons.js';

export function renderPoints(view) {
  draw(view);
}

function draw(view) {
  const ranking = store.getRanking();
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const logs = store.getPointLogs().slice(0, 12);

  view.innerHTML = `
    <div class="card">
      <div class="card-title"><span class="title-main">${icon('trophy')}积分排行榜</span></div>
      ${ranking.length >= 3 ? `
      <div class="rank-podium">
        ${podium(top3[1], 'second', 2)}
        ${podium(top3[0], 'first', 1)}
        ${podium(top3[2], 'third', 3)}
      </div>` : ''}
      ${rest.map((s, i) => `
        <div class="rank-row">
          <span class="rank-no">${i + 4}</span>
          ${avatarHtml(s, 34)}
          <div style="flex:1;font-size:14px;font-weight:600;">${esc(s.name)}</div>
          <b style="color:${s.score >= 0 ? 'var(--primary)' : 'var(--danger)'};">${s.score}</b>
        </div>`).join('')}
    </div>

    <div style="display:flex;gap:10px;margin-bottom:12px;">
      <button class="btn btn-primary btn-block" id="evalBtn">${icon('pen-line', { size: 18 })} 快速评价</button>
      <button class="btn btn-ghost" id="ruleBtn" style="min-width:110px;">规则管理</button>
    </div>

    <div class="card">
      <div class="card-title">积分流水（近期）</div>
      ${logs.length ? logs.map(l => {
        const s = store.getStudent(l.studentId);
        return `
        <div class="log-item">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;"><b>${esc(s ? s.name : '（已删除）')}</b> · ${esc(l.ruleName)}</div>
            <div class="log-meta">${esc(l.time)}${l.note ? ' · ' + esc(l.note) : ''}</div>
          </div>
          <span class="log-score ${l.delta >= 0 ? 'plus' : 'minus'}">${l.delta >= 0 ? '+' : ''}${l.delta}</span>
          <button class="btn btn-sm" data-undo="${l.id}" style="background:var(--surface-3);color:var(--text-2);margin-left:8px;">撤销</button>
        </div>`;
      }).join('') : '<div class="empty" style="padding:16px 0;">暂无记录</div>'}
    </div>
  `;

  view.querySelector('#evalBtn').onclick = () => showEval(view);
  view.querySelector('#ruleBtn').onclick = () => showRules(view);
  view.querySelectorAll('[data-undo]').forEach(b => {
    b.onclick = () => confirmDialog('撤销这条积分记录？', () => {
      store.removePointLog(b.dataset.undo);
      toast('已撤销');
      draw(view);
    });
  });
}

function podium(s, cls, rank) {
  if (!s) return '';
  return `
    <div class="podium-item ${cls}">
      ${avatarHtml(s)}
      <span class="podium-rank rank-tier-${rank}">${rank}</span>
      <span class="podium-name">${esc(s.name)}</span>
      <span class="podium-score">${s.score} 分</span>
    </div>`;
}

function showEval(view) {
  const students = store.getStudents();
  const rules = store.getPointRules();
  const box = openModal(`
    <div class="modal-title">快速评价</div>
    <div class="form-group"><label class="form-label">选择学生（可多选）</label>
      <div class="chips" id="evStu" style="flex-wrap:wrap;">
        ${students.map(s => `<span class="chip" data-id="${s.id}">${esc(s.name)}</span>`).join('')}
      </div>
    </div>
    <div class="form-group"><label class="form-label">行为规则</label>
      <select class="form-select" id="evRule">
        ${rules.map(r => `<option value="${r.id}">${r.type === 'add' ? '＋' : '－'} ${esc(r.name)}（${r.type === 'add' ? '+' : '-'}${r.score}分）</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label class="form-label">备注（可空）</label><input class="form-input" id="evNote" placeholder="补充说明" /></div>
    <button class="btn btn-primary btn-block" id="evSave">提交评价</button>
  `);
  box.querySelectorAll('#evStu .chip').forEach(c => {
    c.onclick = () => c.classList.toggle('active');
  });
  box.querySelector('#evSave').onclick = () => {
    const ids = [...box.querySelectorAll('#evStu .chip.active')].map(c => c.dataset.id);
    if (!ids.length) { toast('请至少选择一名学生'); return; }
    const rule = store.getPointRules().find(r => r.id === box.querySelector('#evRule').value);
    const note = box.querySelector('#evNote').value.trim();
    ids.forEach(id => {
      store.addPointLog({
        studentId: id,
        ruleName: rule.name,
        delta: rule.type === 'add' ? rule.score : -rule.score,
        note
      });
    });
    toast(`已为 ${ids.length} 名学生记录「${rule.name}」`);
    closeModal();
    draw(view);
  };
}

function showRules(view) {
  const rules = store.getPointRules();
  const box = openModal(`
    <div class="modal-title">行为规则管理</div>
    <div style="max-height:36vh;overflow-y:auto;margin-bottom:12px;">
      ${rules.map(r => `
        <div class="log-item">
          <div style="flex:1;font-size:14px;display:flex;align-items:center;gap:8px;">${icon(r.type === 'add' ? 'thumbs-up' : 'thumbs-down', { size: 18 })}<span>${esc(r.name)}</span></div>
          <span class="log-score ${r.type === 'add' ? 'plus' : 'minus'}">${r.type === 'add' ? '+' : '-'}${r.score}</span>
          <button class="btn btn-danger btn-sm" data-del="${r.id}" style="margin-left:8px;">删除</button>
        </div>`).join('')}
    </div>
    <div style="border-top:1px solid var(--surface-3);padding-top:12px;">
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <input class="form-input" id="ruName" placeholder="规则名称" style="flex:2;" />
        <select class="form-select" id="ruType" style="flex:1;"><option value="add">加分</option><option value="sub">扣分</option></select>
        <input class="form-input" id="ruScore" type="number" value="1" min="1" style="flex:1;" />
      </div>
      <button class="btn btn-primary btn-block" id="ruAdd">添加规则</button>
    </div>
  `);
  box.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = () => {
      store.removePointRule(b.dataset.del);
      toast('规则已删除');
      closeModal();
      showRules(view);
    };
  });
  box.querySelector('#ruAdd').onclick = () => {
    const name = box.querySelector('#ruName').value.trim();
    const type = box.querySelector('#ruType').value;
    const score = Math.abs(Number(box.querySelector('#ruScore').value)) || 1;
    if (!name) { toast('请输入规则名称'); return; }
    store.addPointRule({ name, type, score });
    toast('规则已添加');
    closeModal();
    showRules(view);
  };
}
