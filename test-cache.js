/**
 * 缓存功能测试脚本
 * 用于验证HTTP缓存头是否正确设置
 */

import http from 'http'
import https from 'https'

/**
 * 发送HTTP请求并检查响应头
 * @param {string} url - 请求URL
 * @returns {Promise<object>} 响应头信息
 */
function checkCacheHeaders(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https://') ? https : http

    const req = protocol.get(url, (res) => {
      const headers = res.headers
      const statusCode = res.statusCode

      resolve({
        url,
        statusCode,
        headers: {
          'cache-control': headers['cache-control'],
          'pragma': headers['pragma'],
          'expires': headers['expires'],
          'content-type': headers['content-type'],
          'last-modified': headers['last-modified'],
          'etag': headers['etag']
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * 分析缓存头并给出建议
 * @param {object} response - 响应对象
 * @param {string} expectedStrategy - 期望的缓存策略
 * @returns {object} 分析结果
 */
function analyzeCacheHeaders(response, expectedStrategy) {
  const { url, statusCode, headers } = response
  const result = {
    url,
    statusCode,
    valid: true,
    messages: [],
    recommendations: []
  }

  // 检查状态码
  if (statusCode !== 200) {
    result.valid = false
    result.messages.push(`HTTP状态码异常: ${statusCode}`)
    return result
  }

  const cacheControl = headers['cache-control'] || ''

  // 根据资源类型判断期望的缓存策略
  let actualExpectedStrategy = expectedStrategy

  if (!actualExpectedStrategy) {
    if (url.endsWith('.html') || url === '/' || url.includes('index.html')) {
      actualExpectedStrategy = 'HTML'
    } else if (url.endsWith('.js')) {
      actualExpectedStrategy = 'JAVASCRIPT'
    } else if (url.endsWith('.css')) {
      actualExpectedStrategy = 'CSS'
    } else if (/\.(png|jpg|jpeg|gif|ico|svg)$/.test(url)) {
      actualExpectedStrategy = 'IMAGES'
    } else if (/\.(woff|woff2|ttf|eot)$/.test(url)) {
      actualExpectedStrategy = 'FONTS'
    } else if (url.includes('/api/')) {
      actualExpectedStrategy = 'API'
    }
  }

  // 验证缓存头
  switch (actualExpectedStrategy) {
    case 'HTML':
      if (!cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
        result.valid = false
        result.messages.push('HTML文件应该设置no-cache或no-store')
        result.recommendations.push('为HTML文件添加Cache-Control: no-cache, no-store, must-revalidate')
      } else {
        result.messages.push('✓ HTML文件缓存策略正确')
      }
      break

    case 'JAVASCRIPT':
    case 'CSS':
      if (!cacheControl.includes('max-age=') && !cacheControl.includes('immutable')) {
        result.valid = false
        result.messages.push(`${actualExpectedStrategy}文件应该设置长期缓存`)
        result.recommendations.push(`为${actualExpectedStrategy}文件添加Cache-Control: public, max-age=31536000, immutable`)
      } else {
        result.messages.push(`✓ ${actualExpectedStrategy}文件缓存策略正确`)
      }
      break

    case 'IMAGES':
      if (!cacheControl.includes('max-age=')) {
        result.valid = false
        result.messages.push('图片文件应该设置缓存时间')
        result.recommendations.push('为图片文件添加Cache-Control: public, max-age=2592000')
      } else {
        result.messages.push('✓ 图片文件缓存策略正确')
      }
      break

    case 'API':
      if (!cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
        result.valid = false
        result.messages.push('API请求应该设置为不缓存')
        result.recommendations.push('为API请求添加Cache-Control: no-cache, no-store, must-revalidate')
      } else {
        result.messages.push('✓ API请求缓存策略正确')
      }
      break

    default:
      result.messages.push('未知资源类型，使用默认缓存策略')
  }

  // 检查其他有用的头
  if (headers['last-modified'] && headers['etag']) {
    result.messages.push('✓ 同时设置了Last-Modified和ETag头')
  }

  return result
}

/**
 * 运行缓存测试
 */
async function runCacheTests() {
  console.log('🚀 开始HTTP缓存功能测试...\n')

  const baseUrl = 'http://localhost:5175'
  const testUrls = [
    '/', // HTML文件
    '/src/assets/ui-utils.css', // CSS文件
    '/src/main.js', // JavaScript文件
    '/favicon.ico', // 图标文件
    // API请求（如果有的话）
    // '/api/some-endpoint'
  ]

  const results = []

  for (const path of testUrls) {
    const url = baseUrl + path
    try {
      console.log(`📡 测试: ${url}`)
      const response = await checkCacheHeaders(url)
      const analysis = analyzeCacheHeaders(response)

      results.push(analysis)

      console.log(`   状态码: ${response.statusCode}`)
      console.log(`   Cache-Control: ${response.headers['cache-control'] || '未设置'}`)
      console.log(`   分析结果: ${analysis.valid ? '✅ 通过' : '❌ 失败'}`)

      analysis.messages.forEach(msg => console.log(`   ${msg}`))
      if (analysis.recommendations.length > 0) {
        console.log('   📋 建议:')
        analysis.recommendations.forEach(rec => console.log(`      - ${rec}`))
      }
      console.log('')

    } catch (error) {
      console.error(`❌ 测试失败: ${url}`)
      console.error(`   错误: ${error.message}\n`)

      results.push({
        url,
        valid: false,
        messages: [`请求失败: ${error.message}`],
        recommendations: ['检查服务器是否正在运行', '检查URL是否正确']
      })
    }
  }

  // 汇总结果
  console.log('📊 测试结果汇总:')
  console.log('='.repeat(50))

  const validCount = results.filter(r => r.valid).length
  const totalCount = results.length

  console.log(`✅ 通过: ${validCount}/${totalCount}`)
  console.log(`❌ 失败: ${totalCount - validCount}/${totalCount}`)

  if (validCount === totalCount) {
    console.log('\n🎉 所有缓存测试通过！HTTP缓存功能配置正确。')
  } else {
    console.log('\n⚠️  部分测试失败，请根据上述建议调整配置。')
  }

  return results
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runCacheTests().catch(console.error)
}

export {
  checkCacheHeaders,
  analyzeCacheHeaders,
  runCacheTests
}
