# 分享测试用例接口文档

## 📋 接口概述

测试用例分享功能允许用户生成分享链接，让其他用户通过链接查看测试用例的详细信息，支持权限控制、有效期管理和密码保护。

## 🔗 接口列表

### 1. 生成分享链接

**接口路径**: `POST /testcases/{caseId}/share`

**请求方法**: POST

**接口描述**: 为指定测试用例生成分享链接

#### 请求参数

**路径参数**:
- `caseId` (integer, 必填): 测试用例ID

**请求体**:
```json
{
  "title": "string",
  "expireDays": "integer",
  "password": "string",
  "permissions": ["string"]
}
```

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| title | string | 是 | 分享标题 | "分享测试用例: 用户登录测试" |
| expireDays | integer | 是 | 有效期天数，0表示永久 | 7 |
| password | string | 否 | 访问密码，为空表示无密码 | "123456" |
| permissions | array | 是 | 权限列表 | ["view", "download", "comment"] |

**权限说明**:
- `view`: 允许查看
- `download`: 允许下载
- `comment`: 允许评论

#### 响应格式

**成功响应 (200)**:
```json
{
  "code": 1,
  "msg": "分享链接生成成功",
  "data": {
    "shareId": "share_1703123456_abc123def",
    "shareUrl": "https://example.com/share/testcase/share_1703123456_abc123def",
    "title": "分享测试用例: 用户登录测试",
    "expireDays": 7,
    "hasPassword": true,
    "permissions": ["view", "download"],
    "createdAt": "2025-01-21T10:30:00",
    "expireAt": "2025-01-28T10:30:00",
    "views": 0,
    "status": "active"
  }
}
```

**错误响应**:
```json
{
  "code": 0,
  "msg": "测试用例不存在"
}
```

### 2. 获取分享链接信息

**接口路径**: `GET /testcases/share/{shareId}`

**请求方法**: GET

**接口描述**: 获取分享链接的详细信息

#### 请求参数

**路径参数**:
- `shareId` (string, 必填): 分享链接ID

#### 响应格式

**成功响应 (200)**:
```json
{
  "code": 1,
  "msg": "获取成功",
  "data": {
    "shareId": "share_1703123456_abc123def",
    "title": "分享测试用例: 用户登录测试",
    "expireDays": 7,
    "hasPassword": true,
    "permissions": ["view", "download"],
    "createdAt": "2025-01-21T10:30:00",
    "expireAt": "2025-01-28T10:30:00",
    "views": 15,
    "status": "active",
    "creator": {
      "userId": 8,
      "name": "张三",
      "avatarUrl": "https://avatar.example.com/user.jpg"
    }
  }
}
```

### 3. 通过分享链接查看测试用例

**接口路径**: `POST /testcases/share/{shareId}/view`

**请求方法**: POST

**接口描述**: 通过分享链接查看测试用例详情，需要验证密码（如果设置了）

#### 请求参数

**路径参数**:
- `shareId` (string, 必填): 分享链接ID

**请求体**:
```json
{
  "password": "string"
}
```

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| password | string | 否 | 访问密码，如果分享链接设置了密码则必填 | "123456" |

#### 响应格式

**成功响应 (200)**:
```json
{
  "code": 1,
  "msg": "获取成功",
  "data": {
    "shareInfo": {
      "shareId": "share_1703123456_abc123def",
      "title": "分享测试用例: 用户登录测试",
      "permissions": ["view", "download"],
      "views": 16,
      "expireAt": "2025-01-28T10:30:00"
    },
    "testCase": {
      "caseId": 1,
      "caseCode": "TC_AUTH001_001",
      "name": "正常登录测试",
      "description": "使用正确的用户名和密码登录",
      "priority": "P0",
      "severity": "critical",
      "tags": ["登录", "认证"],
      "preConditions": {
        "username": "testuser",
        "password": "testpass"
      },
      "testSteps": [
        {
          "step": 1,
          "operation": "发送登录请求",
          "expected": "返回成功响应"
        }
      ],
      "requestOverride": {
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "username": "testuser",
          "password": "testpass"
        }
      },
      "expectedHttpStatus": 200,
      "expectedResponseSchema": {
        "type": "object",
        "properties": {
          "code": {"type": "integer"},
          "msg": {"type": "string"},
          "data": {"type": "object"}
        }
      },
      "expectedResponseBody": "{\"code\":1,\"msg\":\"登录成功\"}",
      "assertions": [
        {
          "type": "status_code",
          "expected": 200
        },
        {
          "type": "json_path",
          "path": "$.code",
          "expected": "1"
        }
      ],
      "extractors": [
        {
          "name": "token",
          "expression": "$.data.token",
          "description": "提取登录token"
        }
      ],
      "validators": [],
      "isEnabled": true,
      "version": "1.0",
      "creatorInfo": {
        "userId": 8,
        "name": "张三",
        "avatarUrl": "https://avatar.example.com/user.jpg"
      },
      "createdAt": "2025-01-21T10:30:00",
      "updatedAt": "2025-01-21T10:30:00"
    }
  }
}
```

