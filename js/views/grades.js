// 成绩管理：考试列表 / 成绩录入 / 统计排名 / 学生趋势
import * as store from '../store.js';
import { toast, openModal, closeModal, confirmDialog, esc } from '../ui.js';
import { navigate } from '../router.js';

export function renderGrades(view) {
  const exams = store.getExams();
  view.innerHTML = `
    <div class="card">
      <div class="card-title">📊 考试列表 <span class="link" id="addExam">＋ 新建考试</span></div>
      ${exams.length ? exams.map(e => `
        <div class="list-item" data-id="${e.id}" style="cursor:pointer;">
          <div class="avatar" style="border-radius:12px;background:linear-gradient(135deg,#F59E0B,#EF4444);">📝</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:15px;">${esc(e.name)}</div>
            <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${esc(e.date)} · ${e.subjects.length} 科目</div>
          </div>
          <span style="color:#D1D5DB;font-size:18px;">›</span>
        </div>`).join('') : '<div class="empty"><div class="empty-icon">📊</div>暂无考试，点击右上角新建</div>'}
    </div>

    <div class="card">
      <div class="card-title">📈 学生成绩趋势</div>
      <select class="form-select" id="trendStu">
        <option value="">选择学生查看总分趋势</option>
        ${store.getStudents().map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}
      </select>
      <div id="trendBox"></div>
    </div>
  `;

  view.querySelectorAll('.list-item[data-id]').forEach(item => {
    item.onclick = () => navigate('/grades/' + item.dataset.id);
  });
  view.querySelector('#addExam').onclick = () => showExamForm();
  view.querySelector('#trendStu').onchange = e => {
    const sid = e.target.value;
    const box = view.querySelector('#trendBox');
    if (!sid) { box.innerHTML = ''; return; }
    box.innerHTML = renderTrend(sid);
  };
}

function renderTrend(sid) {
  // 按时间正序
  const exams = [...store.getExams()].sort((a, b) => a.date.localeCompare(b.date));
  const rows = exams.map(e => {
    const stats = store.examStats(e);
    const r = stats.find(r => r.student.id === sid);
    return { name: e.name, total: r ? r.total : 0, rank: r ? r.rank : '-', count: stats.length };
  });
  if (!rows.length) return '<div class="empty" style="padding:14px 0;">暂无数据</div>';
  const max = Math.max(...rows.map(r => r.total), 1);
  return `
    <div style="margin-top:14px;">
      ${rows.map(r => `
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
            <span>${esc(r.name)}</span>
            <span style="color:var(--text-2);">总分 <b style="color:var(--primary);">${r.total}</b> · 班级第 ${r.rank} 名</span>
          </div>
          <div style="height:10px;background:#F3F4F6;border-radius:999px;overflow:hidden;">
            <div style="height:100%;width:${Math.round(r.total / max * 100)}%;background:var(--primary-grad);border-radius:999px;transition:width .4s;"></div>
          </div>
        </div>`).join('')}
    </div>`;
}

function showExamForm() {
  const box = openModal(`
    <div class="modal-title">新建考试</div>
    <div class="form-group"><label class="form-label">考试名称 *</label><input class="form-input" id="exName" placeholder="如：九月月考" /></div>
    <div class="form-group"><label class="form-label">日期</label><input class="form-input" type="date" id="exDate" value="${store.todayStr()}" /></div>
    <div class="form-group"><label class="form-label">科目（逗号分隔）</label><input class="form-input" id="exSubs" value="语文,数学,英语,物理,化学" /></div>
    <button class="btn btn-primary btn-block" id="exSave">创建并录入成绩</button>
  `);
  box.querySelector('#exSave').onclick = () => {
    const name = box.querySelector('#exName').value.trim();
    const date = box.querySelector('#exDate').value;
    const subjects = box.querySelector('#exSubs').value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (!name) { toast('请输入考试名称'); return; }
    if (!subjects.length) { toast('请至少填写一个科目'); return; }
    const exam = store.addExam({ name, date, subjects, scores: {} });
    closeModal();
    navigate('/grades/' + exam.id);
  };
}

/* ===== 考试详情页 ===== */
export function renderExamDetail(view, examId) {
  const exam = store.getExam(examId);
  if (!exam) { view.innerHTML = '<div class="empty">考试不存在</div>'; return; }
  const stats = store.examStats(exam);
  const classAvg = stats.length ? Math.round(stats.reduce((a, r) => a + r.total, 0) / stats.length) : 0;

  document.getElementById('topbarTitle').textContent = exam.name;

  view.innerHTML = `
    <div class="card">
      <div class="stat-grid cols-3">
        <div class="stat-cell"><div class="stat-num">${stats[0] ? stats[0].total : '-'}</div><div class="stat-label">最高总分</div></div>
        <div class="stat-cell"><div class="stat-num green">${classAvg}</div><div class="stat-label">班级平均</div></div>
        <div class="stat-cell"><div class="stat-num orange">${stats.length ? stats[stats.length - 1].total : '-'}</div><div class="stat-label">最低总分</div></div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:12px;">
      <button class="btn btn-primary btn-block" id="inputBtn">✏️ 录入 / 修改成绩</button>
      <button class="btn btn-danger" id="delExam" style="min-width:90px;">删除考试</button>
    </div>

    <div class="card">
      <div class="card-title">成绩排名</div>
      <div class="table-wrap">
        <table class="grade-table">
          <thead><tr><th>姓名</th><th>排名</th>${exam.subjects.map(s => `<th>${esc(s)}</th>`).join('')}<th>总分</th><th>均分</th></tr></thead>
          <tbody>
            ${stats.map(r => `
              <tr>
                <td><b>${esc(r.student.name)}</b></td>
                <td>${r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td>
                ${exam.subjects.map(s => `<td>${r.scores[s] ?? '—'}</td>`).join('')}
                <td><b style="color:var(--primary);">${r.total}</b></td>
                <td>${r.avg.toFixed(1)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  view.querySelector('#inputBtn').onclick = () => showScoreInput(view, exam);
  view.querySelector('#delExam').onclick = () => confirmDialog(`删除考试「${exam.name}」及其全部成绩？`, () => {
    store.removeExam(exam.id);
    toast('已删除');
    navigate('/grades');
  });
}

function showScoreInput(view, exam) {
  const students = store.getStudents();
  const box = openModal(`
    <div class="modal-title">录入成绩 · ${esc(exam.name)}</div>
    <div style="max-height:52vh;overflow-y:auto;">
      ${students.map(s => `
        <div style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #F3F4F6;">
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;">${esc(s.name)}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            ${exam.subjects.map(sub => `
              <input class="form-input" style="min-height:38px;font-size:13px;padding:6px 8px;" type="number"
                data-sid="${s.id}" data-sub="${esc(sub)}" placeholder="${esc(sub)}"
                value="${exam.scores[s.id]?.[sub] ?? ''}" />`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" id="scSave" style="margin-top:10px;">保存全部成绩</button>
  `);
  box.querySelector('#scSave').onclick = () => {
    const scores = {};
    box.querySelectorAll('input[data-sid]').forEach(inp => {
      const sid = inp.dataset.sid, sub = inp.dataset.sub;
      if (inp.value === '') return;
      if (!scores[sid]) scores[sid] = {};
      scores[sid][sub] = Number(inp.value);
    });
    store.updateExam(exam.id, { scores });
    toast('成绩已保存');
    closeModal();
    renderExamDetail(view, exam.id);
  };
}
