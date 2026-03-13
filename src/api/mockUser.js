// src/api/mockUser.js
export const login = async (user) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // 直接硬编码验证，彻底排除变量问题
  const inputName = user.userName;
  const inputPwd = user.userPwd;

  // 强制打印最终验证值（二次确认）
  console.log('验证值对比：', {
    输入名称: inputName,
    预期名称: 'admin',
    输入密码: inputPwd,
    预期密码: '123456',
    名称是否相等: inputName === 'admin',
    密码是否相等: inputPwd === '123456'
  });

  // 最直接的判断逻辑
  if (inputName === 'admin' && inputPwd === '123456') {
    console.log('执行：登录成功分支');
    return {
      code: 0,
      message: '登录成功',
      data: { token: 'mock-token-123456', userId: '1001' }
    };
  } else {
    console.log('执行：登录失败分支');
    return {
      code: 1,
      message: '用户名或密码错误'
    };
  }
};
