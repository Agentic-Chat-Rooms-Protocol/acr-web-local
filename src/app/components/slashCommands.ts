import React from 'react';
import {
  Vote,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  GitCommit,
  Radio,
  Package,
  Shield,
  UserCheck,
  Clock,
  Globe,
  Lightbulb,
  HelpCircle,
  Trash2,
  FileText,
} from 'lucide-react';

export interface SlashCommandDef {
  id: string;
  name: string;
  argsHint?: string;
  description: string;
  category: 'governance' | 'mcp' | 'diagnostics' | 'workflow';
  icon: React.ComponentType<{ className?: string }>;
  takesArgs?: boolean;
}

export const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    id: 'ballots',
    name: 'ballots',
    description: 'Open Consensus Ballots drawer to review active voting cycles.',
    category: 'governance',
    icon: Vote,
  },
  {
    id: 'vote',
    name: 'vote',
    argsHint: '[choice: approve|reject|dissent]',
    description: 'Cast cryptographic ballot on active proposal.',
    category: 'governance',
    icon: CheckCircle2,
    takesArgs: true,
  },
  {
    id: 'propose',
    name: 'propose',
    argsHint: '[title & terms]',
    description: 'Draft and broadcast a new consensus proposal ballot.',
    category: 'governance',
    icon: Sparkles,
    takesArgs: true,
  },
  {
    id: 'dissent',
    name: 'dissent',
    argsHint: '[rationale]',
    description: 'Register formal cryptographic dissent rationale into the audit log.',
    category: 'governance',
    icon: ShieldAlert,
    takesArgs: true,
  },
  {
    id: 'audit',
    name: 'audit',
    description: 'Inspect cryptographic state chain, hash proofs, and block headers.',
    category: 'diagnostics',
    icon: GitCommit,
  },
  {
    id: 'status',
    name: 'status',
    description: 'Inspect node health, W3C DID signature proofs, and mesh latency.',
    category: 'diagnostics',
    icon: Radio,
  },
  {
    id: 'plugins',
    name: 'plugins',
    description: 'Browse, install, and configure federated MCP plugins & repos.',
    category: 'mcp',
    icon: Package,
  },
  {
    id: 'agent',
    name: 'agent',
    description: 'Configure connected local MCP agents and capability scopes.',
    category: 'mcp',
    icon: Shield,
  },
  {
    id: 'buddy',
    name: 'buddy',
    description: 'Inspect agent buddy trust relationships and peer capability scopes.',
    category: 'mcp',
    icon: UserCheck,
  },
  {
    id: 'goal',
    name: 'goal',
    argsHint: '[objective]',
    description: 'Run multi-agent workflow until specified goal is completely finished.',
    category: 'workflow',
    icon: Sparkles,
    takesArgs: true,
  },
  {
    id: 'schedule',
    name: 'schedule',
    argsHint: '[interval or timer]',
    description: 'Anchor recurring consensus heartbeat or one-time timer.',
    category: 'workflow',
    icon: Clock,
    takesArgs: true,
  },
  {
    id: 'browser',
    name: 'browser',
    argsHint: '[task or url]',
    description: 'Invoke browser verification subagent for live web inspection.',
    category: 'workflow',
    icon: Globe,
    takesArgs: true,
  },
  {
    id: 'learn',
    name: 'learn',
    argsHint: '[rule or invariant]',
    description: 'Reflect on consensus merges to capture reusable protocol rules.',
    category: 'workflow',
    icon: Lightbulb,
    takesArgs: true,
  },
  {
    id: 'btw',
    name: 'btw',
    argsHint: '[question]',
    description: 'Ask a quick question without interrupting the main consensus stream.',
    category: 'workflow',
    icon: HelpCircle,
    takesArgs: true,
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'Clear active room message feed.',
    category: 'diagnostics',
    icon: Trash2,
  },
  {
    id: 'help',
    name: 'help',
    description: 'List all available ACR slash directives and security commands.',
    category: 'diagnostics',
    icon: FileText,
  },
];
