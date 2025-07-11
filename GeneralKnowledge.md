# General Knowledge - Chief Systems Engineer Reference

## Development Environment Architecture

### Cursor AI Context Instantiation

**Cursor_AI_BIOS.md** serves as the initialization protocol for AI assistants operating in your development environment. This file establishes the AI as an Information Systems Engineer with maximum agency within safety bounds.

**Key Features:**
- Immediate role and authority establishment
- Comprehensive tool configuration and safety protocols
- Context degradation awareness with refresh procedures
- Natural language optimization for LLM processing

### MCP Browser Tools Architecture

The Browser MCP system consists of 4 interconnected components:

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│   Cursor    │ ◄──► │  MCP Server  │ ◄──► │  Middleware   │ ◄──► │   Chrome    │
│   (AI)      │     │  (Protocol   │     │  Server       │     │  Extension  │
│             │     │   Handler)   │     │ (Port 3025)   │     │             │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
```

**Component Responsibilities:**
1. **Chrome Extension**: Captures browser data (DOM, console logs, network requests, screenshots)
2. **Middleware Server**: Processes and aggregates browser information on port 3025 (fallback: 3026)
3. **MCP Server**: Provides standardized AI tool interface via Cursor configuration
4. **Cursor Integration**: Enables natural language browser interaction

**Setup Requirements:**
- Browser MCP Extension installed and connected from Chrome Web Store
- Middleware server running: `npx @agentdeskai/browser-tools-server@latest`
- DevTools BrowserTools tab active
- Extension permissions set to "On all sites"

## Critical Browser Tools MCP Troubleshooting Guide

### Port Conflict Resolution (Most Common Issue)

**Problem**: Server fails to start due to port conflicts
```
ERROR: Port 3026 is still in use, despite our checks!
This might indicate another process started using this port after our check.
```

**Root Cause**: Multiple server instances running simultaneously from previous sessions

**Solution Process:**
1. **Identify conflicting processes**:
   ```powershell
   netstat -ano | findstr ":302"  # Check ports 3025, 3026
   ```

2. **Kill existing processes**:
   ```powershell
   taskkill /PID [process_id] /F
   ```

3. **Start fresh server**:
   ```powershell
   npx @agentdeskai/browser-tools-server@latest
   ```

4. **Verify successful startup**:
   ```powershell
   netstat -ano | findstr :3025
   Test-NetConnection -ComputerName localhost -Port 3025
   ```

### Success Indicators vs Error Symptoms

**✅ SERVER WORKING CORRECTLY:**
```
=== Browser Tools Server Started ===
Aggregator listening on http://0.0.0.0:3025
Chrome extension connected via WebSocket
Received current URL update request: {...}
Processing console-log log entry
Adding console error: {...}
Received WebSocket message: { type: 'heartbeat', data: undefined }
```

**❌ BROWSER CONSOLE ERRORS (Connection Issues):**
```
GET http://localhost:3006/ net::ERR_CONNECTION_REFUSED
```

**🔍 CRITICAL INSIGHT**: DevTools application errors (like `RegisterClientLocalizationsError`) are **PROOF the system is working** - they're being captured and reported by the MCP system!

### Chrome Extension Connection States

**Extension Connection Flow:**
1. **Initial Connection**: Extension attempts WebSocket connection to server
2. **Handshake**: Server logs "Chrome extension connected via WebSocket"
3. **Data Flow**: URL updates, console logs, network requests start flowing
4. **Heartbeat**: Regular `{ type: 'heartbeat' }` messages maintain connection

**Troubleshooting Extension Issues:**
- **No connection**: Check server is running on correct port
- **Intermittent connection**: Verify extension permissions set to "On all sites"
- **Data not flowing**: Refresh DevTools BrowserTools tab
- **Wrong port**: Extension may cache old port - restart Chrome

### Port Priority and Fallback Behavior

**Default Port Logic:**
1. **Primary**: Port 3025 (server's preferred port)
2. **Fallback**: Port 3026 (when 3025 in use)
3. **Failure**: If both ports occupied, server fails to start

**Historical Port Confusion:**
- Documentation may reference port 3026 (fallback)
- Extension may try port 3006 (configuration mismatch)
- Server actually prefers and uses port 3025

### Process Management Best Practices

**Clean Startup Procedure:**
1. **Check existing processes**: `netstat -ano | findstr ":302"`
2. **Kill conflicting processes**: `taskkill /PID [id] /F`
3. **Start server fresh**: `npx @agentdeskai/browser-tools-server@latest`
4. **Verify connection**: Look for "Chrome extension connected via WebSocket"

**Maintenance Commands:**
```powershell
# Check all browser tools processes
tasklist | findstr node.exe

# Check specific port usage
netstat -ano | findstr :3025

# Kill specific process
taskkill /PID [process_id] /F

