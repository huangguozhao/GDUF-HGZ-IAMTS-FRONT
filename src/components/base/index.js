import { defineComponent, ref } from 'vue'

/**
 * 基础输入框组件
 */
export const BaseInput = defineComponent({
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    prefixIcon: {
      type: String,
      default: ''
    },
    suffixIcon: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'input', 'change', 'clear'],
  setup(props, { emit }) {
    const handleInput = (value) => {
      emit('update:modelValue', value)
      emit('input', value)
    }

    const handleChange = (value) => {
      emit('change', value)
    }

    const handleFocus = (event) => {
      emit('focus', event)
    }

    const handleBlur = (event) => {
      emit('blur', event)
    }

    const handleClear = () => {
      emit('clear')
      emit('update:modelValue', '')
    }

    return {
      handleInput,
      handleChange,
      handleFocus,
      handleBlur,
      handleClear
    }
  },
  template: `
    <div class="base-input">
      <label v-if="label" class="base-input__label">
        {{ label }}
        <span v-if="required" class="base-input__required">*</span>
      </label>
      <el-input
        :model-value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :show-password="showPassword"
        :clearable="clearable"
        :prefix-icon="prefixIcon"
        :suffix-icon="suffixIcon"
        :size="size"
        :class="{ 'is-error': error }"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @clear="handleClear"
      />
      <div v-if="error" class="base-input__error">{{ error }}</div>
    </div>
  `
})

/**
 * 基础按钮组件
 */
export const BaseButton = defineComponent({
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    plain: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    circle: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    nativeType: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    }
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }

    return {
      handleClick
    }
  },
  template: `
    <el-button
      :type="type"
      :size="size"
      :disabled="disabled"
      :loading="loading"
      :plain="plain"
      :round="round"
      :circle="circle"
      :icon="icon"
      :native-type="nativeType"
      @click="handleClick"
    >
      <slot />
    </el-button>
  `
})

/**
 * 基础表单组件
 */
export const BaseForm = defineComponent({
  name: 'BaseForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    labelWidth: {
      type: String,
      default: '120px'
    },
    labelPosition: {
      type: String,
      default: 'right',
      validator: (value) => ['left', 'right', 'top'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    showMessage: {
      type: Boolean,
      default: true
    },
    inlineMessage: {
      type: Boolean,
      default: false
    },
    statusIcon: {
      type: Boolean,
      default: false
    },
    validateOnRuleChange: {
      type: Boolean,
      default: true
    },
    hideRequiredAsterisk: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'validate', 'submit'],
  setup(props, { emit, expose }) {
    const formRef = ref(null)

    const validate = (callback) => {
      return formRef.value?.validate(callback)
    }

    const validateField = (props, callback) => {
      return formRef.value?.validateField(props, callback)
    }

    const resetFields = () => {
      formRef.value?.resetFields()
    }

    const clearValidate = (props) => {
      formRef.value?.clearValidate(props)
    }

    const scrollToField = (prop) => {
      formRef.value?.scrollToField(prop)
    }

    expose({
      validate,
      validateField,
      resetFields,
      clearValidate,
      scrollToField
    })

    return {
      formRef,
      validate,
      validateField,
      resetFields,
      clearValidate,
      scrollToField
    }
  },
  template: `
    <el-form
      ref="formRef"
      :model="modelValue"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :size="size"
      :disabled="disabled"
      :readonly="readonly"
      :show-message="showMessage"
      :inline-message="inlineMessage"
      :status-icon="statusIcon"
      :validate-on-rule-change="validateOnRuleChange"
      :hide-required-asterisk="hideRequiredAsterisk"
      @validate="(prop, isValid, message) => $emit('validate', prop, isValid, message)"
    >
      <slot />
    </el-form>
  `
})

export default {
  BaseInput,
  BaseButton,
  BaseForm
}
