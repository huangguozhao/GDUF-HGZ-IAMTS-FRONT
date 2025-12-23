import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getModulesByProject, getProjects } from '@/api/project'

export function useProjectsModules(props, apiData) {
  const availableProjects = ref([])
  const projectsLoading = ref(false)
  const availableModules = ref([])
  const modulesLoading = ref(false)

  const loadProjects = async () => {
    try {
      projectsLoading.value = true
      const response = await getProjects()
      if (response.code === 1 && response.data) {
        const projects = response.data.items || response.data || []
        availableProjects.value = projects.map(project => ({
          id: project.project_id || project.projectId || project.id,
          name: project.name || project.projectName || '未命名项目'
        }))
      } else {
        availableProjects.value = []
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
      ElMessage.error('加载项目列表失败')
      availableProjects.value = []
    } finally {
      projectsLoading.value = false
    }
  }

  const loadModules = async (projectId = null) => {
    const targetProjectId = projectId || apiData.projectId || props.api?.project_id || props.api?.projectId
    if (!targetProjectId) {
      availableModules.value = []
      return
    }

    try {
      modulesLoading.value = true
      const response = await getModulesByProject(targetProjectId, {
        structure: 'tree',
        status: 'active',
        includeStatistics: false
      })

      if (response.code === 1 && response.data) {
        // try different shapes
        let modulesData = []
        if (Array.isArray(response.data)) {
          modulesData = response.data
        } else if (response.data.items && Array.isArray(response.data.items)) {
          modulesData = response.data.items
        } else if (response.data.modules && Array.isArray(response.data.modules)) {
          modulesData = response.data.modules
        } else if (response.data.data && Array.isArray(response.data.data)) {
          modulesData = response.data.data
        }

        const flattenModules = (modules, level = 1) => {
          let result = []
          if (!modules || !Array.isArray(modules)) return result
          modules.forEach(module => {
            result.push({
              id: module.moduleId || module.module_id || module.id,
              name: module.name || module.moduleName || '未命名模块',
              level
            })
            if (module.children && Array.isArray(module.children) && module.children.length > 0) {
              result = result.concat(flattenModules(module.children, level + 1))
            }
          })
          return result
        }

        availableModules.value = flattenModules(modulesData)
      } else {
        availableModules.value = []
      }
    } catch (error) {
      console.error('加载模块列表失败:', error)
      ElMessage.error('加载模块列表失败')
      availableModules.value = []
    } finally {
      modulesLoading.value = false
    }
  }

  const handleProjectChange = (projectId) => {
    // clear module selection and reload modules for selected project
    apiData.module = ''
    apiData.moduleId = null
    availableModules.value = []
    if (projectId) loadModules(projectId)
  }

  return {
    availableProjects,
    projectsLoading,
    availableModules,
    modulesLoading,
    loadProjects,
    loadModules,
    handleProjectChange
  }
}

export default useProjectsModules


