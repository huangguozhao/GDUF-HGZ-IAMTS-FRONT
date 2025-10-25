/**
 * 环境配置数据转换工具
 */

/**
 * 转换环境配置数据（后端 -> 前端）
 */
export function transformEnvironmentConfig(env) {
  if (!env) return null
  
  return {
    env_id: env.envId || env.env_id,
    envId: env.envId || env.env_id,
    env_code: env.envCode || env.env_code,
    envCode: env.envCode || env.env_code,
    name: env.envName || env.env_name,
    env_name: env.envName || env.env_name,
    envName: env.envName || env.env_name,
    env_type: env.envType || env.env_type,
    envType: env.envType || env.env_type,
    description: env.description,
    base_url: env.baseUrl || env.base_url,
    baseUrl: env.baseUrl || env.base_url,
    domain: env.domain,
    protocol: env.protocol,
    port: env.port,
    
    // JSON 字段
    database_config: env.databaseConfig || env.database_config,
    databaseConfig: env.databaseConfig || env.database_config,
    dataConfigs: env.databaseConfig || env.database_config || [],
    
    external_services: env.externalServices || env.external_services,
    externalServices: env.externalServices || env.external_services,
    
    variables: env.variables,
    envVariables: env.variables || [],
    
    auth_config: env.authConfig || env.auth_config,
    authConfig: env.authConfig || env.auth_config,
    authType: (env.authConfig || env.auth_config)?.type || 'none',
    authToken: (env.authConfig || env.auth_config)?.token,
    authUsername: (env.authConfig || env.auth_config)?.username,
    authPassword: (env.authConfig || env.auth_config)?.password,
    apiKey: (env.authConfig || env.auth_config)?.apiKey,
    apiKeyHeader: (env.authConfig || env.auth_config)?.apiKeyHeader,
    oauth2Config: (env.authConfig || env.auth_config)?.oauth2Config,
    
    feature_flags: env.featureFlags || env.feature_flags,
    featureFlags: env.featureFlags || env.feature_flags,
    debugMode: (env.featureFlags || env.feature_flags)?.debugMode || false,
    sslVerify: (env.featureFlags || env.feature_flags)?.sslVerify || true,
    autoRetry: (env.featureFlags || env.feature_flags)?.autoRetry || false,
    logging: (env.featureFlags || env.feature_flags)?.logging || true,
    monitoring: (env.featureFlags || env.feature_flags)?.monitoring || true,
    
    performance_config: env.performanceConfig || env.performance_config,
    performanceConfig: env.performanceConfig || env.performance_config,
    
    monitoring_config: env.monitoringConfig || env.monitoring_config,
    monitoringConfig: env.monitoringConfig || env.monitoring_config,
    
    status: env.status,
    is_default: env.isDefault !== undefined ? env.isDefault : env.is_default,
    isDefault: env.isDefault !== undefined ? env.isDefault : env.is_default,
    maintenance_message: env.maintenanceMessage || env.maintenance_message,
    maintenanceMessage: env.maintenanceMessage || env.maintenance_message,
    
    deployment_info: env.deploymentInfo || env.deployment_info,
    deploymentInfo: env.deploymentInfo || env.deployment_info,
    serverIp: (env.deploymentInfo || env.deployment_info)?.serverIp,
    deployPath: (env.deploymentInfo || env.deployment_info)?.deployPath,
    containerId: (env.deploymentInfo || env.deployment_info)?.containerId,
    deployTime: (env.deploymentInfo || env.deployment_info)?.deployTime,
    deployer: (env.deploymentInfo || env.deployment_info)?.deployer,
    deployNote: (env.deploymentInfo || env.deployment_info)?.deployNote,
    
    last_deployed_at: env.lastDeployedAt || env.last_deployed_at,
    lastDeployedAt: env.lastDeployedAt || env.last_deployed_at,
    deployed_version: env.deployedVersion || env.deployed_version,
    deployedVersion: env.deployedVersion || env.deployed_version,
    version: env.deployedVersion || env.deployed_version,
    
    // 创建人信息
    created_by: env.createdBy || env.created_by,
    createdBy: env.createdBy || env.created_by,
    creator_name: env.creatorName || env.creator_name,
    creatorName: env.creatorName || env.creator_name,
    creator_avatar: env.creatorAvatar || env.creator_avatar,
    creatorAvatar: env.creatorAvatar || env.creator_avatar,
    
    // 更新人信息
    updated_by: env.updatedBy || env.updated_by,
    updatedBy: env.updatedBy || env.updated_by,
    updater_name: env.updaterName || env.updater_name,
    updaterName: env.updaterName || env.updater_name,
    updater_avatar: env.updaterAvatar || env.updater_avatar,
    updaterAvatar: env.updaterAvatar || env.updater_avatar,
    
    created_at: env.createdAt || env.created_at,
    createdAt: env.createdAt || env.created_at,
    updated_at: env.updatedAt || env.updated_at,
    updatedAt: env.updatedAt || env.updated_at
  }
}

