<template>
  <div v-if="visible" class="tab-content params-content">
    <div class="params-card" role="region" aria-label="请求参数卡片">
      <div class="params-header">
        <h3 class="params-title">Headers</h3>
      </div>
      <el-table 
        :data="headerParams"
        class="params-table"
        border
      >
        <el-table-column label="参数名" width="200">
          <template #default="{ row, $index }">
            <el-input v-model="localHeaderParams[$index].name" placeholder="参数名" size="small" @input="emitHeaderUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="参数值" width="200">
          <template #default="{ row, $index }">
            <el-input v-model="localHeaderParams[$index].value" placeholder="参数值" size="small" @input="emitHeaderUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="参数描述">
          <template #default="{ row, $index }">
            <el-input v-model="localHeaderParams[$index].description" placeholder="参数描述" size="small" @input="emitHeaderUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row, $index }">
            <el-button size="small" text type="danger" @click="removeHeader($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="add-param-btn">
        <el-button size="small" @click="addHeader">+ 添加参数</el-button>
      </div>

      <div class="params-header">
        <h3 class="params-title">Params</h3>
      </div>
      <el-table 
        :data="queryParams"
        class="params-table"
        border
      >
        <el-table-column label="参数名" width="200">
          <template #default="{ row, $index }">
            <el-input v-model="localQueryParams[$index].name" placeholder="参数名" size="small" @input="emitQueryUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="参数值" width="200">
          <template #default="{ row, $index }">
            <el-input v-model="localQueryParams[$index].value" placeholder="参数值" size="small" @input="emitQueryUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="参数描述">
          <template #default="{ row, $index }">
            <el-input v-model="localQueryParams[$index].description" placeholder="参数描述" size="small" @input="emitQueryUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row, $index }">
            <el-button size="small" text type="danger" @click="removeQuery($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="add-param-btn">
        <el-button size="small" @click="addQuery">+ 添加参数</el-button>
      </div>

      <div class="params-header params-header--with-controls">
        <h3 class="params-title">Body</h3>
        <el-radio-group v-model="localBodyType" size="small" class="body-type-selector" role="tablist" aria-label="请求体类型" @change="emitBodyType">
          <el-radio-button label="json" role="tab">JSON</el-radio-button>
          <el-radio-button label="form-data" role="tab">form-data</el-radio-button>
          <el-radio-button label="raw" role="tab">raw</el-radio-button>
        </el-radio-group>
      </div>

      <div class="collapsible-card">
        <div class="collapsible-toggle" role="button" tabindex="0" @click="toggleBodyCollapsed" @keydown.enter.prevent="toggleBodyCollapsed" :aria-expanded="!localBodyCollapsed">
          <div class="collapsible-left">请求体预览</div>
          <div class="collapsible-right">
            <span class="small-muted">{{ localBodyType.toUpperCase() }}</span>
            <svg class="collapse-icon" width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div v-if="localBodyType === 'json'" class="body-section">
        <el-table :data="localBodyParams" class="params-table" border>
          <el-table-column label="变量名" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="localBodyParams[$index].name" placeholder="变量名" size="small" @input="emitBodyParams" />
            </template>
          </el-table-column>
          <el-table-column label="变量值" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="localBodyParams[$index].value" placeholder="变量值" size="small" @input="emitBodyParams" />
            </template>
          </el-table-column>
          <el-table-column label="变量描述">
            <template #default="{ row, $index }">
              <el-input v-model="localBodyParams[$index].description" placeholder="变量描述" size="small" @input="emitBodyParams" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row, $index }">
              <el-button size="small" text type="danger" @click="removeBody($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-param-btn">
          <el-button size="small" @click="addBody">+ 添加变量</el-button>
        </div>
      </div>

      <div v-else-if="localBodyType === 'raw'" class="body-section">
        <el-input v-model="localRawBody" type="textarea" :rows="10" @input="emitRawBody" />
      </div>

      <div v-else-if="localBodyType === 'form-data'" class="body-section">
        <el-table :data="localFormDataParams" class="params-table" border>
          <el-table-column label="参数名" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="localFormDataParams[$index].name" placeholder="参数名" size="small" @input="emitFormDataParams" />
            </template>
          </el-table-column>
          <el-table-column label="参数值" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="localFormDataParams[$index].value" placeholder="参数值" size="small" @input="emitFormDataParams" />
            </template>
          </el-table-column>
          <el-table-column label="参数描述">
            <template #default="{ row, $index }">
              <el-input v-model="localFormDataParams[$index].description" placeholder="参数描述" size="small" @input="emitFormDataParams" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row, $index }">
              <el-button size="small" text type="danger" @click="removeFormData($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-param-btn">
          <el-button size="small" @click="addFormData">+ 添加参数</el-button>
        </div>
      </div>

      <div class="params-actions">
        <el-button type="primary" @click="$emit('save-params')">保存</el-button>
        <el-button @click="$emit('format-params')">格式化</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRaw } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: true },
  headerParams: { type: Array, default: () => [] },
  queryParams: { type: Array, default: () => [] },
  bodyParams: { type: Array, default: () => [] },
  formDataParams: { type: Array, default: () => [] },
  rawBody: { type: String, default: '' },
  bodyType: { type: String, default: 'json' },
  bodyCollapsed: { type: Boolean, default: false }
})
const emit = defineEmits(['update:headerParams','update:queryParams','update:bodyParams','update:formDataParams','update:rawBody','update:bodyType','update:bodyCollapsed','save-params','format-params'])

