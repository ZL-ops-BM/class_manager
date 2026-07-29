// 首页仪表盘
import * as store from '../store.js';
import { esc, avatarHtml } from '../ui.js';

export function renderDashboard(view) {
  const info = store.getClassInfo();
  const students = store.getStudents();
  const today = store.todayStr();
  const att = store.getAttendance(today);
  const attMarked = Object.keys(att).filter(id => students.some(s => s.id === id)).length;
  const present = students.filter(s => att[s.id] === 'present' || att[s.id] === 'late').length;
  const attRate = students.length && attMarked ? Math.round(present / students.length * 100) : null;
  const ranking = store.getRanking();
  const top = ranking[0];
  const undoneMemos = store.getMemos().filter(m => !m.done);
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date();
  const todayDuty = store.getDuty().groups.find(g => g.day === dayNames[d.getDay()]);

  const todos = [];
  if (attMarked < students.length) todos.push({ icon: '📋', text: `今日考勤未完成（${attMarked}/${students.length}）`, link: '#/attendance' });
  undoneMemos.slice(0, 3).forEach(m => todos.push({ icon: '📌', text: m.text, link: '#/memo' }));

  view.innerHTML = `
    <div class="hero">
      <div class="hero-class">${esc(info.name)}</div>
      <div class="hero-date">${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${dayNames[d.getDay()]} · ${esc(info.teacher)}，您好 👋</div>
      <div class="hero-tip">「${esc(info.motto)}」</div>
    </div>

    <div class="card">
      <div class="stat-grid cols-3">
        <div class="stat-cell"><div class="stat-num">${students.length}</div><div class="stat-label">学生人数</div></div>
        <div class="stat-cell"><div class="stat-num green">${attRate === null ? '—' : attRate + '%'}</div><div class="stat-label">今日出勤率</div></div>
        <div class="stat-cell"><div class="stat-num orange">${top ? top.score : '—'}</div><div class="stat-label">积分榜首${top ? '·' + esc(top.name) : ''}</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚡ 快捷入口</div>
      <div class="entry-grid">
        <a class="entry-item" href="#/attendance"><span class="entry-icon">📋</span><span class="entry-label">考勤点名</span></a>
        <a class="entry-item" href="#/random"><span class="entry-icon">🎲</span><span class="entry-label">随机点名</span></a>
        <a class="entry-item" href="#/points"><span class="entry-icon">⭐</span><span class="entry-label">积分评价</span></a>
        <a class="entry-item" href="#/grades"><span class="entry-icon">📊</span><span class="entry-label">成绩管理</span></a>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📌 今日待办 <a class="link" href="#/memo" style="text-decoration:none;">全部 ›</a></div>
      ${todos.length ? todos.map(t => `
        <a href="${t.link}" style="text-decoration:none;color:inherit;">
          <div class="list-item">
            <span style="font-size:20px;">${t.icon}</span>
            <span style="flex:1;font-size:14px;">${esc(t.text)}</span>
            <span style="color:#D1D5DB;">›</span>
          </div>
        </a>`).join('') : '<div class="empty" style="padding:14px 0;">今日事项已全部处理 🎉</div>'}
    </div>

    <div class="card">
      <div class="card-title">🧹 今日值日${todayDuty ? ' · ' + esc(todayDuty.day) : ''} <a class="link" href="#/duty" style="text-decoration:none;">排班表 ›</a></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${todayDuty && todayDuty.members.length ? todayDuty.members.map(id => {
          const s = store.getStudent(id);
          return s ? `<span class="duty-chip" style="background:#EEF2FF;color:var(--primary);">${esc(s.name)}</span>` : '';
        }).join('') : '<span style="font-size:13px;color:var(--text-2);">今日无值日安排</span>'}
      </div>
    </div>

    ${ranking.length ? `
    <div class="card">
      <div class="card-title">🏆 积分前三 <a class="link" href="#/points" style="text-decoration:none;">排行榜 ›</a></div>
      ${ranking.slice(0, 3).map((s, i) => `
        <div class="rank-row">
          <span class="rank-no">${['🥇', '🥈', '🥉'][i]}</span>
          ${avatarHtml(s, 34)}
          <div style="flex:1;font-size:14px;font-weight:600;">${esc(s.name)}${s.role ? `<span class="badge">${esc(s.role)}</span>` : ''}</div>
          <b style="color:var(--primary);">${s.score} 分</b>
        </div>`).join('')}
    </div>` : ''}
  `;
}
