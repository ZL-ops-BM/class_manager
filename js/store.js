// 统一数据层：localStorage 持久化 + CRUD + 导入导出
import { seedData } from './data.js';

const KEY = 'class-manager-data-v1';

let state = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = JSON.parse(raw);
      return;
    }
  } catch (e) { /* ignore */ }
  state = JSON.parse(JSON.stringify(seedData));
  save();
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('保存失败', e);
    if (window.toast) window.toast('数据保存失败，存储空间可能已满');
  }
}

export function initStore() { load(); }

export function getState() { return state; }

export function uid(prefix = 'id') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function nowStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ===== 学生 ===== */
export function getStudents() { return state.students; }
export function getStudent(id) { return state.students.find(s => s.id === id); }
export function addStudent(stu) { stu.id = uid('s'); state.students.push(stu); save(); return stu; }
export function updateStudent(id, patch) {
  const s = getStudent(id);
  if (s) { Object.assign(s, patch); save(); }
}
export function removeStudent(id) {
  state.students = state.students.filter(s => s.id !== id);
  // 清理关联数据
  state.pointLogs = state.pointLogs.filter(l => l.studentId !== id);
  state.leaves = state.leaves.filter(l => l.studentId !== id);
  Object.values(state.attendance).forEach(day => delete day[id]);
  Object.keys(state.seating.map).forEach(k => { if (state.seating.map[k] === id) delete state.seating.map[k]; });
  state.duty.groups.forEach(g => { g.members = g.members.filter(m => m !== id); });
  save();
}

/* ===== 考勤 ===== */
export function getAttendance(date) { return state.attendance[date] || {}; }
export function setAttendance(date, studentId, status) {
  if (!state.attendance[date]) state.attendance[date] = {};
  state.attendance[date][studentId] = status;
  save();
}
export function setAllAttendance(date, status) {
  state.attendance[date] = {};
  state.students.forEach(s => { state.attendance[date][s.id] = status; });
  save();
}
export function getLeaves() { return state.leaves; }
export function addLeave(leave) { leave.id = uid('l'); state.leaves.unshift(leave); save(); }
export function removeLeave(id) { state.leaves = state.leaves.filter(l => l.id !== id); save(); }

/* ===== 积分 ===== */
export function getPointRules() { return state.pointRules; }
export function addPointRule(rule) { rule.id = uid('r'); state.pointRules.push(rule); save(); }
export function removePointRule(id) { state.pointRules = state.pointRules.filter(r => r.id !== id); save(); }
export function getPointLogs() { return state.pointLogs; }
export function addPointLog(log) {
  log.id = uid('p'); log.time = nowStr();
  state.pointLogs.unshift(log); save();
}
export function removePointLog(id) { state.pointLogs = state.pointLogs.filter(l => l.id !== id); save(); }
export function getStudentScore(studentId) {
  return state.pointLogs.filter(l => l.studentId === studentId).reduce((a, l) => a + l.delta, 0);
}
export function getRanking() {
  return state.students
    .map(s => ({ ...s, score: getStudentScore(s.id) }))
    .sort((a, b) => b.score - a.score);
}

/* ===== 成绩 ===== */
export function getExams() { return state.exams; }
export function getExam(id) { return state.exams.find(e => e.id === id); }
export function addExam(exam) { exam.id = uid('e'); state.exams.unshift(exam); save(); return exam; }
export function updateExam(id, patch) {
  const e = getExam(id);
  if (e) { Object.assign(e, patch); save(); }
}
export function removeExam(id) { state.exams = state.exams.filter(e => e.id !== id); save(); }
export function examStats(exam) {
  // 返回 [{ student, scores, total, avg, rank }]
  const rows = state.students.map(s => {
    const sc = exam.scores[s.id] || {};
    const vals = exam.subjects.map(sub => Number(sc[sub]) || 0);
    const total = vals.reduce((a, b) => a + b, 0);
    return { student: s, scores: sc, total, avg: exam.subjects.length ? (total / exam.subjects.length) : 0 };
  }).sort((a, b) => b.total - a.total);
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

/* ===== 值日 ===== */
export function getDuty() { return state.duty; }
export function setDutyGroups(groups) { state.duty.groups = groups; save(); }
export function rotateDuty() {
  const gs = state.duty.groups;
  if (gs.length < 2) return;
  const lists = gs.map(g => g.members);
  lists.unshift(lists.pop());
  gs.forEach((g, i) => { g.members = lists[i]; });
  save();
}

/* ===== 座位 ===== */
export function getSeating() { return state.seating; }
export function setSeat(key, studentId) {
  if (studentId) state.seating.map[key] = studentId;
  else delete state.seating.map[key];
  save();
}
export function setSeatingSize(rows, cols) {
  state.seating.rows = rows; state.seating.cols = cols;
  Object.keys(state.seating.map).forEach(k => {
    const [r, c] = k.split('-').map(Number);
    if (r >= rows || c >= cols) delete state.seating.map[k];
  });
  save();
}

/* ===== 备忘 ===== */
export function getMemos() { return state.memos; }
export function addMemo(text) {
  state.memos.unshift({ id: uid('m'), text, done: false, time: nowStr() });
  save();
}
export function toggleMemo(id) {
  const m = state.memos.find(m => m.id === id);
  if (m) { m.done = !m.done; save(); }
}
export function removeMemo(id) { state.memos = state.memos.filter(m => m.id !== id); save(); }

/* ===== 班级信息 ===== */
export function getClassInfo() { return state.classInfo; }
export function setClassInfo(patch) { Object.assign(state.classInfo, patch); save(); }

/* ===== 导入导出 ===== */
export function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `班级数据备份_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json) {
  const obj = JSON.parse(json);
  const required = ['classInfo', 'students', 'attendance', 'pointRules', 'pointLogs', 'exams', 'duty', 'seating', 'memos'];
  for (const k of required) {
    if (!(k in obj)) throw new Error('缺少字段: ' + k);
  }
  if (!Array.isArray(obj.students)) throw new Error('students 必须是数组');
  state = obj;
  if (!state.leaves) state.leaves = [];
  save();
}

export function resetData() {
  state = JSON.parse(JSON.stringify(seedData));
  save();
}

/* ---------- 主题偏好（与业务数据隔离持久化） ---------- */
const THEME_KEY = 'class-manager-theme';

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch (e) { return 'system'; }
}

export function setTheme(mode) {
  try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  applyTheme(mode);
}

export function applyTheme(mode) {
  const dark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#151412' : '#F6F5F2');
}
