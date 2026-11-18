import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThreeBackground } from './components/ThreeBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomSimulator } from './components/RoomSimulator';
import { GraphiteDiffViewer } from './components/GraphiteDiffViewer';
import { IntegrationStudio } from './components/IntegrationStudio';
import { ArchitectureGrid } from './components/ArchitectureGrid';
import { TelemetryTicker } from './components/TelemetryTicker';
import { Footer } from './components/Footer';
import { OpsRoomSection } from './components/opsroom/OpsRoomSection';

const CommandPalette = lazy(() =>
  import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);
const ConnectMcpModal = lazy(() =>
  import('./components/ConnectMcpModal').then((m) => ({ default: m.ConnectMcpModal }))
);
const MetaMcpStudio = lazy(() =>
  import('./components/MetaMcpStudio').then((m) => ({ default: m.MetaMcpStudio }))
);
const AdvancedSettingsModal = lazy(() =>
  import('./components/AdvancedSettingsModal').then((m) => ({ default: m.AdvancedSettingsModal }))
);
const OpsRoomModal = lazy(() =>
  import('./components/opsroom/OpsRoomModal').then((m) => ({ default: m.OpsRoomModal }))
);
const OpsRoomPage = lazy(() =>
  import('./pages/OpsRoomPage').then((m) => ({ default: m.OpsRoomPage }))
);
const AcrChatApp = lazy(() =>
  import('./app/AcrChatApp').then((m) => ({ default: m.AcrChatApp }))
);
const ThreePaneWorkspace = lazy(() =>
  import('./components/workspace/ThreePaneWorkspace').then((m) => ({ default: m.ThreePaneWorkspace }))
);

export const App: React.FC = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isConnectMcpOpen, setIsConnectMcpOpen] = useState(false);
  const [isMetaMcpOpen, setIsMetaMcpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpsRoomModalOpen, setIsOpsRoomModalOpen] = useState(false);

  const resolveViewMode = (): 'showcase' | 'opsroom' | 'app' | 'workspace' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/workspace' || path === '/workspace/' || hash.includes('workspace')) {
        return 'workspace';
      }
      if (path === '/opsroom' || path === '/opsroom/' || hash.includes('opsroom')) {
        return 'opsroom';
      }
      if (path === '/app' || path === '/app/' || hash.includes('app')) {
        return 'app';
      }
    }
    return 'showcase';
  };

  const [viewMode, setViewMode] = useState<'showcase' | 'opsroom' | 'app' | 'workspace'>(resolveViewMode);

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
      // Cmd/Ctrl+K triggers Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }
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

  const handleOpenWorkspacePage = () => {
    setViewMode('workspace');
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', '/workspace');
      } catch {
        window.location.hash = '#/workspace';
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
    } else if (actionId === 'jump-workspace' || actionId === 'open-workspace') {
      handleOpenWorkspacePage();
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

  const routeFallback = (
    <div className="min-h-screen bg-[#000000] text-zinc-400 font-mono text-xs flex items-center justify-center">
      INITIALIZING LOCAL WORKSTATION VIEW...
    </div>
  );

  const sharedModals = (
    <>
      {isCommandOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isCommandOpen}
            onClose={() => setIsCommandOpen(false)}
            onSelectAction={handleCommandAction}
          />
        </Suspense>
      )}

      {isConnectMcpOpen && (
        <Suspense fallback={null}>
          <ConnectMcpModal
            isOpen={isConnectMcpOpen}
            onClose={() => setIsConnectMcpOpen(false)}
            onLaunchLocalApp={handleLaunchApp}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Suspense>
      )}

      {isMetaMcpOpen && (
        <Suspense fallback={null}>
          <MetaMcpStudio
            isOpen={isMetaMcpOpen}
            onClose={() => setIsMetaMcpOpen(false)}
          />
        </Suspense>
      )}

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <AdvancedSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </Suspense>
      )}

      {isOpsRoomModalOpen && (
        <Suspense fallback={null}>
          <OpsRoomModal
            isOpen={isOpsRoomModalOpen}
            onClose={() => setIsOpsRoomModalOpen(false)}
          />
        </Suspense>
      )}
    </>
  );

  // If in authentic application mode, render full-screen AcrChatApp
  if (viewMode === 'app') {
    return (
      <>
        <Suspense fallback={routeFallback}>
          <AcrChatApp onBackToShowcase={handleBackToShowcase} />
        </Suspense>
        {sharedModals}
      </>
    );
  }

  // If in 3-pane deliberation workspace mode, render ThreePaneWorkspace
  if (viewMode === 'workspace') {
    return (
      <>
        <div className="min-h-screen bg-[#000000] p-3 md:p-6 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => handleBackToShowcase()}
              className="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded bg-[#0D0D11] border border-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              [BACK TO SHOWCASE]
            </button>
            <span className="text-xs font-mono text-[#FF8C42]">
              [DUAL-LAYOUT WCAG 2.2 AAA WORKSPACE]
            </span>
          </div>
          <main id="main-content" className="flex-1">
            <Suspense fallback={routeFallback}>
              <ThreePaneWorkspace />
            </Suspense>
          </main>
        </div>
        {sharedModals}
      </>
    );
  }

  // If in dedicated OpsRoom mode, render dedicated OpsRoomPage
  if (viewMode === 'opsroom') {
    return (
      <>
        <Suspense fallback={routeFallback}>
          <OpsRoomPage
            onBackToShowcase={handleBackToShowcase}
            onLaunchApp={handleLaunchApp}
            onNavigate={(sectionId) => {
              handleBackToShowcase();
              setTimeout(() => handleNavigate(sectionId), 60);
            }}
            onOpenCommand={() => setIsCommandOpen(true)}
            onOpenConnectMcp={() => setIsConnectMcpOpen(true)}
            onOpenMetaMcp={() => setIsMetaMcpOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Suspense>
        {sharedModals}
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#000000] text-zinc-100 selection:bg-[#FF5500]/30 selection:text-white font-sans">
      {/* 3D Spatial Background */}
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
        <main id="main-content" className="flex-1">
          <Hero
            onExploreSimulator={() => handleNavigate('simulator')}
            onExploreSDK={() => handleNavigate('sdk')}
            onExploreOpsRoom={handleOpenOpsRoomPage}
          />

          {/* ACR OpsRoom - Enterprise War Room */}
          <OpsRoomSection
            id="opsroom"
            onOpenModal={() => setIsOpsRoomModalOpen(true)}
            onOpenDedicatedPage={handleOpenOpsRoomPage}
          />

          {/* Live Room Simulator */}
          <RoomSimulator />

          {/* Stacked PR & AST Code Review Diff Viewer */}
          <GraphiteDiffViewer />

          {/* Local Developer Integration Studio */}
          <IntegrationStudio />

          {/* 4-Monolith Blueprint */}
          <ArchitectureGrid />

          {/* Live Protocol Telemetry Stream */}
          <TelemetryTicker />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {sharedModals}
    </div>
  );
};

export default App;
