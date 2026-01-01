<template>
  <div class="case-detail-header">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">测试用例</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">{{ testCase?.caseCode || testCase?.case_code || testCase?.id || '未知用例' }}</span>
    </div>

    <!-- 用例标题 -->
    <div class="case-header">
      <div class="case-title-row">
        <h2 class="case-title">{{ testCase?.name || '未知用例' }}</h2>
        <el-tag v-if="testCase && !testCase.isEnabled" type="danger" size="small" class="disabled-tag">
          已禁用
        </el-tag>
      </div>
      <div class="case-actions">
        <el-button
          type="primary"
          size="default"
          :icon="CaretRight"
          :disabled="!testCase?.isEnabled"
          @click="$emit('execute')"
        >
          执行测试
        </el-button>
        <el-button
          size="default"
          :icon="Edit"
          @click="$emit('edit')"
        >
          编辑
        </el-button>
        <el-button
          size="default"
          :icon="CopyDocument"
          @click="$emit('copy')"
        >
          复制
        </el-button>
        <el-dropdown @command="$emit('more-action', $event)">
          <el-button size="default" :icon="MoreFilled">
            更多
        </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export" :icon="Download">
                导出用例
              </el-dropdown-item>
              <el-dropdown-item command="history" :icon="Clock">
                查看历史
              </el-dropdown-item>
              <el-dropdown-item command="share" :icon="Share">
                分享用例
              </el-dropdown-item>
              <el-dropdown-item
                v-if="testCase?.isEnabled"
                divided
                command="disable"
                :icon="CircleClose"
              >
                禁用用例
              </el-dropdown-item>
              <el-dropdown-item
                v-else
                divided
                command="enable"
                :icon="CircleCheck"
              >
                启用用例
              </el-dropdown-item>
              <el-dropdown-item command="delete" :icon="Delete">
                <span style="color: #f56c6c;">删除用例</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CaretRight, Edit, CopyDocument, MoreFilled, Download, Clock, Share, CircleClose, CircleCheck, Delete } from '@element-plus/icons-vue'

defineProps({
  testCase: {
    type: Object,
    default: () => null
  }
})

defineEmits(['execute', 'edit', 'copy', 'more-action'])
</script>

<style scoped>
.case-detail-header {
  margin-bottom: 24px;
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  cursor: default;
}

.breadcrumb-item.active {
  color: #409eff;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.case-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.case-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.disabled-tag {
  margin-left: 8px;
}

.case-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .case-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .case-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