**错误响应**:
```json
{
  "code": 0,
  "msg": "密码错误"
}
```

### 4. 撤销分享链接

**接口路径**: `DELETE /testcases/share/{shareId}`

**请求方法**: DELETE

**接口描述**: 撤销指定的分享链接，撤销后链接将无法访问

#### 请求参数

**路径参数**:
- `shareId` (string, 必填): 分享链接ID

#### 响应格式

**成功响应 (200)**:
```json
{
  "code": 1,
  "msg": "分享链接已撤销"
}
```

**错误响应**:
```json
{
  "code": 0,
  "msg": "分享链接不存在或已过期"
}
```

## 🗄️ 数据库设计

### 分享链接表 (test_case_shares)

```sql
CREATE TABLE test_case_shares (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  share_id VARCHAR(100) UNIQUE NOT NULL COMMENT '分享链接ID',
  case_id BIGINT NOT NULL COMMENT '测试用例ID',
  title VARCHAR(200) NOT NULL COMMENT '分享标题',
  password_hash VARCHAR(255) COMMENT '密码哈希值',
  permissions JSON COMMENT '权限列表',
  expire_days INT DEFAULT 0 COMMENT '有效期天数，0表示永久',
  expire_at DATETIME COMMENT '过期时间',
  views INT DEFAULT 0 COMMENT '访问次数',
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '状态',
  created_by BIGINT NOT NULL COMMENT '创建者ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_share_id (share_id),
  INDEX idx_case_id (case_id),
  INDEX idx_created_by (created_by),
  INDEX idx_status (status),
  INDEX idx_expire_at (expire_at)
);
```

## 🔧 后端实现建议

### 1. Controller 层

```java
@RestController
@RequestMapping("/testcases")
public class TestCaseController {

    @PostMapping("/{caseId}/share")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO<CreateShareResponseDTO> createShare(
            @PathVariable("caseId") Integer caseId,
            @RequestBody CreateShareRequestDTO requestDTO) {
        try {
            Integer currentUserId = getCurrentUserId();
            CreateShareResponseDTO result = testCaseShareService.createShare(
                caseId, requestDTO, currentUserId);
            return ResponseVO.success("分享链接生成成功", result);
        } catch (Exception e) {
            return ResponseVO.serverError("生成分享链接失败：" + e.getMessage());
        }
    }

    @GetMapping("/share/{shareId}")
    public ResponseVO<ShareInfoResponseDTO> getShareInfo(
            @PathVariable("shareId") String shareId) {
        try {
            ShareInfoResponseDTO result = testCaseShareService.getShareInfo(shareId);
            return ResponseVO.success("获取成功", result);
        } catch (Exception e) {
            return ResponseVO.serverError("获取分享信息失败：" + e.getMessage());
        }
    }

    @PostMapping("/share/{shareId}/view")
    public ResponseVO<ShareTestCaseResponseDTO> viewTestCaseByShare(
            @PathVariable("shareId") String shareId,
            @RequestBody(required = false) ShareViewRequestDTO requestDTO) {
        try {
            ShareTestCaseResponseDTO result = testCaseShareService.viewTestCaseByShare(
                shareId, requestDTO);
            return ResponseVO.success("获取成功", result);
        } catch (Exception e) {
            return ResponseVO.serverError("查看测试用例失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/share/{shareId}")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO<Void> revokeShare(@PathVariable("shareId") String shareId) {
        try {
            Integer currentUserId = getCurrentUserId();
            testCaseShareService.revokeShare(shareId, currentUserId);
            return ResponseVO.success("分享链接已撤销");
        } catch (Exception e) {
            return ResponseVO.serverError("撤销分享失败：" + e.getMessage());
        }
    }
}
```

### 2. Service 层

