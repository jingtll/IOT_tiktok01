
// 存储注册的用户
// 从 localStorage 中读取已注册的用户信息
const getRegisteredUsers = () => {
  const users = localStorage.getItem('registeredUsers');
  return users ? JSON.parse(users) : [];
};

// 保存注册的用户信息到 localStorage
const saveRegisteredUsers = (users) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

// 初始化已注册用户
let registeredUsers = getRegisteredUsers();

// 修改登录所需的用户名和密码
export const login = async (user) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // 直接硬编码验证，彻底排除变量问题
  const inputName = user.userName;
  const inputPwd = user.userPwd;

  // 检查是否为已注册用户
  const registeredUser = registeredUsers.find(u => u.userName === inputName && u.userPwd === inputPwd);

  // 强制打印最终验证值（二次确认）
  console.log('验证值对比：', {
    输入名称: inputName,
    输入密码: inputPwd,
    已注册用户: registeredUsers
  });

  // 最直接的判断逻辑
  if (registeredUser) {
    console.log('执行：登录成功分支');
    return {
      code: 0,
      message: '登录成功',
      data: { token: 'mock-token-123456', userId: '1001', userName: registeredUser.userName }
    };
  } else {
    console.log('执行：登录失败分支');
    return {
      code: 1,
      message: '用户名或密码错误'
    };
  }
};

// 添加注册API
export const register = async (user) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const { userName, userPwd } = user;

  // 检查用户名是否已存在
  const existingUser = registeredUsers.find(u => u.userName === userName);

  if (existingUser) {
    return {
      code: 1,
      message: '用户名已存在'
    };
  }

  // 注册新用户
  registeredUsers.push({ userName, userPwd });
  // 保存到 localStorage
  saveRegisteredUsers(registeredUsers);
  console.log('新用户注册成功：', { userName });
  console.log('当前注册用户：', registeredUsers);

  return {
    code: 0,
    message: '注册成功',
    data: { token: 'mock-token-123456', userId: '1001', userName: userName }
  };
};