# Test port connectivity
Test-NetConnection -ComputerName localhost -Port 3025
```

### Data Flow Verification

**What to Monitor in Terminal:**
- ✅ `Chrome extension connected via WebSocket`
- ✅ `Received current URL update request`
- ✅ `Processing console-log log entry`
- ✅ `Adding console error: {...}`
- ✅ `Received WebSocket message: { type: 'heartbeat' }`

**What to Monitor in DevTools:**
- ✅ Application errors being captured (proves system working)
- ✅ Network requests being logged
- ✅ Console messages flowing to server
- ❌ Connection refused errors (indicates server/port issues)

### Common Misconceptions

**❌ WRONG**: "DevTools shows errors, so MCP isn't working"
**✅ CORRECT**: "DevTools errors being captured proves MCP is working"

**❌ WRONG**: "Server should use port 3026"
**✅ CORRECT**: "Server prefers port 3025, uses 3026 as fallback"

**❌ WRONG**: "Multiple server instances are fine"
**✅ CORRECT**: "Multiple instances cause port conflicts and connection issues"

### Emergency Recovery Procedure

**When Everything Fails:**
1. **Nuclear option**: Kill all node processes: `taskkill /F /IM node.exe`
2. **Restart Chrome**: Close completely, reopen
3. **Clear ports**: Wait 30 seconds for TIME_WAIT states to clear
4. **Fresh start**: Run server command once
5. **Verify immediately**: Check netstat and connection status

**Warning**: Nuclear option kills ALL Node.js processes, not just browser tools.

## Terminal Environment Differences

### PowerShell vs WSL vs Cursor

| Aspect | PowerShell | WSL Ubuntu | Cursor Integrated |
|--------|------------|------------|-------------------|
| **Syntax** | Windows cmdlets | Unix/bash | Context-dependent |
| **Paths** | Backslash `\` | Forward slash `/` | Workspace relative |
| **Authentication** | Windows user | Interactive login required | Workspace scope |
| **Strengths** | Native Windows, admin capabilities | Unix tooling, package managers | File editing, integrated |
| **Limitations** | Unix command failures | User login required | Workspace only |

### Command Syntax Examples

**File listing:**
- PowerShell: `Get-ChildItem` or `ls` (alias)
- WSL: `ls -la`
- Path format: `C:\Users\` vs `/mnt/c/Users/`

**Process management:**
- PowerShell: `Get-Process`, `Stop-Process`
- WSL: `ps aux`, `kill`

## Common Failure Modes & Solutions

### MCP Browser Tools
- **Port conflict**: Server defaults to 3025, falls back to 3026
- **Extension disconnected**: Check connection status, refresh DevTools
- **Permission denied**: Verify extension permissions in Chrome settings
- **Screenshot failure**: Ensure "On all sites" permission enabled

### Terminal Issues
- **WSL authentication**: User must interactively log in before AI can execute commands
- **Command syntax confusion**: AI will attempt PowerShell first, fall back to WSL
- **Path resolution**: Windows paths vs Unix paths require different handling

### Context Degradation
- **Symptoms**: Repetitive errors, forgetting established information, reduced efficiency
- **Solution**: Manual context refresh via Cursor_AI_BIOS.md reload
- **Prevention**: Monitor conversation length and error frequency

## Safety Framework

### Operational Boundaries

**File Operations:**
- ✅ Allowed: Workspace editing, temporary files, log reading
- ❌ Forbidden: System file deletion, boot sector modification, user data corruption

**System Access:**
- ✅ Allowed: Environment variables, process listing, network status
- ❌ Forbidden: Privilege escalation, user account modification, service control

**Network Operations:**
- ✅ Allowed: Localhost services, authenticated APIs, documentation access
- ❌ Forbidden: Unauthorized external connections, credential transmission

### Command Validation Process

1. **Pre-execution**: Validate against restrictions, verify scope, confirm reversibility
2. **During execution**: Track progress, detect unexpected behavior, maintain rollback
3. **Post-execution**: Verify outcome, log results, update context state

## Tool Selection Guidelines

### Task-Specific Recommendations

**Development Tasks:**
- Primary: WSL Ubuntu (for Unix-based development)
- Secondary: GitHub integration, MCP browser for testing
- Considerations: Requires user authentication for WSL

**Research Tasks:**
- Primary: Web search, documentation access
- Secondary: PowerShell for quick checks
- Considerations: Efficient for information gathering

**Troubleshooting Tasks:**
- Primary: All terminals available
- Secondary: MCP browser diagnostics, system information
- Considerations: Maximum tool flexibility needed

**File Management:**
- Primary: Cursor integrated
- Secondary: PowerShell for bulk operations, WSL for text processing
- Considerations: Workspace-scoped operations

## Deployment Notes

### Initial Setup Checklist

1. **Browser MCP**: Install extension, start middleware server, configure permissions
2. **WSL**: Ensure Ubuntu available, user can authenticate
3. **Cursor**: Verify integrated terminal access, workspace permissions
4. **AI Context**: Load Cursor_AI_BIOS.md as first prompt for AI sessions

### Maintenance Procedures

- **Context Refresh**: Reload Cursor_AI_BIOS.md when AI performance degrades
- **Tool Verification**: Periodically check MCP server status, WSL accessibility
- **Safety Validation**: Monitor AI adherence to operational boundaries

### Performance Optimization

- **Token Efficiency**: Cursor_AI_BIOS.md optimized for natural language processing
- **Tool Selection**: Context-dependent autonomous selection reduces manual intervention
- **Error Recovery**: Three-level escalation (retry → guidance → stop) minimizes downtime

---

**Document Purpose**: Reference guide for Chief Systems Engineer managing AI assistant deployment and operations in Cursor development environment. 

## GitHub Integration Challenges & Solutions

### Cursor GitHub Integration vs Command Line Git

| Aspect | Cursor UI Integration | Command Line Git | Recommendation |
|--------|----------------------|------------------|----------------|
| **Authentication** | OAuth flow through browser | Personal Access Token (PAT) | Use PAT for reliability |
| **Reliability** | Variable, connection sensitive | Consistent, credential-based | CLI for critical operations |
| **User Experience** | Visual, point-and-click | Terminal proficiency required | UI for routine, CLI for setup |
| **Troubleshooting** | Limited diagnostic info | Full command visibility | CLI for debugging |
| **Session Persistence** | Requires periodic re-auth | Credential manager storage | CLI avoids session issues |

### Authentication Issues & Fixes

**Common Cursor Integration Problems:**
- Authentication URL failures: `cursor.sh` domain resolution issues
- Session persistence: Integration disconnects unpredictably  
- Network sensitivity: Corporate firewalls and proxy conflicts
- Silent failures: Operations attempt but don't complete

**Proven Solutions:**
1. **URL Fix**: Manually add `www.` prefix to redirect URLs (`https://www.cursor.sh/...`)
2. **HTTP/2 Fallback**: Enable `cursor.general.disableHttp2` for proxy environments
3. **PAT Authentication**: Generate token with `repo`, `workflow` scopes
4. **Hybrid Approach**: Use UI for monitoring, CLI for operations