// local copies to allow editing then emit updates
const localHeaderParams = ref(JSON.parse(JSON.stringify(props.headerParams || [])))
const localQueryParams = ref(JSON.parse(JSON.stringify(props.queryParams || [])))
const localBodyParams = ref(JSON.parse(JSON.stringify(props.bodyParams || [])))
const localFormDataParams = ref(JSON.parse(JSON.stringify(props.formDataParams || [])))
const localRawBody = ref(props.rawBody || '')
const localBodyType = ref(props.bodyType || 'json')
const localBodyCollapsed = ref(props.bodyCollapsed || false)

watch(() => props.headerParams, (v) => localHeaderParams.value = JSON.parse(JSON.stringify(v || [])), { deep: true })
watch(() => props.queryParams, (v) => localQueryParams.value = JSON.parse(JSON.stringify(v || [])), { deep: true })
watch(() => props.bodyParams, (v) => localBodyParams.value = JSON.parse(JSON.stringify(v || [])), { deep: true })
watch(() => props.formDataParams, (v) => localFormDataParams.value = JSON.parse(JSON.stringify(v || [])), { deep: true })
watch(() => props.rawBody, (v) => localRawBody.value = v || '')
watch(() => props.bodyType, (v) => localBodyType.value = v || 'json')
watch(() => props.bodyCollapsed, (v) => localBodyCollapsed.value = !!v)

const emitHeaderUpdate = () => emit('update:headerParams', JSON.parse(JSON.stringify(localHeaderParams.value)))
const emitQueryUpdate = () => emit('update:queryParams', JSON.parse(JSON.stringify(localQueryParams.value)))
const emitBodyParams = () => emit('update:bodyParams', JSON.parse(JSON.stringify(localBodyParams.value)))
const emitFormDataParams = () => emit('update:formDataParams', JSON.parse(JSON.stringify(localFormDataParams.value)))
const emitRawBody = () => emit('update:rawBody', localRawBody.value)
const emitBodyType = () => emit('update:bodyType', localBodyType.value)
const emitBodyCollapsed = () => emit('update:bodyCollapsed', localBodyCollapsed.value)

const addHeader = () => {
  localHeaderParams.value.push({ name:'', value:'', description:'' })
  emitHeaderUpdate()
}
const removeHeader = (index) => {
  localHeaderParams.value.splice(index,1)
  emitHeaderUpdate()
}

const addQuery = () => {
  localQueryParams.value.push({ name:'', value:'', description:'' })
  emitQueryUpdate()
}
const removeQuery = (index) => {
  localQueryParams.value.splice(index,1)
  emitQueryUpdate()
}

const addBody = () => {
  localBodyParams.value.push({ name:'', value:'', description:'' })
  emitBodyParams()
}
const removeBody = (index) => {
  localBodyParams.value.splice(index,1)
  emitBodyParams()
}

const addFormData = () => {
  localFormDataParams.value.push({ name:'', value:'', description:'' })
  emitFormDataParams()
}
const removeFormData = (index) => {
  localFormDataParams.value.splice(index,1)
  emitFormDataParams()
}

const toggleBodyCollapsed = () => {
  localBodyCollapsed.value = !localBodyCollapsed.value
  emitBodyCollapsed()
}
</script>

<style scoped>
.params-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 6px 18px rgba(16,24,40,0.04); }
.params-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; margin-top:24px; }
.params-title { font-size:16px; font-weight:600; color:#303133; margin:0; }
.add-param-btn { margin-bottom:24px; display:flex; justify-content:flex-start; }
</style>


