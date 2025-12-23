<template>
  <el-dialog
    v-model="localVisible"
    title=""
    width="1000px"
    :close-on-click-modal="false"
    custom-class="env-config-dialog"
  >
    <div class="env-config-layout">
      <!-- 左侧环境列表 -->
      <div class="env-sidebar">
        <div class="env-sidebar-header">
          <input 
            v-model="localEnvSearchText" 
            type="text" 
            class="env-search-input" 
            placeholder="搜索环境..."
          />
        </div>

        <div class="env-sidebar-list">
          <!-- 环境列表 -->
          <div 
            v-for="(env, index) in envFormData.environments" 
            :key="index"
            class="env-sidebar-item"
            :class="{ 
              'is-active': currentEnvIndex === index,
              'is-default': env.is_default
            }"
          >
            <div class="env-item-content" @click="$emit('update:current-env-index', index)">
              <div class="env-item-name">{{ env.name || '未命名环境' }}</div>
              <div class="env-item-badges">
                <div class="env-item-badge" v-if="env.is_default">
                  <span class="badge-text">默认</span>
                </div>
                <div class="env-item-badge active" v-if="env.status === 'active'">
                  <span class="badge-text">运行中</span>
                </div>
              </div>
            </div>
            <div class="env-item-actions">
              <el-button 
                size="small" 
                text 
                type="danger"
                @click.stop="$emit('remove-environment', index)"
                :disabled="env.is_default || envFormData.environments.length <= 1 || !env.env_id"
                :title="env.is_default ? '默认环境不能删除' : envFormData.environments.length <= 1 ? '至少保留一个环境' : !env.env_id ? '未保存的环境不能删除' : '删除环境'"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="envFormData.environments.length === 0" class="env-empty-state">
            <div class="empty-icon">🌍</div>
            <div class="empty-text">暂无环境配置</div>
            <div class="empty-tip">点击下方按钮创建新环境</div>
          </div>
        </div>

        <div class="env-sidebar-footer">
          <button class="env-add-btn" @click="$emit('add-environment')">
            + 新建环境
          </button>
        </div>
      </div>

      <!-- 右侧环境详情 -->
      <div class="env-content" v-if="currentEnvironment">
        <div class="env-content-header">
          <h3 class="env-content-title">{{ currentEnvironment.name || '未命名环境' }}</h3>
          <el-button 
            size="small"
            @click="$emit('edit-environment-name')"
          >
            编辑
          </el-button>
        </div>

        <div class="env-content-body">
          <!-- 标签页 -->
          <div class="env-tabs">
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'basic' }"
              @click="$emit('update:env-active-tab', 'basic')"
            >
              基础配置
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'variables' }"
              @click="$emit('update:env-active-tab', 'variables')"
            >
              数据配置项
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'external' }"
              @click="$emit('update:env-active-tab', 'external')"
            >
              外部服务
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'settings' }"
              @click="$emit('update:env-active-tab', 'settings')"
            >
              环境变量
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'auth' }"
              @click="$emit('update:env-active-tab', 'auth')"
            >
              认证配置
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'switch' }"
              @click="$emit('update:env-active-tab', 'switch')"
            >
              功能开关
            </div>
            <div 
              class="env-tab-item" 
              :class="{ active: envActiveTab === 'monitoring' }"
              @click="$emit('update:env-active-tab', 'monitoring')"
            >
              部署信息
            </div>
          </div>

          <div class="env-tab-content">
            <!-- 仅保留基础和 variables 两个区域的展示逻辑 here as representative -->
            <div v-if="envActiveTab === 'basic'" class="env-form-section">
              <div class="form-group">
                <label class="form-label">环境编码 <span class="required">*</span></label>
                <el-input 
                  v-model="currentEnvironment.env_code" 
                  placeholder="ENV_DEV_001"
                  :disabled="currentEnvironment.env_id || currentEnvironment.envId"
                />
                <div class="form-tip">环境编码用于唯一标识环境，创建后不可修改</div>
              </div>

              <div class="form-group">
                <label class="form-label">环境名称 <span class="required">*</span></label>
                <el-input 
                  v-model="currentEnvironment.name" 
                  placeholder="开发环境"
                />
              </div>

              <div class="form-group">
                <label class="form-label">基础URL <span class="required">*</span></label>
                <el-input 
                  v-model="currentEnvironment.base_url" 
                  placeholder="https://dev.example.com"
                />
              </div>
            </div>

            <div v-else-if="envActiveTab === 'variables'" class="env-config-table-section">
              <div class="table-toolbar">
                <span class="toolbar-title">数据配置项</span>
                <el-button size="small" type="primary" @click="$emit('add-data-config')">
                  + 添加配置项
                </el-button>
              </div>
              <el-table :data="Array.isArray(currentEnvironment.dataConfigs) ? currentEnvironment.dataConfigs : []" border class="config-table">
                <el-table-column label="配置项名称" width="200">
                  <template #default="{ row }">
                    <el-input v-model="row.name" placeholder="配置项名称" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="配置值" width="250">
                  <template #default="{ row }">
                    <el-input v-model="row.value" placeholder="配置值" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="描述" min-width="200">
                  <template #default="{ row }">
                    <el-input v-model="row.description" placeholder="描述" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <el-button 
                      size="small" 
                      text 
                      type="danger"
                      @click="$emit('remove-data-config', $index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
                <template #empty>
                  <el-empty description="暂无数据配置项，点击上方'+ 添加配置项'按钮添加" :image-size="80" />
                </template>
              </el-table>
            </div>

            <!-- 其余选项卡按需由父组件控制或后续移入组件 -->
          </div>
        </div>
      </div>
      
      <!-- 右侧空状态 -->
      <div class="env-content env-content-empty" v-else>
        <div class="env-empty-content">
          <div class="empty-icon-large">🌐</div>
          <div class="empty-title">暂无环境配置</div>
          <div class="empty-description">请点击左侧'+ 新建环境'按钮创建环境配置</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="env-dialog-footer">
        <div class="env-footer-left">
          <el-button 
            v-if="envFormData.environments.length > 1"
            type="danger" 
            text
            @click="$emit('batch-delete')"
          >
            批量删除
          </el-button>
        </div>
        <div class="env-footer-right">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="$emit('save-environments')">
            保存配置
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  envFormData: { type: Object, required: true },
  currentEnvIndex: { type: Number, default: 0 },
  envActiveTab: { type: String, default: 'basic' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:modelValue',
  'add-environment',
  'remove-environment',
  'save-environments',
  'edit-environment-name',
  'batch-delete',
  'update:current-env-index',
  'update:env-active-tab',
  'add-data-config',
  'remove-data-config'
])

const localVisible = ref(props.modelValue)
watch(() => props.modelValue, v => localVisible.value = v)
watch(localVisible, v => emit('update:modelValue', v))

const localEnvSearchText = ref('')

const currentEnvironment = computed(() => {
  return props.envFormData?.environments?.[props.currentEnvIndex] || null
})

function close() {
  localVisible.value = false
}
</script>

<style scoped>
/* keep styles minimal here because parent has global styles; component uses same classnames */
</style>