```java
@Service
public class TestCaseShareService {

    public CreateShareResponseDTO createShare(
            Integer caseId, 
            CreateShareRequestDTO requestDTO, 
            Integer currentUserId) {
        
        // 1. 验证测试用例是否存在
        TestCase testCase = testCaseMapper.selectById(caseId);
        if (testCase == null) {
            throw new IllegalArgumentException("测试用例不存在");
        }
        
        // 2. 生成分享ID
        String shareId = generateShareId();
        
        // 3. 计算过期时间
        LocalDateTime expireAt = null;
        if (requestDTO.getExpireDays() > 0) {
            expireAt = LocalDateTime.now().plusDays(requestDTO.getExpireDays());
        }
        
        // 4. 加密密码
        String passwordHash = null;
        if (StringUtils.hasText(requestDTO.getPassword())) {
            passwordHash = BCrypt.hashpw(requestDTO.getPassword(), BCrypt.gensalt());
        }
        
        // 5. 保存分享记录
        TestCaseShare share = new TestCaseShare();
        share.setShareId(shareId);
        share.setCaseId(caseId);
        share.setTitle(requestDTO.getTitle());
        share.setPasswordHash(passwordHash);
        share.setPermissions(JSON.toJSONString(requestDTO.getPermissions()));
        share.setExpireDays(requestDTO.getExpireDays());
        share.setExpireAt(expireAt);
        share.setViews(0);
        share.setStatus("active");
        share.setCreatedBy(currentUserId);
        
        testCaseShareMapper.insert(share);
        
        // 6. 构建分享链接
        String shareUrl = buildShareUrl(shareId);
        
        // 7. 返回结果
        CreateShareResponseDTO result = new CreateShareResponseDTO();
        result.setShareId(shareId);
        result.setShareUrl(shareUrl);
        result.setTitle(requestDTO.getTitle());
        result.setExpireDays(requestDTO.getExpireDays());
        result.setHasPassword(StringUtils.hasText(requestDTO.getPassword()));
        result.setPermissions(requestDTO.getPermissions());
        result.setCreatedAt(LocalDateTime.now());
        result.setExpireAt(expireAt);
        result.setViews(0);
        result.setStatus("active");
        
        return result;
    }
    
    public ShareTestCaseResponseDTO viewTestCaseByShare(
            String shareId, 
            ShareViewRequestDTO requestDTO) {
        
        // 1. 获取分享信息
        TestCaseShare share = testCaseShareMapper.selectByShareId(shareId);
        if (share == null) {
            throw new IllegalArgumentException("分享链接不存在");
        }
        
        // 2. 检查分享状态
        if (!"active".equals(share.getStatus())) {
            throw new IllegalArgumentException("分享链接已失效");
        }
        
        // 3. 检查是否过期
        if (share.getExpireAt() != null && LocalDateTime.now().isAfter(share.getExpireAt())) {
            throw new IllegalArgumentException("分享链接已过期");
        }
        
        // 4. 验证密码
        if (StringUtils.hasText(share.getPasswordHash())) {
            if (requestDTO == null || !StringUtils.hasText(requestDTO.getPassword())) {
                throw new IllegalArgumentException("请输入访问密码");
            }
            if (!BCrypt.checkpw(requestDTO.getPassword(), share.getPasswordHash())) {
                throw new IllegalArgumentException("密码错误");
            }
        }
        
        // 5. 更新访问次数
        testCaseShareMapper.incrementViews(shareId);
        
        // 6. 获取测试用例详情
        TestCase testCase = testCaseMapper.selectById(share.getCaseId());
        
        // 7. 构建响应
        ShareTestCaseResponseDTO result = new ShareTestCaseResponseDTO();
        result.setShareInfo(buildShareInfo(share));
        result.setTestCase(convertToTestCaseDTO(testCase));
        
        return result;
    }
    
    private String generateShareId() {
        return "share_" + System.currentTimeMillis() + "_" + 
               UUID.randomUUID().toString().substring(0, 9);
    }
    
    private String buildShareUrl(String shareId) {
        return request.getScheme() + "://" + request.getServerName() + 
               ":" + request.getServerPort() + "/share/testcase/" + shareId;
    }
}
```

### 3. DTO 定义

```java
// 创建分享请求DTO
@Data
public class CreateShareRequestDTO {
    @NotBlank(message = "分享标题不能为空")
    @Size(min = 2, max = 200, message = "标题长度在2到200个字符")
    private String title;
    
    @NotNull(message = "有效期不能为空")
    @Min(value = 0, message = "有效期不能为负数")
    private Integer expireDays;
    
    @Size(max = 20, message = "密码长度不能超过20个字符")
    private String password;
    
    @NotEmpty(message = "权限不能为空")
    private List<String> permissions;
}

// 创建分享响应DTO
@Data
public class CreateShareResponseDTO {
    private String shareId;
    private String shareUrl;
    private String title;
    private Integer expireDays;
    private Boolean hasPassword;
    private List<String> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime expireAt;
    private Integer views;
    private String status;
}

// 分享查看请求DTO
@Data
public class ShareViewRequestDTO {
    private String password;
}

// 分享查看响应DTO
@Data
public class ShareTestCaseResponseDTO {
    private ShareInfoDTO shareInfo;
    private TestCaseDTO testCase;
}

@Data
public class ShareInfoDTO {
    private String shareId;
    private String title;
    private List<String> permissions;
    private Integer views;
    private LocalDateTime expireAt;
}
```

## 🔒 安全考虑

1. **密码加密**: 使用BCrypt对分享密码进行加密存储
2. **访问控制**: 验证分享链接的有效性和权限
3. **过期机制**: 自动检查分享链接的过期时间
4. **访问统计**: 记录分享链接的访问次数
5. **权限控制**: 根据分享权限限制访问者的操作

## 📊 使用场景

1. **团队协作**: 分享测试用例给团队成员查看
2. **外部评审**: 分享给外部专家进行评审
3. **文档归档**: 生成永久分享链接用于文档归档
4. **临时分享**: 设置短期分享链接用于临时查看

## 🎯 业务价值

1. **提高协作效率**: 快速分享测试用例给相关人员
2. **权限控制**: 精确控制分享内容的访问权限
3. **安全可控**: 支持密码保护和有效期管理
4. **使用统计**: 了解分享内容的使用情况
