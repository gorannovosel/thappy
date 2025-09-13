# Professional Go Config Service

## 🎯 The Problem

Your original config was basic - just direct `os.Getenv()` calls. In Node.js, you'd have a config service like:

```javascript
// Node.js style
const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  database: {
    url: process.env.DATABASE_URL,
    // etc...
  }
}
```

## 🚀 Go Solutions

### 1. **Custom Config Service** (What we built)

**Features:**
- ✅ **Automatic .env loading** (like `dotenv` in Node.js)
- ✅ **Type-safe getters** (string, int, bool, duration)
- ✅ **Validation with detailed errors**
- ✅ **Environment precedence** (env vars override .env files)
- ✅ **Secret masking** in logs
- ✅ **Configuration summary logging**
- ✅ **Required field enforcement**

**Usage:**
```go
// Simple usage (loads .env automatically)
config, err := config.Load()

// Advanced usage with specific files
service := config.NewConfigService()
config, err := service.Load(".env.production", ".env.local")

// Debugging
service.PrintConfig()  // Shows all config (masks secrets)
```

### 2. **Viper** (Industry Standard)

Popular library used by Kubernetes, Docker, Hugo:

```bash
go get github.com/spf13/viper
```

**Features:**
- ✅ **Multiple config sources** (YAML, JSON, TOML, env vars)
- ✅ **Live config reloading**
- ✅ **Nested configuration**
- ✅ **Remote config sources** (etcd, Consul)

## 🔧 Our Config Service Benefits

### **1. Environment Loading**
```go
// Loads in order (later overrides earlier):
// 1. .env.local (for local development)
// 2. .env (committed defaults)
// 3. Environment variables (highest priority)
```

### **2. Type Safety**
```go
// Instead of manual parsing
port, _ := strconv.Atoi(os.Getenv("PORT"))

// Type-safe with defaults and error handling
port := cs.getInt("SERVER_PORT", 8080)
```

### **3. Validation**
```go
// Comprehensive validation with helpful errors
var errors []string
if config.Server.Port < 1 || config.Server.Port > 65535 {
    errors = append(errors, "invalid server port")
}
if len(config.Auth.JWTSecret) < 32 && config.App.Environment == "production" {
    errors = append(errors, "JWT secret too short for production")
}
```

### **4. Security**
```go
// Logs config summary but masks secrets:
// Database: postgres:5432/thappy
// RabbitMQ: ***@localhost:5672
// JWT Secret: ***
```

### **5. Development Experience**
```go
service := config.NewConfigService()

// Load config
config, err := service.Load()

// Debug configuration
if service.IsDevelopment() {
    service.PrintConfig()  // Shows full config structure
}

// Reload for testing
newConfig, err := service.Reload(".env.test")
```

## 🆚 Comparison with Node.js

| Feature | Node.js (`dotenv`) | Our Go Service | Viper |
|---------|-------------------|----------------|-------|
| .env loading | ✅ | ✅ | ❌ (needs plugin) |
| Type safety | ❌ | ✅ | ✅ |
| Validation | Manual | ✅ Built-in | Manual |
| Multiple sources | ❌ | ✅ | ✅ |
| Live reload | ❌ | ✅ | ✅ |
| Secret masking | ❌ | ✅ | Manual |

## 📁 File Structure

```
internal/infrastructure/config/
├── config.go         # Core config structs
├── service.go        # Custom config service (recommended)
└── viper_example.go  # Alternative Viper approach
```

## 🔄 Environment Precedence

1. **Environment variables** (highest priority)
2. **.env.local** (local development overrides)
3. **.env** (committed defaults)
4. **Code defaults** (fallback)

## 🎯 Professional Features

### **Required Fields**
```go
// Will log warning if not set
Password: cs.getStringRequired("DB_PASSWORD")
```

### **Environment-Specific Validation**
```go
if config.App.Environment == "production" {
    // Stricter validation for production
    if len(config.Auth.JWTSecret) < 32 {
        return errors.New("JWT secret too short for production")
    }
}
```

### **Configuration Summary**
```bash
2024/09/13 10:30:15 Configuration loaded:
2024/09/13 10:30:15   App: thappy v1.0.0 (development)
2024/09/13 10:30:15   Server: 0.0.0.0:8080 (debug: true)
2024/09/13 10:30:15   Database: postgres:5432/thappy
2024/09/13 10:30:15   RabbitMQ: ***@localhost:5672
```

## 🚀 Recommendations

### **For Small to Medium Projects:**
Use our **custom config service** - it's simpler and covers 90% of use cases.

### **For Large/Enterprise Projects:**
Consider **Viper** if you need:
- Multiple config file formats (YAML, JSON)
- Remote configuration (etcd, Consul)
- Live configuration reloading
- Complex nested configuration

### **Migration from Basic Config:**
Your container just needs one line change:
```go
// Old way
config, err := config.Load()

// New way (same interface!)
config, err := config.Load()  // Now uses ConfigService internally
```

This gives you all the professional features with zero breaking changes! 🎉