/**
 * 转换环境配置数据（前端 -> 后端）
 * 对应后端 CreateEnvironmentConfigDTO 和 UpdateEnvironmentConfigDTO
 */
export function transformEnvironmentConfigToBackend(env) {
  console.log('=== 转换环境配置数据到后端格式 ===')
  console.log('前端数据:', env)
  
  const data = {
    envCode: env.env_code || env.envCode,
    envName: env.name || env.env_name || env.envName,
    envType: env.env_type || env.envType || 'development',
    description: env.description || '',
    baseUrl: env.base_url || env.baseUrl || '',
    domain: env.domain || '',
    protocol: env.protocol || 'https',
    port: env.port ? parseInt(env.port) : null,
    status: env.status || 'active',
    isDefault: env.is_default || env.isDefault || false,
    maintenanceMessage: env.maintenance_message || env.maintenanceMessage || '',
    
    // 确保所有JSON字段都有默认值 - 后端期望Map<String, Object>格式
    databaseConfig: {},
    externalServices: {},
    variables: {},
    authConfig: {},
    featureFlags: {},
    performanceConfig: {},
    monitoringConfig: {},
    deploymentInfo: {},
    deployedVersion: ''
  }
  
  // 数据库配置 - 转换为Map格式
  if (env.dataConfigs && env.dataConfigs.length > 0) {
    // 将数组转换为Map格式
    const dbConfig = {}
    env.dataConfigs.forEach((item, index) => {
      dbConfig[`config_${index}`] = item
    })
    data.databaseConfig = dbConfig
  } else if (env.databaseConfig) {
    data.databaseConfig = env.databaseConfig
  } else if (env.database_config) {
    data.databaseConfig = env.database_config
  }
  
  // 外部服务 - 转换为Map格式
  if (env.externalServices && env.externalServices.length > 0) {
    // 将数组转换为Map格式
    const extServices = {}
    env.externalServices.forEach((item, index) => {
      extServices[`service_${index}`] = item
    })
    data.externalServices = extServices
  } else if (env.external_services) {
    data.externalServices = env.external_services
  }
  
  // 环境变量 - 转换为Map格式
  if (env.envVariables && env.envVariables.length > 0) {
    // 将数组转换为Map格式
    const variables = {}
    env.envVariables.forEach((item, index) => {
      variables[`var_${index}`] = item
    })
    data.variables = variables
  } else if (env.variables) {
    data.variables = env.variables
  }
  
  // 认证配置
  if (env.authType || env.authConfig || env.auth_config) {
    data.authConfig = {
      type: env.authType || 'none',
      token: env.authToken || '',
      username: env.authUsername || '',
      password: env.authPassword || '',
      apiKey: env.apiKey || '',
      apiKeyHeader: env.apiKeyHeader || 'X-API-Key',
      oauth2Config: env.oauth2Config || {}
    }
  }
  
  // 功能开关
  data.featureFlags = {
    debugMode: env.debugMode !== undefined ? env.debugMode : false,
    sslVerify: env.sslVerify !== undefined ? env.sslVerify : true,
    autoRetry: env.autoRetry !== undefined ? env.autoRetry : false,
    logging: env.logging !== undefined ? env.logging : true,
    monitoring: env.monitoring !== undefined ? env.monitoring : true
  }
  
  // 性能配置
  if (env.performanceConfig) {
    data.performanceConfig = env.performanceConfig
  } else if (env.performance_config) {
    data.performanceConfig = env.performance_config
  }
  
  // 监控配置
  if (env.monitoringConfig) {
    data.monitoringConfig = env.monitoringConfig
  } else if (env.monitoring_config) {
    data.monitoringConfig = env.monitoring_config
  }
  
  // 部署信息
  if (env.deploymentInfo) {
    data.deploymentInfo = env.deploymentInfo
  } else if (env.deployment_info) {
    data.deploymentInfo = env.deployment_info
  } else if (env.serverIp || env.deployPath || env.containerId) {
    data.deploymentInfo = {
      serverIp: env.serverIp || '',
      deployPath: env.deployPath || '',
      containerId: env.containerId || '',
      deployTime: env.deployTime || '',
      deployer: env.deployer || '',
      deployNote: env.deployNote || ''
    }
  }
  
  // 部署版本
  if (env.version) {
    data.deployedVersion = env.version
  } else if (env.deployedVersion) {
    data.deployedVersion = env.deployedVersion
  } else if (env.deployed_version) {
    data.deployedVersion = env.deployed_version
  }
  
  console.log('转换结果:', data)
  return data
}

