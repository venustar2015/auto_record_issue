const fs = require('fs');

/**
 * [I/O] 读取 XML 转为对象数组
 * @param {string} filePath - XML 文件路径
 * @returns {Array<object>} 解析后的工作区配置列表
 */
function readXml(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const xml = fs.readFileSync(filePath, 'utf-8');
  const blocks = xml.match(/<workspace>([\s\S]*?)<\/workspace>/g) || [];
  return blocks.map(block => {
    const obj = {};
    const tags = block.match(/<(\w+)>(.*?)<\/\1>/g) || [];
    tags.forEach(tag => {
      const [, key, val] = tag.match(/<(\w+)>(.*?)<\/\1>/);
      obj[key] = val;
    });
    return obj;
  });
}

/**
 * [I/O] 将对象数组写入 XML
 * @param {string} filePath - 目标路径
 * @param {Array<object>} data - 配置数据
 */
function writeXml(filePath, data) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<workspaces>\n';
  data.forEach(ws => {
    xml += '  <workspace>\n';
    Object.entries(ws).forEach(([k, v]) => xml += `    <${k}>${v}</${k}>\n`);
    xml += '  </workspace>\n';
  });
  xml += '</workspaces>';
  fs.writeFileSync(filePath, xml, 'utf-8');
}

module.exports = { readXml, writeXml };