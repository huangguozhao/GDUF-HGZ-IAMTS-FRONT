<template>
  <div class="file-upload-config">
    <div class="config-header">
      <h3 class="config-title">文件上传配置</h3>
      <div class="header-actions">
        <el-button type="primary" :icon="Setting" @click="showAdvancedConfig">
          高级设置
        </el-button>
        <el-button :icon="Refresh" @click="refreshConfig">
          刷新配置
        </el-button>
      </div>
    </div>

    <div class="config-content">
      <!-- 基础配置 -->
      <div class="config-section">
        <h4 class="section-title">基础配置</h4>
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">最大文件大小</label>
            <div class="input-with-unit">
              <el-input-number
                v-model="uploadConfig.maxFileSize"
                :min="1"
                :max="1024"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">MB</span>
            </div>
          </div>
          <div class="config-item">
            <label class="config-label">允许的文件类型</label>
            <el-select
              v-model="uploadConfig.allowedTypes"
              multiple
              placeholder="请选择允许的文件类型"
              style="width: 100%"
            >
              <el-option-group label="文档文件">
                <el-option label="PDF文件" value="pdf" />
                <el-option label="Word文档" value="doc" />
                <el-option label="Excel表格" value="xls" />
                <el-option label="PowerPoint演示" value="ppt" />
              </el-option-group>
              <el-option-group label="图片文件">
                <el-option label="JPEG图片" value="jpg" />
                <el-option label="PNG图片" value="png" />
                <el-option label="GIF图片" value="gif" />
                <el-option label="SVG矢量图" value="svg" />
              </el-option-group>
              <el-option-group label="压缩文件">
                <el-option label="ZIP压缩包" value="zip" />
                <el-option label="RAR压缩包" value="rar" />
                <el-option label="7Z压缩包" value="7z" />
              </el-option-group>
              <el-option-group label="其他文件">
                <el-option label="文本文件" value="txt" />
                <el-option label="JSON文件" value="json" />
                <el-option label="XML文件" value="xml" />
              </el-option-group>
            </el-select>
          </div>
          <div class="config-item">
            <label class="config-label">单次上传数量限制</label>
            <el-input-number
              v-model="uploadConfig.maxFilesCount"
              :min="1"
              :max="50"
              :precision="0"
              controls-position="right"
            />
          </div>
          <div class="config-item">
            <label class="config-label">文件存储路径</label>
            <div class="path-input">
              <el-input v-model="uploadConfig.storagePath" placeholder="/uploads/" />
              <el-button :icon="FolderOpened" @click="selectPath">
                浏览
              </el-button>
            </div>
          </div>
          <div class="config-item">
            <label class="config-label">文件名命名规则</label>
            <el-select v-model="uploadConfig.namingRule" style="width: 100%">
              <el-option label="原始文件名" value="original" />
              <el-option label="时间戳+随机数" value="timestamp" />
              <el-option label="UUID" value="uuid" />
              <el-option label="MD5哈希" value="md5" />
            </el-select>
          </div>
          <div class="config-item">
            <label class="config-label">是否压缩图片</label>
            <el-switch v-model="uploadConfig.compressImages" />
          </div>
        </div>
      </div>

      <!-- 安全配置 -->
      <div class="config-section">
        <h4 class="section-title">安全配置</h4>
        <div class="security-grid">
          <div class="security-item">
            <label class="security-label">启用文件扫描</label>
            <el-switch v-model="uploadConfig.enableVirusScan" />
            <span class="security-desc">上传文件时进行病毒扫描</span>
          </div>
          <div class="security-item">
            <label class="security-label">启用文件类型验证</label>
            <el-switch v-model="uploadConfig.enableTypeValidation" />
            <span class="security-desc">严格验证文件MIME类型</span>
          </div>
          <div class="security-item">
            <label class="security-label">启用内容检查</label>
            <el-switch v-model="uploadConfig.enableContentCheck" />
            <span class="security-desc">检查文件内容是否安全</span>
          </div>
          <div class="security-item">
            <label class="security-label">黑名单文件类型</label>
            <el-input
              v-model="uploadConfig.blockedTypes"
              placeholder="exe,bat,com等，用逗号分隔"
              style="width: 100%"
            />
          </div>
        </div>
      </div>

      <!-- 存储配置 -->
      <div class="config-section">
        <h4 class="section-title">存储配置</h4>
        <div class="storage-tabs">
          <el-tabs v-model="storageType" @tab-click="handleStorageTypeChange">
            <el-tab-pane label="本地存储" name="local">
              <div class="storage-config">
                <div class="storage-item">
                  <label class="storage-label">本地存储路径</label>
                  <div class="path-input">
                    <el-input v-model="storageConfig.local.path" placeholder="/var/uploads/" />
                    <el-button :icon="FolderOpened" @click="selectLocalPath">
                      浏览
                    </el-button>
                  </div>
                </div>
                <div class="storage-item">
                  <label class="storage-label">磁盘空间监控</label>
                  <el-switch v-model="storageConfig.local.monitorSpace" />
                </div>
                <div class="storage-item">
                  <label class="storage-label">空间告警阈值</label>
                  <div class="input-with-unit">
                    <el-input-number
                      v-model="storageConfig.local.alertThreshold"
                      :min="1"
                      :max="99"
                      :precision="0"
                      controls-position="right"
                    />
                    <span class="unit">%</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="云存储" name="cloud">
              <div class="storage-config">
                <div class="storage-item">
                  <label class="storage-label">云服务商</label>
                  <el-select v-model="storageConfig.cloud.provider" style="width: 100%">
                    <el-option label="阿里云OSS" value="aliyun" />
                    <el-option label="腾讯云COS" value="tencent" />
                    <el-option label="华为云OBS" value="huawei" />
                    <el-option label="AWS S3" value="aws" />
                    <el-option label="七牛云" value="qiniu" />
                  </el-select>
                </div>
                <div class="storage-item">
                  <label class="storage-label">Bucket名称</label>
                  <el-input v-model="storageConfig.cloud.bucket" placeholder="bucket-name" />
                </div>
                <div class="storage-item">
                  <label class="storage-label">Access Key</label>
                  <el-input
                    v-model="storageConfig.cloud.accessKey"
                    type="password"
                    placeholder="Access Key ID"
                  />
                </div>
                <div class="storage-item">
                  <label class="storage-label">Secret Key</label>
                  <el-input
                    v-model="storageConfig.cloud.secretKey"
                    type="password"
                    placeholder="Secret Access Key"
                  />
                </div>
                <div class="storage-item">
                  <label class="storage-label">地域</label>
                  <el-input v-model="storageConfig.cloud.region" placeholder="cn-hangzhou" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 上传统计 -->
      <div class="config-section">
        <h4 class="section-title">上传统计</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#409EFF"><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">今日上传</div>
              <div class="stat-value">{{ uploadStats.todayUploads }}</div>
              <div class="stat-unit">个文件</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#67C23A"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总文件数</div>
              <div class="stat-value">{{ uploadStats.totalFiles }}</div>
              <div class="stat-unit">个文件</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#E6A23C"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">占用空间</div>
              <div class="stat-value">{{ uploadStats.totalSize }}</div>
              <div class="stat-unit">GB</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#F56C6C"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">失败次数</div>
              <div class="stat-value">{{ uploadStats.failedUploads }}</div>
              <div class="stat-unit">次</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-buttons">
      <el-button type="primary" :icon="Document" @click="saveConfig">
        保存配置
      </el-button>
      <el-button :icon="Refresh" @click="resetConfig">
        重置
      </el-button>
    </div>

    <!-- 高级配置对话框 -->
    <el-dialog
      v-model="advancedDialogVisible"
      title="高级文件上传配置"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="advanced-config">
        <el-form :model="advancedConfig" label-width="140px">
          <el-form-item label="分块上传大小">
            <div class="input-with-unit">
              <el-input-number
                v-model="advancedConfig.chunkSize"
                :min="1"
                :max="100"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">MB</span>
            </div>
          </el-form-item>
          <el-form-item label="并发上传数量">
            <el-input-number
              v-model="advancedConfig.concurrentUploads"
              :min="1"
              :max="10"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="上传超时时间">
            <div class="input-with-unit">
              <el-input-number
                v-model="advancedConfig.uploadTimeout"
                :min="30"
                :max="300"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">秒</span>
            </div>
          </el-form-item>
          <el-form-item label="重试次数">
            <el-input-number
              v-model="advancedConfig.retryCount"
              :min="0"
              :max="5"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="图片压缩质量">
            <div class="input-with-unit">
              <el-input-number
                v-model="advancedConfig.imageQuality"
                :min="1"
                :max="100"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">%</span>
            </div>
          </el-form-item>
          <el-form-item label="临时文件清理">
            <el-switch v-model="advancedConfig.autoCleanTemp" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="advancedDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdvancedConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Setting,
  Refresh,
  Upload,
  Files,
  Box,
  Warning,
  Document,
  FolderOpened
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const storageType = ref('local')
const advancedDialogVisible = ref(false)

