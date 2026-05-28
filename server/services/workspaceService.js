const path = require('path');
const { WORKSPACE_DIR } = require('../utils/fileStorage');
const { readXml, writeXml } = require('../utils/xmlHelper');

const WS_FILE = path.join(WORKSPACE_DIR, 'workspaces.xml');
const DEFAULTS = {
  testName: '版本测试', vehicleModel: 'HG36-244#', tester: '测试科',
  driver: '宋涛', route: '武汉-恩施', trailer: '5#挂',
  load: '满载', version: 'V1.1.4', weather: '晴天'
};

/** @returns {Array<object>} 所有工作区 */
exports.getWorkspaces = () => readXml(WS_FILE);

/**
 * 创建新工作区
 * @param {object} input - 用户输入
 * @returns {object} 新工作区对象
 */
exports.createWorkspace = (input = {}) => {
  let workspaces = exports.getWorkspaces();
  let idx = 1, name = input.name || `工作区${idx}`;
  while (workspaces.some(w => w.name === name)) { idx++; name = `工作区${idx}`; }

  const newWs = { name, lastUsed: new Date().toISOString(), ...DEFAULTS, ...input };
  workspaces.push(newWs);
  writeXml(WS_FILE, workspaces);
  return newWs;
};

/**
 * 删除工作区及关联记忆
 * @param {string} name - 工作区名称
 */
exports.deleteWorkspace = (name) => {
  let workspaces = exports.getWorkspaces();
  const filtered = workspaces.filter(w => w.name !== name);
  if (filtered.length === workspaces.length) throw new Error('工作区不存在');
  writeXml(WS_FILE, filtered);
  // TODO: 后续可联动删除 ./issue/{name}/ 目录
};