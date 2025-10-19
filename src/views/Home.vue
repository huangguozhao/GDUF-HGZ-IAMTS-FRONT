<template>
  <div class="home-page">
    <div class="welcome-section">
      <h2 class="welcome-title">您好,张工程师,欢迎回来!</h2>
      <p class="current-date">{{ currentDate }}</p>
    </div>
    
    <div class="summary-section">
      <div class="summary-text">
        您有5个待处理任务,2个高优先级问题待解决
      </div>
      <div class="summary-cards">
        <el-card class="summary-card">
          <div class="card-content">
            <div class="card-title">总用例数</div>
            <div class="card-value">587</div>
            <div class="card-change positive">+12</div>
          </div>
        </el-card>
        <el-card class="summary-card">
          <div class="card-content">
            <div class="card-title">测试通过率</div>
            <div class="card-value">92.7%</div>
            <div class="card-change positive">+1.5%</div>
          </div>
        </el-card>
        <el-card class="summary-card">
          <div class="card-content">
            <div class="card-title">活跃项目</div>
            <div class="card-value">14</div>
            <div class="card-change">+0</div>
          </div>
        </el-card>
        <el-card class="summary-card">
          <div class="card-content">
            <div class="card-title">接口覆盖率</div>
            <div class="card-value">86.3%</div>
            <div class="card-change positive">+0.8%</div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="content-grid">
      <div class="left-section">
        <div class="section-header">
          <h3>最近编辑的项目</h3>
          <el-link href="#" class="view-all-link">查看全部</el-link>
        </div>
        <div class="project-list">
          <el-card class="project-card">
            <div class="project-content">
              <div class="project-title">电商支付系统</div>
              <div class="project-desc">支付接口与退款流程自动化测试</div>
              <div class="project-date">2024-03-10 14:30</div>
              <div class="project-progress">
                <el-progress :percentage="80" color="#67c23a" />
                <span class="progress-label">测试覆盖率</span>
              </div>
              <div class="project-tags">
                <el-tag size="small" type="success">支付</el-tag>
                <el-tag size="small" type="info">电商</el-tag>
              </div>
            </div>
          </el-card>
          <el-card class="project-card">
            <div class="project-content">
              <div class="project-title">用户中心系统</div>
              <div class="project-desc">用户注册、登录、权限管理接口测试</div>
              <div class="project-date">2024-03-09 11:20</div>
              <div class="project-progress">
                <el-progress :percentage="65" color="#409eff" />
                <span class="progress-label">测试覆盖率</span>
              </div>
              <div class="project-tags">
                <el-tag size="small" type="primary">用户</el-tag>
                <el-tag size="small" type="warning">权限</el-tag>
              </div>
            </div>
          </el-card>
          <el-card class="project-card">
            <div class="project-content">
              <div class="project-title">物流管理平台</div>
              <div class="project-desc">订单追踪与配送状态更新接口测试</div>
              <div class="project-date">2024-03-08 16:45</div>
              <div class="project-progress">
                <el-progress :percentage="42" color="#e6a23c" />
                <span class="progress-label">测试覆盖率</span>
              </div>
              <div class="project-tags">
                <el-tag size="small" type="warning">物流</el-tag>
                <el-tag size="small" type="info">订单</el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="right-section">
        <div class="section-header">
          <h3>近七天测试执行情况</h3>
          <el-select v-model="timeRange" placeholder="最近7天" size="small">
            <el-option label="最近7天" value="7days" />
            <el-option label="最近30天" value="30days" />
          </el-select>
        </div>
        <div class="chart-section">
          <div class="chart-placeholder">
            <p>测试执行趋势图</p>
            <p class="chart-desc">本周测试通过率提升3.2%,性能表现稳定</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-grid">
      <div class="bottom-left">
        <h3>系统资源状态</h3>
        <div class="resource-list">
          <div class="resource-item">
            <div class="resource-label">CPU使用率</div>
            <div class="resource-value">28%</div>
            <div class="resource-chart cpu-chart"></div>
          </div>
          <div class="resource-item">
            <div class="resource-label">内存使用率</div>
            <div class="resource-value">45%</div>
            <div class="resource-chart memory-chart"></div>
          </div>
          <div class="resource-item">
            <div class="resource-label">磁盘空间</div>
            <div class="resource-value">62%</div>
            <div class="resource-chart disk-chart"></div>
          </div>
        </div>
      </div>

      <div class="bottom-right">
        <div class="section-header">
          <h3>最近活动</h3>
          <el-link href="#" class="view-more-link">查看更多</el-link>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-time">10:30</div>
            <div class="activity-content">
              <div class="activity-title">API接口自动化测试执行</div>
              <div class="activity-desc">成功执行了支付系统的20个测试用例</div>
              <div class="activity-origin">系统自动</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-time">09:15</div>
            <div class="activity-content">
              <div class="activity-title">新建测试用例</div>
              <div class="activity-desc">用户中心-权限校验接口测试用例</div>
              <div class="activity-origin">李测试</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-time">昨天</div>
            <div class="activity-content">
              <div class="activity-title">系统部署更新</div>
              <div class="activity-desc">自动化测试引擎升级至v2.4.5</div>
              <div class="activity-origin">系统管理员</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-time">昨天</div>
            <div class="activity-content">
              <div class="activity-title">接口变更检测</div>
              <div class="activity-desc">检测到用户服务3个接口参数变更</div>
              <div class="activity-origin">变更监控</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-time">3天前</div>
            <div class="activity-content">
              <div class="activity-title">定时测试任务执行失败</div>
              <div class="activity-desc">物流系统接口连接超时</div>
              <div class="activity-origin">系统自动</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentDate = ref('2024年3月11日 星期一')
const timeRange = ref('7days')
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.current-date {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.summary-section {
  margin-bottom: 30px;
}

.summary-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  text-align: center;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.card-change {
  font-size: 12px;
  color: #909399;
}

.card-change.positive {
  color: #67c23a;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.view-all-link, .view-more-link {
  font-size: 14px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.project-card {
  margin-bottom: 0;
}

.project-content {
  padding: 15px;
}

.project-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.project-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.project-date {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.project-progress {
  margin-bottom: 10px;
}

.progress-label {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.project-tags {
  display: flex;
  gap: 5px;
}

.chart-section {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.chart-desc {
  font-size: 14px;
  margin-top: 10px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.bottom-left h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.resource-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.resource-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  min-width: 50px;
}

.resource-chart {
  flex: 1;
  height: 20px;
  border-radius: 10px;
  background: #f0f0f0;
}

.cpu-chart {
  background: linear-gradient(90deg, #67c23a 28%, #f0f0f0 28%);
}

.memory-chart {
  background: linear-gradient(90deg, #409eff 45%, #f0f0f0 45%);
}

.disk-chart {
  background: linear-gradient(90deg, #e6a23c 62%, #f0f0f0 62%);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  min-width: 50px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.activity-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
}

.activity-origin {
  font-size: 12px;
  color: #909399;
}
</style>
