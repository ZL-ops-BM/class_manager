// 更多中心：子功能入口 + 数据管理 + 班级设置
import * as store from '../store.js';
import { toast, openModal, closeModal, confirmDialog, esc } from '../ui.js';

export function renderMore(view) {
  const info = store.getClassInfo();
  view.innerHTML = `
    <div class="card">
      <div class="card-title">🧩 班务工具</div>
      <div class="entry-grid cols-3">
        <a class="entry-item" href="#/grades"><span class="entry-icon">📊</span><span class="entry-label">成绩管理</span></a>
        <a class="entry-item" href="#/random"><span class="entry-icon">🎲</span><span class="entry-label">随机点名</span></a>
        <a class="entry-item" href="#/duty"><span class="entry-icon">🧹</span><span class="entry-label">值日排班</span></a>
        <a class="entry-item" href="#/seating"><span class="entry-icon">🪑</span><span class="entry-label">座位表</span></a>
        <a class="entry-item" href="#/memo"><span class="entry-icon">📌</span><span class="entry-label">班务备忘</span></a>
        <a class="entry-item" href="#/attendance"><span class="entry-icon">📋</span><span class="entry-label">考勤点名</span></a>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚙️ 班级设置</div>
      <div class="list-item" id="editClass" style="cursor:pointer;">
        <span style="font-size:20px;">🏫</span>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:600;">${esc(info.name)}</div>
          <div style="font-size:12px;color:var(--text-2);">班主任：${esc(info.teacher)} · 点击修改</div>
        </div>
        <span style="color:#D1D5DB;">›</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💾 数据管理</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="btn btn-ghost btn-block" id="exportBtn">📤 导出数据备份（JSON）</button>
        <button class="btn btn-ghost btn-block" id="importBtn">📥 导入数据备份</button>
        <input type="file" id="importFile" accept=".json,application/json" class="hidden" />
        <button class="btn btn-danger btn-block" id="resetBtn">♻️ 恢复演示数据</button>
      </div>
      <p style="font-size:12px;color:var(--text-2);margin-top:10px;line-height:1.6;">
        数据保存在本机浏览器中（localStorage），建议定期导出备份；更换手机或浏览器后可通过导入恢复。
      </p>
    </div>
  `;

  view.querySelector('#editClass').onclick = () => {
    const box = openModal(`
      <div class="modal-title">班级设置</div>
      <div class="form-group"><label class="form-label">班级名称</label><input class="form-input" id="ciName" value="${esc(info.name)}" /></div>
      <div class="form-group"><label class="form-label">班主任称呼</label><input class="form-input" id="ciTeacher" value="${esc(info.teacher)}" /></div>
      <div class="form-group"><label class="form-label">班训 / 寄语</label><input class="form-input" id="ciMotto" value="${esc(info.motto)}" /></div>
      <button class="btn btn-primary btn-block" id="ciSave">保存</button>
    `);
    box.querySelector('#ciSave').onclick = () => {
      store.setClassInfo({
        name: box.querySelector('#ciName').value.trim() || info.name,
        teacher: box.querySelector('#ciTeacher').value.trim() || info.teacher,
        motto: box.querySelector('#ciMotto').value.trim() || info.motto
      });
      toast('已保存');
      closeModal();
      renderMore(view);
    };
  };

  view.querySelector('#exportBtn').onclick = () => {
    store.exportData();
    toast('已导出备份文件');
  };

  const fileInput = view.querySelector('#importFile');
  view.querySelector('#importBtn').onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        store.importData(reader.result);
        toast('数据导入成功');
        renderMore(view);
      } catch (e) {
        toast('导入失败：' + e.message);
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  };

  view.querySelector('#resetBtn').onclick = () => {
    confirmDialog('将清空当前全部数据并恢复为演示数据，确定继续？', () => {
      store.resetData();
      toast('已恢复演示数据');
      renderMore(view);
    });
  };
}
