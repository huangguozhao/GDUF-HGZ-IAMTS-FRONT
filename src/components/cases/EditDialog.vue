<template>
  <el-dialog
    v-model="localVisible"
    :title="dialogTitle"
    :width="dialogType === 'case' ? '900px' : '600px'"
    :close-on-click-modal="false"
  >
    <el-form
      ref="innerFormRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <template v-if="dialogType === 'project'">
        <div class="project-edit-grid">
          <div class="project-edit-left">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="项目描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入项目描述"
              />
            </el-form-item>
          </div>

          <div class="project-edit-right">
            <el-form-item label="项目封面">
              <div class="cover-area">
                <div v-if="coverPreview" class="cover-preview" :style="{ backgroundImage: 'url(' + coverPreview + ')' }" role="img" :aria-label="'项目封面预览 ' + (formData.name || '')"></div>
                <div v-else class="cover-placeholder">封面</div>
                <div class="cover-actions">
                  <label class="upload-btn small">
                    上传封面
                    <input type="file" accept="image/*" @change="onCoverChange" />
                  </label>
                  <el-button size="small" @click="clearCover" :disabled="!coverPreview">移除</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="显示设置">
              <el-switch v-model="formData.is_enabled" /> 显示在项目列表
            </el-form-item>

            <el-form-item label="高级">
              <div class="form-tip">更多高级设置请在创建后进入项目设置页面调整</div>
            </el-form-item>
          </div>
        </div>
      </template>

      <template v-if="dialogType === 'module'">
        <div class="module-edit-grid">
          <div class="module-edit-left">
            <el-form-item label="模块名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入模块名称" />
            </el-form-item>

            <el-form-item label="模块编码" prop="module_code">
              <el-input 
                v-model="formData.module_code" 
                placeholder="留空则自动生成"
                :disabled="isEdit"
              />
              <span class="form-tip" v-if="!isEdit">模块编码在项目内唯一，留空则自动生成</span>
              <span class="form-tip" v-else>模块编码创建后不可修改</span>
            </el-form-item>

            <el-form-item label="模块描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入模块描述"
              />
            </el-form-item>

            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入标签"
                style="width: 100%"
              >
                <el-option label="核心功能" value="核心功能" />
                <el-option label="辅助功能" value="辅助功能" />
                <el-option label="测试中" value="测试中" />
                <el-option label="待开发" value="待开发" />
              </el-select>
            </el-form-item>
          </div>

          <div class="module-edit-right">
            <el-form-item label="模块图标">
              <div class="cover-area small">
                <div
                  v-if="moduleIconPreview"
                  class="cover-preview"
                  :style="{ backgroundImage: 'url(' + moduleIconPreview + ')' }"
                  role="img"
                  :aria-label="'模块图标预览 ' + (formData.name || '')"
                ></div>
                <div v-else class="cover-placeholder">图标</div>
                <div class="cover-actions">
                  <label class="upload-btn small">
                    上传图标
                    <input type="file" accept="image/*" @change="onModuleIconChange" />
                  </label>
                  <el-button size="small" @click="clearModuleIcon" :disabled="!moduleIconPreview">移除</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="排序顺序" prop="sort_order">
              <el-input-number 
                v-model="formData.sort_order" 
                :min="0" 
                :step="1"
                placeholder="数字越小越靠前"
                style="width:100%"
              />
              <span class="form-tip">用于控制模块在列表中的显示顺序</span>
            </el-form-item>

            <el-form-item label="模块状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="活跃" value="active" />
                <el-option label="已归档" value="archived" />
                <el-option label="已禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </div>
        </div>
      </template>

      <template v-if="dialogType === 'api'">
        <el-form-item label="接口名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入接口名称" />
        </el-form-item>
        <el-form-item label="接口URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入接口URL" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="formData.method" placeholder="请选择请求方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入接口描述"
          />
        </el-form-item>
      </template>

      <template v-if="dialogType === 'case'">
        <el-tabs v-model="caseTabProxy" class="case-form-tabs">
          <slot name="case-tabs" />
        </el-tabs>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSave">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'project' },
  isEdit: { type: Boolean, default: false },
  formData: { type: Object, required: true },
  formRules: { type: Object, default: () => ({}) },
  caseFormActiveTab: { type: String, default: 'basic' }
})

const emit = defineEmits(['update:visible','save','cancel','update:caseFormActiveTab','cover-change','module-icon-change'])

const localVisible = ref(props.visible)
watch(() => props.visible, v => localVisible.value = v)
watch(localVisible, v => emit('update:visible', v))

const innerFormRef = ref(null)

const coverPreview = ref(null)
const moduleIconPreview = ref(null)

function onCoverChange(e) {
  emit('cover-change', e)
  const f = e.target.files && e.target.files[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => { coverPreview.value = reader.result }
  reader.readAsDataURL(f)
}

function onModuleIconChange(e) {
  emit('module-icon-change', e)
  const f = e.target.files && e.target.files[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => { moduleIconPreview.value = reader.result }
  reader.readAsDataURL(f)
}

function clearCover() {
  coverPreview.value = null
}
function clearModuleIcon() {
  moduleIconPreview.value = null
}

// writable proxy for tabs v-model (props are readonly)
const caseTabProxy = computed({
  get: () => props.caseFormActiveTab,
  set: (val) => emit('update:caseFormActiveTab', val)
})

function onSave() {
  // validate before emit
  innerFormRef.value?.validate?.((valid) => {
    if (valid) {
      emit('save')
    }
  })
}

function onCancel() {
  emit('cancel')
  localVisible.value = false
}
</script>

<style scoped>
/* component-local minimal styles */
</style>