### Repository Setup Workflow

**Initial Repository Creation Process:**
```bash
# 1. Initialize local repository
git init
git add .
git commit -m "Initial commit: [descriptive message]"

# 2. Create repository on GitHub (manual web interface)
# - Navigate to github.com/new
# - DO NOT initialize with README (files already exist)
# - Note exact username/repository name

# 3. Link and push
git remote add origin https://github.com/[username]/[repository].git
git push -u origin master
# Enter username and PAT when prompted
```

**Critical Gotchas:**
- **Username mismatch**: GitHub username may differ from expected name
- **Repository not found**: Manual creation required before push
- **Authentication method**: PAT required (passwords deprecated August 2021)
- **Remote URL accuracy**: Case-sensitive repository names

### Troubleshooting GitHub Issues

**Error: "repository not found"**
- Verify exact GitHub username via profile URL
- Confirm repository exists and name matches exactly
- Check remote URL: `git remote get-url origin`
- Update remote if needed: `git remote set-url origin [correct-url]`

**Error: "Authentication failed"**
- GitHub no longer accepts password authentication
- Generate Personal Access Token (PAT) in GitHub Settings
- Use PAT as password when prompted
- Ensure token has appropriate scopes (repo, workflow)

**Cursor integration silent failures:**
- Check git status: `git status`, `git log --oneline`
- Verify no commands executed in terminal history
- Fall back to command line for reliable operations
- Consider www-prefix authentication URL fix

### Integration Testing Protocol

**Before Critical Operations:**
1. Test authentication: Try simple `git status` or Cursor sync button
2. Verify connectivity: Check network and proxy settings
3. Prepare fallback: Have PAT ready for CLI authentication
4. Monitor execution: Watch terminal for actual command execution

**Post-Operation Verification:**
1. Confirm changes: `git log --oneline`, check GitHub web interface
2. Validate remotes: `git remote -v`
3. Test future operations: Ensure authentication persists

### Best Practices for Mixed Environment

**When to Use Cursor Integration:**
- ✅ Routine commits and status checks (when authenticated)
- ✅ Visual diff review and staging
- ✅ Branch management through UI

**When to Use Command Line:**
- ✅ Initial repository setup and configuration
- ✅ Complex merge operations and conflict resolution
- ✅ Troubleshooting authentication or connection issues
- ✅ Any operation requiring guaranteed execution

**Recommended Workflow:**
1. **Setup phase**: Use CLI for initial repository creation and configuration
2. **Development phase**: Use Cursor UI for routine commits when stable
3. **Troubleshooting phase**: Fall back to CLI when integration fails
4. **Critical operations**: Always use CLI for important pushes/merges

--- 