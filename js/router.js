// 轻量 hash 路由
const routes = {};
let currentPath = '';

export function register(path, renderFn, opts = {}) {
  routes[path] = { render: renderFn, ...opts };
}

export function navigate(path) {
  location.hash = '#' + path;
}

export function currentRoute() { return currentPath; }

function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/dashboard';
  return h;
}

// 主 Tab 集合
const MAIN_TABS = ['/dashboard', '/students', '/attendance', '/points', '/more'];

function renderRoute() {
  const path = parseHash();
  currentPath = path;
  // 匹配：先精确，再前缀（如 /grades/e1）
  let route = routes[path];
  let param = null;
  if (!route) {
    for (const p in routes) {
      if (p.endsWith('/:id')) {
        const base = p.slice(0, -4);
        if (path.startsWith(base + '/')) {
          route = routes[p];
          param = decodeURIComponent(path.slice(base.length + 1));
          break;
        }
      }
    }
  }
  if (!route) { navigate('/dashboard'); return; }

  const view = document.getElementById('view');
  view.innerHTML = '';
  view.scrollTop = 0;
  window.scrollTo(0, 0);

  // 顶部栏
  const title = document.getElementById('topbarTitle');
  const back = document.getElementById('topbarBack');
  const action = document.getElementById('topbarAction');
  title.textContent = route.title || '班级管家';
  action.innerHTML = '';
  action.onclick = null;

  const isMain = MAIN_TABS.includes(path);
  back.classList.toggle('hidden', isMain);
  back.onclick = isMain ? null : () => history.back();

  // 底部导航高亮
  document.querySelectorAll('.tab').forEach(t => {
    const tab = t.dataset.tab;
    let active = path === '/' + tab;
    // 子页归属 more
    if (tab === 'more' && !isMain && !active) active = true;
    t.classList.toggle('active', active);
  });

  route.render(view, param);
}

export function startRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
