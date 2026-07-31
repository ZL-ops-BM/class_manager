// 应用入口
import { initStore, getTheme, applyTheme } from './store.js';
import { register, startRouter } from './router.js';
import { renderTabIcons } from './icons.js';
import { renderDashboard } from './views/dashboard.js';
import { renderStudents } from './views/students.js';
import { renderAttendance } from './views/attendance.js';
import { renderPoints } from './views/points.js';
import { renderGrades, renderExamDetail } from './views/grades.js';
import { renderRandom } from './views/random.js';
import { renderDuty } from './views/duty.js';
import { renderSeating } from './views/seating.js';
import { renderMemo } from './views/memo.js';
import { renderMore } from './views/more.js';

initStore();
applyTheme(getTheme());
renderTabIcons();
try {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme('system');
  });
} catch (e) {}

register('/dashboard', renderDashboard, { title: '班级管家' });
register('/students', renderStudents, { title: '学生管理' });
register('/attendance', renderAttendance, { title: '考勤点名' });
register('/points', renderPoints, { title: '积分评价' });
register('/more', renderMore, { title: '更多' });
register('/grades', renderGrades, { title: '成绩管理' });
register('/grades/:id', renderExamDetail, { title: '考试详情' });
register('/random', renderRandom, { title: '随机点名' });
register('/duty', renderDuty, { title: '值日排班' });
register('/seating', renderSeating, { title: '座位表' });
register('/memo', renderMemo, { title: '班务备忘' });

startRouter();
