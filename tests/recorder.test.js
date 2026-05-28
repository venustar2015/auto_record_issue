/**
 * 单元测试用例：验证 recorder 模块核心逻辑，防止逻辑漂移
 * 运行命令: npx jest recorder.test.js
 */

// 模拟浏览器环境
global.navigator = {
    mediaDevices: {
      enumerateDevices: jest.fn(),
      getUserMedia: jest.fn()
    },
    geolocation: {
      getCurrentPosition: jest.fn()
    }
  };
  
  const { selectOptimalCamera, getLocationWithTimeout } = require('../client/js/modules/recorder');
  
  describe('Recorder Module', () => {
    beforeEach(() => jest.clearAllMocks());
  
    test('selectOptimalCamera 应优先选择不含 integrated 的 USB 摄像头', async () => {
      global.navigator.mediaDevices.enumerateDevices.mockResolvedValue([
        { kind: 'videoinput', label: 'Integrated Camera', deviceId: '1' },
        { kind: 'videoinput', label: '1080P USB Camera', deviceId: '2' }
      ]);
      global.navigator.mediaDevices.getUserMedia.mockResolvedValue({});
  
      const res = await selectOptimalCamera();
      expect(res.deviceLabel).toBe('1080P USB Camera');
      // 验证传入的 deviceId 是第2个
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { deviceId: '2' }
      });
    });
  
    test('getLocationWithTimeout 超过5秒应返回未知', async () => {
      jest.useFakeTimers();
      const promise = getLocationWithTimeout(5000);
      jest.advanceTimersByTime(5001);
      
      const result = await promise;
      expect(result.address).toBe('未知');
      jest.useRealTimers();
    });
  });