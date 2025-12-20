import request from './request';

/**
 * 分页查询用户列表
 * @param {object} params - 查询参数
 * @param {string} [params.name] - 用户姓名模糊查询
 * @param {string} [params.email] - 用户邮箱模糊查询
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 */
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params,
  });
}

/**
 * 创建新用户
 * @param {object} data - 用户数据
 */
export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data,
  });
}

/**
 * 更新用户信息
 * @param {number} userId - 用户ID
 * @param {object} data - 用户数据
 */
export function updateUser(userId, data) {
  return request({
    url: `/users/${userId}`,
    method: 'put',
    data,
  });
}

/**
 * 更新用户状态
 * @param {number} userId - 用户ID
 * @param {object} data - 状态数据 { status }
 */
export function updateUserStatus(userId, data) {
  return request({
    url: `/users/${userId}/status`,
    method: 'put',
    data,
  });
}

/**
 * 删除用户
 * @param {number} userId - 用户ID
 */
export function deleteUser(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'delete',
  });
}

/**
 * 根据用户名或邮箱模糊查询用户
 * @param {string} keyword - 搜索关键词（用户名或邮箱）
 * @returns {Promise}
 */
export function searchUsers(keyword) {
  return request({
    url: '/users/search',
    method: 'get',
    params: {
      keyword: keyword || undefined,
    },
  });
}