const uploadConfig = reactive({
  maxFileSize: 50,
  allowedTypes: ['pdf', 'doc', 'xls', 'jpg', 'png'],
  maxFilesCount: 10,
  storagePath: '/uploads/',
  namingRule: 'timestamp',
  compressImages: true,
  enableVirusScan: true,
  enableTypeValidation: true,
  enableContentCheck: false,
  blockedTypes: 'exe,bat,com,scr,pif'
})

const storageConfig = reactive({
  local: {
    path: '/var/uploads/',
    monitorSpace: true,
    alertThreshold: 80
  },
  cloud: {
    provider: 'aliyun',
    bucket: '',
    accessKey: '',
    secretKey: '',
    region: 'cn-hangzhou'
  }
})

const uploadStats = reactive({
  todayUploads: 156,
  totalFiles: 3247,
  totalSize: 12.5,
  failedUploads: 3
})

const advancedConfig = reactive({
  chunkSize: 10,
  concurrentUploads: 3,
  uploadTimeout: 120,
  retryCount: 3,
  imageQuality: 80,
  autoCleanTemp: true
})

// 方法
const showAdvancedConfig = () => {
  advancedDialogVisible.value = true
}

const refreshConfig = () => {
  ElMessage.success('配置已刷新')
}

const selectPath = () => {
  // 实现路径选择逻辑
  ElMessage.info('路径选择功能开发中')
}

const selectLocalPath = () => {
  // 实现本地路径选择逻辑
  ElMessage.info('路径选择功能开发中')
}

const handleStorageTypeChange = (tab) => {
  storageType.value = tab.props.name
}

const saveConfig = () => {
  // 保存配置逻辑
  ElMessage.success('配置保存成功')
}

const resetConfig = () => {
  // 重置配置逻辑
  ElMessage.info('配置已重置')
}

const saveAdvancedConfig = () => {
  advancedDialogVisible.value = false
  ElMessage.success('高级配置保存成功')
}

// 初始化
onMounted(() => {
  // 加载配置数据
})
</script>

<style scoped>
.file-upload-config {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.config-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
}

.path-input {
  display: flex;
  gap: 8px;
}

.security-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.security-label {
  min-width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.security-desc {
  font-size: 12px;
  color: #909399;
}

.storage-tabs {
  margin-top: 16px;
}

.storage-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.storage-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storage-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.stat-unit {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 24px;
}

.advanced-config {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
