import '@testing-library/jest-dom';

// 전역 모의(mock) 설정
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});
