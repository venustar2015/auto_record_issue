const fs = require('fs');
const path = require('path');

// 强制根路径（基于 server 运行目录）
const BASE_DIR = path.resolve(__dirname, '../../');
const WORKSPACE_DIR = path.join(BASE_DIR, 'workspace');
const ISSUE_DIR = path.join(BASE_DIR, 'issue');

/**
 * 初始化必需目录
 */
function initStorageDirs() {
  [WORKSPACE_DIR, ISSUE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

/**
 * [I/O] 写入记录数据
 * @param {string} workspaceName - 工作区名称
 * @param {string} dateTimeFolder - 格式 YYYYMMDD_HHmmss
 * @param {object} data - 记录 JSON 数据
 * @returns {string} 写入的文件绝对路径
 */
function saveRecord(workspaceName, dateTimeFolder, data) {
  const targetDir = path.join(ISSUE_DIR, workspaceName, dateTimeFolder);
  fs.mkdirSync(targetDir, { recursive: true });
  const filePath = path.join(targetDir, 'record.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

module.exports = { initStorageDirs, saveRecord, WORKSPACE_DIR, ISSUE_DIR };