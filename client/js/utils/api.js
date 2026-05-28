/**
 * [I/O] 统一 API 请求封装
 * @param {string} method - GET/POST/DELETE
 * @param {string} endpoint - 相对路径，如 /api/records
 * @param {object} [body] - 请求体
 * @returns {Promise<object>} JSON 响应
 */
export async function request(method, endpoint, body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
  
    try {
      const res = await fetch(endpoint, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    } catch (err) {
      console.error(`[API Error] ${method} ${endpoint}`, err);
      throw err;
    }
  }