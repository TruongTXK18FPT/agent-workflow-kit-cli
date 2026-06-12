/**
 * @license
 * SPDX-License-Identifier: MIT
 */

// --- Layer 1: Repository Intelligence ---

export interface ModuleBoundary {
  name: string;
  path: string;
  dependencies: string[]; // List of other module names it imports from
}

export interface TestingStrategy {
  frameworks: string[]; // ['junit', 'mockito', 'vitest']
  coverageGoal: number; // e.g. 80
}

export interface RepositoryContext {
  stack: 'spring-boot' | 'react-ts' | 'fastapi' | 'python-ai' | 'custom' | string;
  architecture: 'clean-architecture' | 'feature-first' | 'vertical-slice' | 'layered' | 'ddd-lite' | string;
  modules: ModuleBoundary[];
  testing: TestingStrategy;
  validation: {
    libraries: string[]; // ['jakarta.validation', 'fluent-validation']
  };
  hash: string; // Hash of manifest files (package.json, pom.xml, etc.) to detect changes
}

export interface RepositoryAnalyzer {
  name: string;
  detect(workspaceRoot: string): Promise<Partial<RepositoryContext>>;
}

// --- Layer 2: Directed Workflow Graph Runtime ---

export type NodeType = 'task' | 'fork' | 'join' | 'conditional' | 'approval' | 'retry' | 'rollback';
export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'WAITING_APPROVAL';

export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  executor?: string;      // e.g. "shell-command", "agent-prompt"
  params?: Record<string, any>;
  role?: string;          // Target AgentRole required for this step
  retryLimit?: number;    // Used if type is 'retry'
  rollbackNodeId?: string; // Node to execute on failure
}

export interface WorkflowEdge {
  sourceId: string;
  targetId: string;
  conditionExpression?: string; // Evaluated against execution context
}

export interface DirectedWorkflowGraph {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowRunState {
  runId: string;
  workflowId: string;
  status: 'IDLE' | 'EXECUTING' | 'PAUSED' | 'SUCCESS' | 'FAILURE';
  context: Record<string, any>;
  currentStepIndex: number;
  steps: {
    id: string;
    name: string;
    status: StepStatus;
    outputs?: Record<string, any>;
    startedAt?: string;
    completedAt?: string;
  }[];
}

// --- Layer 3: Architecture Profiles ---

export interface FolderRule {
  pathPattern: string;
  allowedImports?: string[];
  forbiddenImports?: string[];
  mustContainPatterns?: string[];
}

export interface ArchitectureProfile {
  name: string;
  version: string;
  extends?: string;
  folderStructure: FolderRule[];
  reviewRules: {
    maxFileLines: number;
    maxMethodLines: number;
    requireInterfaceForServices: boolean;
  };
  testingRequirements: {
    mustHaveTestFile: boolean;
    namingSuffix: string; // e.g. "Test.java" or ".test.ts"
  };
}

// --- Layer 4: Team Profiles ---

export interface TeamProfile {
  name: 'startup' | 'enterprise' | 'agency' | 'solo' | 'open-source' | string;
  reviewStrictness: 'low' | 'medium' | 'high';
  documentationLevel: 'minimal' | 'moderate' | 'exhaustive';
  testing: {
    enforceCoverage: boolean;
    failBuildOnCoverageDrop: boolean;
  };
  approval: {
    requireManualSignoff: boolean;
    approvedPathsOnly: string[];
  };
}

// --- Layer 5: Agent Roles ---

export interface RoleHookContext {
  runId: string;
  workspaceRoot: string;
  repoContext: RepositoryContext;
  profile: ArchitectureProfile;
}

export interface AgentRole {
  id: string;
  extends?: string[];
  responsibilities: string[];
  reviewChecklist: string[];
  hooks?: {
    preStep?: (ctx: RoleHookContext, step: WorkflowNode) => Promise<{ proceed: boolean; error?: string }>;
    postStep?: (ctx: RoleHookContext, step: WorkflowNode, filesModified: string[]) => Promise<{ valid: boolean; reviewLogs: string[] }>;
  };
}

// --- Layer 6: Plugin SDK ---

export interface AWOSPlugin {
  manifest: {
    id: string;
    version: string;
    requiredAwosVersion: string;
  };
  register(registry: PluginRegistry): void;
}

export interface PluginRegistry {
  registerAnalyzer(analyzer: RepositoryAnalyzer): void;
  registerArchitectureProfile(profile: ArchitectureProfile): void;
  registerAgentRole(role: AgentRole): void;
  registerExecutor(name: string, executeFn: (params: any, runState: WorkflowRunState) => Promise<any>): void;
}
