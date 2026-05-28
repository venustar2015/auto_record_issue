/**
 * 核心记录模块：处理 focus 时间锁定、摄像头优选、GPS 超时
 */

// 1. 时间记录器 (严格 focus 触发)
export class FocusTimeTracker {
    constructor(inputElement) {
      this.inputEl = inputElement;
      this.lockedTime = null;
      this.isLocked = false;
      this._bindFocus();
    }
  
    _bindFocus() {
      this.inputEl.addEventListener('focus', () => {
        if (!this.isLocked) {
          // 精确到毫秒的时间戳
          this.lockedTime = new Date().toISOString().replace('T', ' ').split('.')[0] + 
                            '.' + String(Date.now() % 1000).padStart(3, '0');
          this.isLocked = true;
          console.log(`[Time Locked] ${this.lockedTime}`);
        }
      });
    }
  
    /** @returns {string|null} 锁定的时间字符串 */
    getTimestamp() {
      return this.lockedTime;
    }
  }
  
  // 2. 摄像头优选逻辑
  export async function selectOptimalCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      if (videoDevices.length === 0) throw new Error('No camera devices found');
  
      // 过滤规则：排除 integrated，优先保留 USB 或 Camera 关键字
      const preferred = videoDevices.find(d => 
        !d.label.toLowerCase().includes('integrated') &&
        (d.label.toLowerCase().includes('usb') || d.label.toLowerCase().includes('camera'))
      );
  
      // 降级策略：首选不存在，则使用列表第一个
      const targetDevice = preferred || videoDevices[0];
  
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: targetDevice.deviceId }
      });
      return { stream, deviceLabel: targetDevice.label };
    } catch (error) {
      console.error('[Camera Error]', error);
      return { stream: null, deviceLabel: '无法获取图片' };
    }
  }
  
  // 3. GPS 定位 (5秒超时拦截)
  export async function getLocationWithTimeout(timeoutMs = 5000) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({ lat: null, lng: null, address: '未知', mapUrl: '' });
      }, timeoutMs);
  
      if (!navigator.geolocation) {
        clearTimeout(timeoutId);
        return resolve({ lat: null, lng: null, address: '未知', mapUrl: '' });
      }
  
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          // 预留反向地理编码接口，实际需调用地图 API
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          resolve({
            lat,
            lng,
            address: '待解析', // 框架阶段占位，后续接入 Geocoding API
            mapUrl: `https://uri.amap.com/marker?position=${lng},${lat}`
          });
        },
        (err) => {
          clearTimeout(timeoutId);
          resolve({ lat: null, lng: null, address: '未知', mapUrl: '' });
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    });
  }