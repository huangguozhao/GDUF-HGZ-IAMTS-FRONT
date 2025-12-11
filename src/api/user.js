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
