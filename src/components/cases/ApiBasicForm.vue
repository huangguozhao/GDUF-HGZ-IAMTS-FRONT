<template>
  <div v-if="visible" class="tab-content">
    <div class="basic-info-card" role="group" aria-label="接口基本信息卡片">
      <div class="form-section">
        <div class="section-title">所属项目</div>
        <el-select 
          v-model="apiData.projectId" 
          placeholder="请选择项目" 
          class="form-select"
          v-loading="projectsLoading"
          @change="onProjectChange"
        >
          <el-option 
            v-for="project in availableProjects" 
            :key="project.id"
            :label="project.name" 
            :value="project.id"
          />
        </el-select>
        <div class="form-tip" v-if="availableProjects.length === 0 && !projectsLoading">
          暂无可用项目
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">所属模块</div>
        <el-select 
          v-model="apiData.module" 
          placeholder="请选择模块" 
          class="form-select"
          v-loading="modulesLoading"
        >
          <el-option 
            v-for="module in availableModules" 
            :key="module.id"
            :label="module.name" 
            :value="module.name"
          >
            <span :style="{ paddingLeft: `${(module.level - 1) * 20}px` }">
              {{ module.level > 1 ? '└─ ' : '' }}{{ module.name }}
            </span>
          </el-option>
        </el-select>
        <div class="form-tip" v-if="availableModules.length === 0 && !modulesLoading">
          该项目下暂无模块
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">接口名称</div>
        <el-input v-model="apiData.name" placeholder="请输入接口名称" />
      </div>

      <div class="form-section">
        <div class="section-title">接口路径</div>
        <el-input v-model="apiData.path" placeholder="请输入接口路径" />
      </div>

      <div class="form-section">
        <div class="section-title">请求方法</div>
        <el-radio-group v-model="apiData.method">
          <el-radio label="GET">GET</el-radio>
          <el-radio label="POST">POST</el-radio>
          <el-radio label="PUT">PUT</el-radio>
          <el-radio label="DELETE">DELETE</el-radio>
        </el-radio-group>
      </div>

      <div class="form-section">
        <div class="section-title">接口描述</div>
        <el-input 
          v-model="apiData.description" 
          type="textarea"
          :rows="4"
          placeholder="请输入接口描述"
        />
      </div>

      <div class="form-section">
        <div class="section-title">标签</div>
        <div class="tag-list">
          <el-tag closable>用户管理</el-tag>
          <el-tag closable>信息更新</el-tag>
          <el-button size="small" text>+ 添加标签</el-button>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">前置条件</div>
        <el-input 
          v-model="apiData.precondition" 
          type="textarea"
          :rows="3"
          placeholder="请输入前置条件"
        />
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="$emit('save')">保存修改</el-button>
        <el-button @click="$emit('test')">执行测试</el-button>
        <el-button 
          type="danger" 
          :icon="Delete"
          @click="$emit('delete')"
          :loading="deleteLoading"
        >
          删除接口
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: true },
  apiData: { type: Object, required: true },
  availableProjects: { type: Array, default: () => [] },
  projectsLoading: { type: Boolean, default: false },
  availableModules: { type: Array, default: () => [] },
  modulesLoading: { type: Boolean, default: false },
  deleteLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['project-change', 'save', 'test', 'delete'])

const onProjectChange = (val) => {
  emit('project-change', val)
}
</script>

<style scoped>
/* keep minimal; visual styles are inherited from parent global styles */
.basic-info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.06);
}
</style>


