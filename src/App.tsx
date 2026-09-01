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
import { AcrChatApp } from './app/AcrChatApp';

export const App: React.FC = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isConnectMcpOpen, setIsConnectMcpOpen] = useState(false);
  const [isMetaMcpOpen, setIsMetaMcpOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'showcase' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('app')) return 'app';
    }
    return 'showcase';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('app')) {
        setViewMode('app');
      } else {
        setViewMode('showcase');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchApp = () => {
    setViewMode('app');
    window.location.hash = '#/app';
  };

  const handleBackToShowcase = () => {
    setViewMode('showcase');
    window.location.hash = '';
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
        />

        {/* Hero Section */}
        <main className="flex-1">
          <Hero
            onExploreSimulator={() => handleNavigate('simulator')}
            onExploreSDK={() => handleNavigate('sdk')}
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
      />

      {/* ACR Meta-MCP Forward Proxy & Governance Studio */}
      <MetaMcpStudio
        isOpen={isMetaMcpOpen}
        onClose={() => setIsMetaMcpOpen(false)}
      />
    </div>
  );
};

export default App;
