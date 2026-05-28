import { request } from './utils/api.js';
import { FocusTimeTracker, selectOptimalCamera, getLocationWithTimeout } from './modules/recorder.js';

export class App {
  constructor() {
    this.wsSelect = document.getElementById('ws-select');
    this.remarkInput = document.getElementById('remark-input');
    this.timeTracker = new FocusTimeTracker(this.remarkInput);
    this.currentView = 'detail';
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadWorkspaces();
    await this.loadRecords();
  }

  bindEvents() {
    document.getElementById('btn-new-ws').onclick = () => this.handleCreateWorkspace();
    this.wsSelect.onchange = (e) => this.handleWsChange(e.target.value);
    document.getElementById('btn-submit').onclick = () => this.submitRecord();
    document.getElementById('btn-detail').onclick = () => this.switchView('detail');
    document.getElementById('btn-thumb').onclick = () => this.switchView('thumb');

    // 实时更新锁定时间显示
    this.remarkInput.addEventListener('focus', () => {
      setTimeout(() => {
        document.getElementById('locked-time').textContent = `锁定时间: ${this.timeTracker.getTimestamp()}`;
      }, 50);
    });
  }

  async loadWorkspaces() {
    const res = await request('GET', '/api/workspaces');
    this.wsSelect.innerHTML = '<option value="">-- 选择工作区 --</option>';
    res.data.forEach(ws => {
      const opt = document.createElement('option');
      opt.value = ws.name; opt.textContent = ws.name;
      this.wsSelect.appendChild(opt);
    });
  }

  async handleCreateWorkspace() {
    const res = await request('POST', '/api/workspaces', {});
    await this.loadWorkspaces();
    this.showToast(`已创建: ${res.data.name}`, 'success');
  }

  async submitRecord() {
    const wsName = this.wsSelect.value;
    if (!wsName) return this.showToast('请先选择工作区', 'warning');
    const timestamp = this.timeTracker.getTimestamp();
    if (!timestamp) return this.showToast('请先聚焦备注框以锁定时间', 'warning');

    const [cam, gps] = await Promise.all([selectOptimalCamera(), getLocationWithTimeout(5000)]);
    document.getElementById('cam-status').textContent = `📷 摄像头: ${cam.deviceLabel}`;
    document.getElementById('gps-status').textContent = `📍 位置: ${gps.address}`;

    await request('POST', '/api/records', {
      workspace: wsName, timestamp, remark: this.remarkInput.value,
      camera: cam.deviceLabel, gps
    });
    this.showToast('记录已保存', 'success');
    this.remarkInput.value = '';
    await this.loadRecords();
  }

  async loadRecords() { /* 待后续对接扫描接口 */ }
  switchView(mode) {
    this.currentView = mode;
    document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
    document.getElementById(mode === 'detail' ? 'btn-detail' : 'btn-thumb').classList.add('active');
    this.renderRecords(); // 待实现
  }
  renderRecords() { /* 列表渲染逻辑 */ }
  showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`; t.textContent = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => new App());