/**
 * HTML报告生成器
 * 独立文件避免Vue编译器误解析HTML标签
 */

export function generateHTMLReport(report, formatters) {
  const { formatEnvironment, formatReportType, formatDateTime, formatDuration, formatStatus } = formatters
  
  // 构建样式部分
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif; background: #f5f7fa; padding: 20px; color: #303133; }
    .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); }
    .header { background: #409eff; color: white; padding: 30px 40px; border-radius: 8px 8px 0 0; }
    .header h1 { font-size: 28px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
    .header h1::before { content: '📊'; font-size: 32px; }
    .header .subtitle { font-size: 16px; opacity: 0.95; margin-top: 8px; }
    .header .meta { display: flex; gap: 24px; margin-top: 16px; font-size: 14px; opacity: 0.9; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding: 30px 40px; background: #f8f9fa; border-bottom: 1px solid #e4e7ed; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e4e7ed; text-align: center; }
    .summary-card .icon-wrapper { width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .icon-success { background: #f0f9ff; color: #67c23a; }
    .icon-danger { background: #fef0f0; color: #f56c6c; }
    .icon-warning { background: #fdf6ec; color: #e6a23c; }
    .icon-info { background: #f4f4f5; color: #909399; }
    .icon-primary { background: #ecf5ff; color: #409eff; }
    .summary-card .label { font-size: 13px; color: #909399; margin-bottom: 8px; }
    .summary-card .value { font-size: 28px; font-weight: bold; color: #303133; }
    .value.success { color: #67c23a; }
    .value.danger { color: #f56c6c; }
    .value.warning { color: #e6a23c; }
    .value.primary { color: #409eff; }
    .content { padding: 30px 40px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #409eff; color: #303133; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #409eff; border-radius: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e4e7ed; border-radius: 4px; overflow: hidden; }
    .table th { background: #f5f7fa; padding: 12px 16px; text-align: left; font-weight: 600; color: #606266; border-bottom: 1px solid #e4e7ed; font-size: 14px; }
    .table td { padding: 12px 16px; border-bottom: 1px solid #e4e7ed; font-size: 14px; color: #606266; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover { background: #f5f7fa; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-success { background: #f0f9ff; color: #67c23a; border: 1px solid #c6e2ff; }
    .badge-danger { background: #fef0f0; color: #f56c6c; border: 1px solid #fde2e2; }
    .badge-warning { background: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; }
    .badge-info { background: #f4f4f5; color: #909399; border: 1px solid #e4e7ed; }
    .badge-primary { background: #ecf5ff; color: #409eff; border: 1px solid #b3d8ff; }
    .progress-wrapper { margin: 20px 0; }
    .progress-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .progress-label .label { color: #606266; font-weight: 500; }
    .progress-label .value { color: #67c23a; font-weight: bold; }
    .progress-bar { width: 100%; height: 20px; background: #e4e7ed; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .stat-item { padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #409eff; }
    .stat-item .stat-label { font-size: 13px; color: #909399; margin-bottom: 8px; }
    .stat-item .stat-value { font-size: 24px; font-weight: bold; color: #303133; }
    .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; color: #909399; font-size: 13px; border-top: 1px solid #e4e7ed; }
    .footer p { margin: 4px 0; }
    .charts-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .chart-row { display: flex; gap: 20px; margin-bottom: 20px; }
    .chart-row:last-child { margin-bottom: 0; }
    .chart-box { flex: 1; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
    .chart-box-title { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e4e7ed; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
  `
  
  // 构建HTML内容
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.reportName} - 测试报告</title>
  <style>${styles}</style>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${report.reportName}</h1>
      <div class="subtitle">项目: ${report.projectName || '未知项目'}</div>
      <div class="meta">
        <span>🏷️ ${formatReportType(report.reportType)}</span>
        <span>🌍 ${formatEnvironment(report.environment)}</span>
        <span>📅 ${formatDateTime(report.startTime)}</span>
        <span>⏱️ 耗时: ${formatDuration(report.duration)}</span>
      </div>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <div class="icon-wrapper icon-success">✓</div>
        <div class="label">通过用例</div>
        <div class="value success">${report.passedCases || 0}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper icon-danger">✗</div>
        <div class="label">失败用例</div>
        <div class="value danger">${report.failedCases || 0}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper icon-danger">!</div>
        <div class="label">异常用例</div>
        <div class="value danger">${report.brokenCases || 0}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper icon-warning">⊘</div>
        <div class="label">跳过用例</div>
        <div class="value warning">${report.skippedCases || 0}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper icon-info">∑</div>
        <div class="label">总用例数</div>
        <div class="value">${report.totalCases || 0}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper icon-primary">★</div>
        <div class="label">成功率</div>
        <div class="value ${parseFloat(report.successRate) >= 80 ? 'success' : 'danger'}">${report.successRate}%</div>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 class="section-title">数据可视化</h2>
        <div class="charts-container">
          <div class="chart-row">
            <div class="chart-box">
              <div class="chart-box-title">测试用例分布</div>
              <div id="pieChart" style="width: 100%; height: 350px;"></div>
            </div>
            <div class="chart-box">
              <div class="chart-box-title">成功率仪表盘</div>
              <div id="gaugeChart" style="width: 100%; height: 350px;"></div>
            </div>
          </div>
          <div class="chart-row">
            <div class="chart-box" style="width: 100%;">
              <div class="chart-box-title">测试结果统计</div>
              <div id="barChart" style="width: 100%; height: 350px;"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">基本信息</h2>
        <table class="table">
          <tr><th style="width: 20%;">报告ID</th><td>${report.reportId}</td><th style="width: 20%;">报告名称</th><td>${report.reportName}</td></tr>
          <tr><th>项目名称</th><td>${report.projectName || '-'}</td><th>报告类型</th><td><span class="badge badge-primary">${formatReportType(report.reportType)}</span></td></tr>
          <tr><th>测试环境</th><td><span class="badge badge-info">${formatEnvironment(report.environment)}</span></td><th>报告状态</th><td><span class="badge badge-${report.reportStatus === 'completed' ? 'success' : 'warning'}">${formatStatus(report.reportStatus)}</span></td></tr>
          <tr><th>开始时间</th><td>${formatDateTime(report.startTime)}</td><th>结束时间</th><td>${formatDateTime(report.endTime)}</td></tr>
          <tr><th>执行耗时</th><td><span class="badge badge-info">${formatDuration(report.duration)}</span></td><th>文件格式</th><td>${report.fileFormat || 'HTML'}</td></tr>
          <tr><th>生成人</th><td>${report.generatorName || '系统'}</td><th>生成时间</th><td>${formatDateTime(report.createdAt)}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">测试统计</h2>
        <div class="progress-wrapper">
          <div class="progress-label">
            <span class="label">测试成功率</span>
            <span class="value">${report.successRate}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${report.successRate}%">${report.successRate}%</div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">📋 总用例数</div>
            <div class="stat-value">${report.totalCases || 0}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">▶️ 已执行</div>
            <div class="stat-value">${report.executedCases || 0}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">⏸️ 未执行</div>
            <div class="stat-value">${(report.totalCases || 0) - (report.executedCases || 0)}</div>
          </div>
        </div>
        
        <table class="table" style="margin-top: 20px;">
          <thead>
            <tr><th>状态</th><th style="text-align: center;">数量</th><th style="text-align: center;">占比</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge badge-success">✓ 通过</span></td>
              <td style="text-align: center;"><strong>${report.passedCases || 0}</strong></td>
              <td style="text-align: center;">${report.totalCases > 0 ? ((report.passedCases || 0) / report.totalCases * 100).toFixed(2) : 0}%</td>
              <td>测试用例执行通过</td>
            </tr>
            <tr>
              <td><span class="badge badge-danger">✗ 失败</span></td>
              <td style="text-align: center;"><strong>${report.failedCases || 0}</strong></td>
              <td style="text-align: center;">${report.totalCases > 0 ? ((report.failedCases || 0) / report.totalCases * 100).toFixed(2) : 0}%</td>
              <td>测试用例执行失败</td>
            </tr>
            <tr>
              <td><span class="badge badge-danger">! 异常</span></td>
              <td style="text-align: center;"><strong>${report.brokenCases || 0}</strong></td>
              <td style="text-align: center;">${report.totalCases > 0 ? ((report.brokenCases || 0) / report.totalCases * 100).toFixed(2) : 0}%</td>
              <td>测试用例执行异常</td>
            </tr>
            <tr>
              <td><span class="badge badge-warning">⊘ 跳过</span></td>
              <td style="text-align: center;"><strong>${report.skippedCases || 0}</strong></td>
              <td style="text-align: center;">${report.totalCases > 0 ? ((report.skippedCases || 0) / report.totalCases * 100).toFixed(2) : 0}%</td>
              <td>测试用例被跳过</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>报告生成时间:</strong> ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
      <p>接口自动化管理系统 (API AutoOps) - 测试报告</p>
      <p style="margin-top: 8px; font-size: 12px;">本报告由系统自动生成，数据仅供参考</p>
    </div>
  </div>
  
  <script>
    window.addEventListener('load', function() {
      var pieChart = echarts.init(document.getElementById('pieChart'));
      pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 14 } },
        series: [{
          name: '测试用例', type: 'pie', radius: ['40%', '70%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {c}' },
          data: [
            { value: ${report.passedCases || 0}, name: '通过', itemStyle: { color: '#67c23a' } },
            { value: ${report.failedCases || 0}, name: '失败', itemStyle: { color: '#f56c6c' } },
            { value: ${report.brokenCases || 0}, name: '异常', itemStyle: { color: '#e6a23c' } },
            { value: ${report.skippedCases || 0}, name: '跳过', itemStyle: { color: '#909399' } }
          ]
        }]
      });
      
      var gaugeChart = echarts.init(document.getElementById('gaugeChart'));
      var successRate = ${parseFloat(report.successRate || 0)};
      gaugeChart.setOption({
        series: [{
          type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100, splitNumber: 10,
          itemStyle: { color: successRate >= 80 ? '#67c23a' : successRate >= 60 ? '#e6a23c' : '#f56c6c' },
          progress: { show: true, width: 30 },
          pointer: { show: false },
          axisLine: { lineStyle: { width: 30, color: [[1, '#e5e5e5']] } },
          axisTick: { distance: -38, splitNumber: 5, lineStyle: { width: 2, color: '#999' } },
          splitLine: { distance: -45, length: 14, lineStyle: { width: 3, color: '#999' } },
          axisLabel: { distance: -20, color: '#999', fontSize: 14 },
          detail: { valueAnimation: true, fontSize: 50, fontWeight: 'bold', formatter: '{value}%', offsetCenter: [0, '0%'] },
          data: [{ value: successRate }]
        }]
      });
      
      var barChart = echarts.init(document.getElementById('barChart'));
      barChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['总用例数', '已执行', '通过', '失败', '异常', '跳过'], axisLabel: { fontSize: 14 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 14 } },
        series: [{
          name: '数量', type: 'bar', barWidth: '40%',
          data: [
            { value: ${report.totalCases || 0}, itemStyle: { color: '#409eff' } },
            { value: ${report.executedCases || 0}, itemStyle: { color: '#409eff' } },
            { value: ${report.passedCases || 0}, itemStyle: { color: '#67c23a' } },
            { value: ${report.failedCases || 0}, itemStyle: { color: '#f56c6c' } },
            { value: ${report.brokenCases || 0}, itemStyle: { color: '#e6a23c' } },
            { value: ${report.skippedCases || 0}, itemStyle: { color: '#909399' } }
          ],
          label: { show: true, position: 'top', fontSize: 14, fontWeight: 'bold' },
          itemStyle: { borderRadius: [8, 8, 0, 0] }
        }]
      });
      
      window.addEventListener('resize', function() {
        pieChart.resize();
        gaugeChart.resize();
        barChart.resize();
      });
    });
  </script>
</body>
</html>
  `
  
  return html
}

