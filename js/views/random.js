// 随机点名
import * as store from '../store.js';
import { esc } from '../ui.js';
import { icon, iconBadge } from '../icons.js';

let picked = new Set();
let rolling = false;
let timer = null;

export function renderRandom(view) {
  picked = new Set();
  rolling = false;
  draw(view);
}

function draw(view) {
  const students = store.getStudents();
  const att = store.getAttendance(store.todayStr());
  const excludeLeave = true;

  view.innerHTML = `
    <div class="card">
      <div class="roll-stage">
        <div class="roll-name" id="rollName">？</div>
        <div class="roll-sub" id="rollSub">点击下方按钮开始随机抽选</div>
      </div>
      <button class="btn btn-primary btn-block" id="rollBtn" style="font-size:17px;min-height:50px;">${icon('dice-5', { size: 22 })} 开始点名</button>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <label style="flex:1;display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-2);">
          <input type="checkbox" id="skipPicked" checked style="width:16px;height:16px;" /> 不重复抽取
        </label>
        <button class="btn btn-ghost btn-sm" id="resetBtn">重置记录</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">已抽中（${picked.size}）</div>
      <div id="pickedList" style="display:flex;flex-wrap:wrap;gap:8px;">
        ${picked.size ? [...picked].map(id => {
          const s = store.getStudent(id);
          return s ? `<span class="duty-chip" style="background:var(--primary-soft);color:var(--primary);">${esc(s.name)}</span>` : '';
        }).join('') : '<span style="font-size:13px;color:var(--text-2);">暂无</span>'}
      </div>
    </div>
  `;

  const nameEl = view.querySelector('#rollName');
  const subEl = view.querySelector('#rollSub');
  const btn = view.querySelector('#rollBtn');

  btn.onclick = () => {
    if (rolling) return;
    const skipPicked = view.querySelector('#skipPicked').checked;
    let pool = students.filter(s => {
      if (excludeLeave && (att[s.id] === 'leave' || att[s.id] === 'absent')) return false;
      if (skipPicked && picked.has(s.id)) return false;
      return true;
    });
    if (!pool.length) {
      subEl.textContent = picked.size ? '所有可选学生均已抽过，请重置记录' : '暂无可抽选学生';
      return;
    }
    rolling = true;
    nameEl.classList.add('rolling');
    btn.textContent = '抽选中...';
    subEl.textContent = '命运的齿轮正在转动';
    let ticks = 0;
    const maxTicks = 20 + Math.floor(Math.random() * 10);
    timer = setInterval(() => {
      const s = pool[Math.floor(Math.random() * pool.length)];
      nameEl.textContent = s.name;
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(timer);
        rolling = false;
        nameEl.classList.remove('rolling');
        btn.innerHTML = icon('dice-5', { size: 22 }) + ' 再抽一次';
        picked.add(s.id);
        subEl.innerHTML = icon('check-circle', { size: 18 }) + ` 抽中了「${s.name}」！`;
        draw(view);
        const nn = view.querySelector('#rollName');
        nn.textContent = s.name;
        view.querySelector('#rollSub').innerHTML = icon('check-circle', { size: 18 }) + ` 抽中了「${s.name}」！`;
        view.querySelector('#rollBtn').innerHTML = icon('dice-5', { size: 22 }) + ' 再抽一次';
      }
    }, 80);
  };

  view.querySelector('#resetBtn').onclick = () => {
    picked.clear();
    draw(view);
  };
}
