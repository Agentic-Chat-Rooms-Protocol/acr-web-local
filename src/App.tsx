import React, { useState, useEffect } from 'react';
import { ThreeBackground } from './components/ThreeBackground';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { Hero } from './components/Hero';
import { RoomSimulator } from './components/RoomSimulator';
import { GraphiteDiffViewer } from './components/GraphiteDiffViewer';
import { IntegrationStudio } from './components/IntegrationStudio';
import { ArchitectureGrid } from './components/ArchitectureGrid';
import { TelemetryTicker } from './components/TelemetryTicker';
import { Footer } from './components/Footer';
import { ConnectMcpModal } from './components/ConnectMcpModal';
import { MetaMcpStudio } from './components/MetaMcpStudio';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { OpsRoomSection } from './components/opsroom/OpsRoomSection';
import { OpsRoomModal } from './components/opsroom/OpsRoomModal';
import { OpsRoomPage } from './pages/OpsRoomPage';
import { AcrChatApp } from './app/AcrChatApp';

export const App: React.FC = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isConnectMcpOpen, setIsConnectMcpOpen] = useState(false);
  const [isMetaMcpOpen, setIsMetaMcpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpsRoomModalOpen, setIsOpsRoomModalOpen] = useState(false);

  const resolveViewMode = (): 'showcase' | 'opsroom' | 'app' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/opsroom' || path === '/opsroom/' || hash.includes('opsroom')) {
        return 'opsroom';
      }
      if (path === '/app' || path === '/app/' || hash.includes('app')) {
        return 'app';
      }
    }
    return 'showcase';
  };

  const [viewMode, setViewMode] = useState<'showcase' | 'opsroom' | 'app'>(resolveViewMode);

  useEffect(() => {
    const handleUrlChange = () => {
      const mode = resolveViewMode();
      setViewMode(mode);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Shift+S triggers Advanced Settings
      if (e.shiftKey && (e.key === 'S' || e.key === 's') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenOpsRoomPage = () => {
    setViewMode('opsroom');
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', '/opsroom');
      } catch {
        window.location.hash = '#/opsroom';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLaunchApp = () => {
    setViewMode('app');
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', '/app');
      } catch {
        window.location.hash = '#/app';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToShowcase = () => {
    setViewMode('showcase');
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCommandAction = (actionId: string) => {
    if (actionId === 'toggle-command') {
      setIsCommandOpen((prev) => !prev);
      return;
    }

    if (actionId === 'launch-app') {
      handleLaunchApp();
    } else if (actionId === 'open-meta-mcp') {
      setIsMetaMcpOpen(true);
    } else if (actionId === 'open-settings') {
      setIsSettingsOpen(true);
    } else if (actionId === 'jump-opsroom' || actionId === 'view-battlecard' || actionId === 'view-atlas2' || actionId === 'calc-roi') {
      handleOpenOpsRoomPage();
    } else if (actionId === 'simulate-incident') {
      setIsOpsRoomModalOpen(true);
    } else if (actionId === 'jump-simulator' || actionId === 'escalate-test') {
      handleNavigate('simulator');
    } else if (actionId === 'copy-mcp') {
      handleNavigate('sdk');
    } else if (actionId === 'view-dag') {
      handleNavigate('diff-viewer');
    } else if (actionId === 'inspect-did') {
      handleNavigate('architecture');
    }
  };

  // If in authentic application mode, render full-screen AcrChatApp
  if (viewMode === 'app') {
    return <AcrChatApp onBackToShowcase={handleBackToShowcase} />;
  }

  // If in dedicated OpsRoom mode, render dedicated OpsRoomPage
  if (viewMode === 'opsroom') {
    return (
      <OpsRoomPage
        onBackToShowcase={handleBackToShowcase}
        onLaunchApp={handleLaunchApp}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030305] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200 font-sans">
      {/* Hyper-Premium 3D-Animated Spatial Background (Zero Grid, Pure R3F Spatial Core) */}
      <ThreeBackground />

      {/* Main Page Layout */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Glass Navbar with Launch App CTA */}
        <Navbar
          onOpenCommand={() => setIsCommandOpen(true)}
          onNavigate={handleNavigate}
          onLaunchApp={handleLaunchApp}
          onOpenConnectMcp={() => setIsConnectMcpOpen(true)}
          onOpenMetaMcp={() => setIsMetaMcpOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenOpsRoomPage={handleOpenOpsRoomPage}
        />

        {/* Hero Section */}
        <main className="flex-1">
          <Hero
            onExploreSimulator={() => handleNavigate('simulator')}
            onExploreSDK={() => handleNavigate('sdk')}
            onExploreOpsRoom={handleOpenOpsRoomPage}
          />

          {/* ACR OpsRoom - Autonomous Enterprise War Room (Beyond Salesforce Agentforce & Slack) */}
          <OpsRoomSection 
            id="opsroom"
            onOpenModal={() => setIsOpsRoomModalOpen(true)}
            onOpenDedicatedPage={handleOpenOpsRoomPage}
          />

          {/* Intercom + Graphite Live Room Simulator */}
          <RoomSimulator />

          {/* Graphite Stacked PR & AST Code Review Diff Viewer */}
          <GraphiteDiffViewer />

          {/* Resend Developer Studio */}
          <IntegrationStudio />

          {/* Lemni + Graphite 4-Monolith Blueprint */}
          <ArchitectureGrid />

          {/* Live Protocol Telemetry Stream */}
          <TelemetryTicker />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Graphite Keyboard Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectAction={handleCommandAction}
      />

      {/* Connect MCP Production Modal */}
      <ConnectMcpModal
        isOpen={isConnectMcpOpen}
        onClose={() => setIsConnectMcpOpen(false)}
        onLaunchCloudSandbox={handleLaunchApp}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ACR Meta-MCP Forward Proxy & Governance Studio */}
      <MetaMcpStudio
        isOpen={isMetaMcpOpen}
        onClose={() => setIsMetaMcpOpen(false)}
      />

      {/* ACR Advanced Settings & Port Mapping Modal */}
      <AdvancedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ACR OpsRoom Interactive War Room Modal */}
      <OpsRoomModal
        isOpen={isOpsRoomModalOpen}
        onClose={() => setIsOpsRoomModalOpen(false)}
      />
    </div>
  );
};

export default App;
