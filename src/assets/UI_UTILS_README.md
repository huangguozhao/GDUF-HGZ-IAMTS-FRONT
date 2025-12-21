# UI 工具类使用指南

这个文件提供了基于项目原有主题色的 UI 工具类，参考了现代设计规范，但保持了项目的蓝色主题。

## 📦 已包含的工具类

### 1. 毛玻璃效果 (Glassmorphism)

```vue
<!-- 基础毛玻璃卡片 -->
<div class="glass-card">
  内容
</div>

<!-- 轻量级毛玻璃（用于输入框） -->
<input class="glass-light" />

<!-- 毛玻璃按钮 -->
<button class="glass-btn">按钮</button>
```

### 2. 动画系统

#### Vue Transition 动画类

```vue
<template>
  <!-- 淡入淡出 + 缩放 -->
  <Transition name="fade-scale">
    <div v-if="show">内容</div>
  </Transition>

  <!-- 滑入滑出（从上） -->
  <Transition name="slide-up">
    <div v-if="show">内容</div>
  </Transition>

  <!-- 滑入滑出（从下） -->
  <Transition name="slide-down">
    <div v-if="show">内容</div>
  </Transition>

  <!-- 淡入淡出 -->
  <Transition name="fade">
    <div v-if="show">内容</div>
  </Transition>
</template>
```

#### 悬停动画

```vue
<!-- 悬停上浮 -->
<div class="hover-lift">悬停我</div>

<!-- 悬停缩放 -->
<div class="hover-scale">悬停我</div>
```

### 3. 圆角系统

```vue
<div class="rounded-sm">4px 圆角</div>
<div class="rounded-md">8px 圆角</div>
<div class="rounded-lg">12px 圆角</div>
<div class="rounded-xl">16px 圆角</div>
<div class="rounded-2xl">20px 圆角</div>
<div class="rounded-3xl">24px 圆角</div>
<div class="rounded-full">完全圆形</div>
```

### 4. 阴影系统

```vue
<!-- 卡片阴影 -->
<div class="shadow-card">卡片</div>
<div class="shadow-card-hover">悬停阴影</div>

<!-- 按钮阴影 -->
<button class="shadow-btn">按钮</button>
<button class="shadow-btn-hover">悬停按钮</button>

<!-- 下拉菜单阴影 -->
<div class="shadow-dropdown">下拉菜单</div>

<!-- 模态框阴影 -->
<div class="shadow-modal">模态框</div>

<!-- 输入框焦点阴影 -->
<input class="shadow-inner-focus" />
```

### 5. 渐变效果

```vue
<!-- 渐变文字（基于项目主色 #1890ff） -->
<h1 class="text-gradient-primary">渐变标题</h1>

<!-- 渐变按钮 -->
<button class="btn-gradient-primary">渐变按钮</button>
```

### 6. 交互增强

```vue
<!-- 平滑过渡 -->
<div class="transition-smooth">平滑过渡</div>

<!-- 可点击元素 -->
<div class="clickable">点击我</div>

<!-- 禁用状态 -->
<div class="disabled-state">禁用</div>
```

### 7. 背景模糊

```vue
<div class="backdrop-blur-sm">轻微模糊</div>
<div class="backdrop-blur">标准模糊</div>
<div class="backdrop-blur-lg">大模糊</div>
<div class="backdrop-blur-xl">超大模糊</div>
```

### 8. 组合工具类

```vue
<!-- 现代化卡片 -->
<div class="modern-card">
  现代化卡片，包含毛玻璃、圆角、阴影和悬停效果
</div>

<!-- 现代化按钮 -->
<button class="modern-btn">现代化按钮</button>

<!-- 现代化输入框 -->
<input class="modern-input" placeholder="输入内容" />
```

## 🎨 实际应用示例

### 示例 1: 优化模态框

```vue
<template>
  <Transition name="fade-scale">
    <div v-if="visible" class="modal-overlay backdrop-blur" @click.self="handleClose">
      <div class="modal-content glass-card rounded-xl shadow-modal">
        <div class="modal-header">
          <h2 class="text-gradient-primary">标题</h2>
          <button class="close-btn glass-btn rounded-lg" @click="handleClose">×</button>
        </div>
        <div class="modal-body">
          <!-- 内容 -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary glass-btn">取消</button>
          <button class="btn-gradient-primary rounded-lg">确定</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
```

### 示例 2: 优化下拉菜单

```vue
<template>
  <Transition name="slide-up">
    <div v-if="show" class="dropdown glass-card rounded-lg shadow-dropdown">
      <div class="dropdown-item hover-lift">选项 1</div>
      <div class="dropdown-item hover-lift">选项 2</div>
    </div>
  </Transition>
</template>
```

### 示例 3: 优化输入框

```vue
<template>
  <div class="form-group">
    <label>用户名</label>
    <input 
      class="modern-input" 
      placeholder="请输入用户名"
      @focus="handleFocus"
    />
  </div>
</template>
```

### 示例 4: 优化卡片列表

```vue
<template>
  <div class="card-list">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="modern-card hover-lift"
    >
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </div>
  </div>
</template>
```

## 📝 注意事项

1. **保持原有主题色**: 所有工具类都基于项目原有的蓝色主题 (#1890ff)，不会改变整体配色
2. **渐进式增强**: 可以逐步在现有组件中应用这些工具类，不需要一次性全部替换
3. **浏览器兼容性**: 毛玻璃效果 (`backdrop-filter`) 在较旧的浏览器中可能不支持，会自动降级
4. **性能考虑**: 毛玻璃效果可能影响性能，在大量元素使用时需注意

## 🔧 自定义

如果需要调整效果强度，可以直接修改 `src/assets/ui-utils.css` 文件中的相关值：

- **模糊强度**: 调整 `blur()` 中的像素值
- **透明度**: 调整 `rgba()` 中的 alpha 值
- **阴影强度**: 调整 `box-shadow` 中的颜色和模糊值
- **动画时长**: 调整 `transition` 中的时间值

## 📚 更多参考

这些工具类参考了现代设计规范，包括：
- 毛玻璃效果 (Glassmorphism)
- 流畅的动画过渡
- 柔和的阴影系统
- 圆润的圆角设计

可以在任何 Vue 组件中直接使用这些类名，无需额外配置。

