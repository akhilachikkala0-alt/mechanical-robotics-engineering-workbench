import React, { useState, useEffect } from 'react';
import { Sidebar, ActivePage } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { AuthModal } from './components/AuthModal';
import { DemoScenarioModal } from './components/DemoScenarioModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RobotDesignPage } from './pages/RobotDesignPage';
import { CalculationsPage } from './pages/CalculationsPage';
import { ComponentDatabasePage } from './pages/ComponentDatabasePage';
import { MotorSelectionPage } from './pages/MotorSelectionPage';
import { BearingSelectionPage } from './pages/BearingSelectionPage';
import { MaterialSelectionPage } from './pages/MaterialSelectionPage';
import { GripperSelectionPage } from './pages/GripperSelectionPage';
import { SensorsAndControllersPage } from './pages/SensorsAndControllersPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { CompatibilityPage } from './pages/CompatibilityPage';
import { SelectedComponentsPage } from './pages/SelectedComponentsPage';
import { CostEstimationPage } from './pages/CostEstimationPage';
import { DesignVersionsPage } from './pages/DesignVersionsPage';
import { TestingPage } from './pages/TestingPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { DbmsStudioPage } from './pages/DbmsStudioPage';

import { api } from './services/api';
import { Robot, Engineer } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [robots, setRobots] = useState<Robot[]>([]);
  const [currentRobot, setCurrentRobot] = useState<Robot | null>(null);
  const [currentUser, setCurrentUser] = useState<Engineer | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [bomCount, setBomCount] = useState(6);
  const [calculatedTorque, setCalculatedTorque] = useState(58.86);
  const [selectedShaftDia, setSelectedShaftDia] = useState(20);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Load active engineer (defaulting to engineer #1)
      const users = await api.getEngineers();
      if (users.length > 0) {
        setCurrentUser(users[0]);
      }

      // 2. Load robots
      const robotList = await api.getRobots();
      setRobots(robotList);
      if (robotList.length > 0) {
        setCurrentRobot(robotList[0]);
        loadBomCount(robotList[0].robot_id);
      }
    } catch (err) {
      console.error('App init error:', err);
    }
  };

  const loadBomCount = async (robotId: number) => {
    try {
      const components = await api.getRobotComponents(robotId);
      setBomCount(components.length);
    } catch (err) {
      console.error('Failed to load BOM count:', err);
    }
  };

  const handleSelectRobot = (robot: Robot) => {
    setCurrentRobot(robot);
    loadBomCount(robot.robot_id);
  };

  const handleRobotUpdated = async () => {
    const robotList = await api.getRobots();
    setRobots(robotList);
    if (currentRobot) {
      const updated = robotList.find((r) => r.robot_id === currentRobot.robot_id);
      if (updated) setCurrentRobot(updated);
    }
  };

  const handleComponentAllocated = () => {
    if (currentRobot) {
      loadBomCount(currentRobot.robot_id);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedComponentsCount={bomCount}
        databaseConnected={true}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          currentUser={currentUser}
          currentRobot={currentRobot}
          robots={robots}
          onSelectRobot={handleSelectRobot}
          onOpenSqlStudio={() => setActivePage('dbms_studio')}
          onRunDemoScenario={() => setDemoModalOpen(true)}
          onLogout={() => setAuthModalOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto pb-12">
            {activePage === 'dashboard' && (
              <DashboardPage
                onNavigate={(page) => setActivePage(page as ActivePage)}
                currentRobot={currentRobot}
              />
            )}

            {activePage === 'projects' && (
              <ProjectsPage
                engineer={currentUser}
                onSelectProject={() => setActivePage('robots')}
              />
            )}

            {activePage === 'robots' && (
              <RobotDesignPage
                currentRobot={currentRobot}
                onSelectRobot={handleSelectRobot}
                onRobotUpdated={handleRobotUpdated}
                onNavigateToCalculations={() => setActivePage('calculations')}
                onNavigateToMotors={() => setActivePage('motors')}
              />
            )}

            {activePage === 'calculations' && (
              <CalculationsPage
                currentRobot={currentRobot}
                onNavigateToMotors={(torque) => {
                  setCalculatedTorque(torque);
                  setActivePage('motors');
                }}
              />
            )}

            {activePage === 'components' && (
              <ComponentDatabasePage
                currentRobot={currentRobot}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'motors' && (
              <MotorSelectionPage
                currentRobot={currentRobot}
                initialTorque={calculatedTorque}
                onNavigateToBearings={(shaftDia) => {
                  setSelectedShaftDia(shaftDia);
                  setActivePage('bearings');
                }}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'bearings' && (
              <BearingSelectionPage
                currentRobot={currentRobot}
                initialShaftDiameter={selectedShaftDia}
                onNavigateToMaterials={() => setActivePage('materials')}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'materials' && (
              <MaterialSelectionPage
                currentRobot={currentRobot}
                onNavigateToGrippers={() => setActivePage('grippers')}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'grippers' && (
              <GripperSelectionPage
                currentRobot={currentRobot}
                onNavigateToSensors={() => setActivePage('sensors')}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {(activePage === 'sensors' || activePage === 'controllers') && (
              <SensorsAndControllersPage
                currentRobot={currentRobot}
                onNavigateToComparison={() => setActivePage('comparison')}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'comparison' && (
              <ComparisonPage
                currentRobot={currentRobot}
                onNavigateToCompatibility={() => setActivePage('compatibility')}
                onComponentAllocated={handleComponentAllocated}
              />
            )}

            {activePage === 'compatibility' && (
              <CompatibilityPage
                currentRobot={currentRobot}
                onNavigateToBOM={() => setActivePage('selected_components')}
              />
            )}

            {activePage === 'selected_components' && (
              <SelectedComponentsPage
                currentRobot={currentRobot}
                onNavigateToCost={() => setActivePage('cost_estimation')}
                onNavigateToCatalog={() => setActivePage('components')}
              />
            )}

            {activePage === 'cost_estimation' && (
              <CostEstimationPage
                currentRobot={currentRobot}
                onNavigateToVersions={() => setActivePage('design_versions')}
              />
            )}

            {activePage === 'design_versions' && (
              <DesignVersionsPage
                currentRobot={currentRobot}
                onNavigateToTesting={() => setActivePage('testing')}
              />
            )}

            {activePage === 'testing' && (
              <TestingPage
                currentRobot={currentRobot}
                onNavigateToMaintenance={() => setActivePage('maintenance')}
              />
            )}

            {activePage === 'maintenance' && (
              <MaintenancePage
                currentRobot={currentRobot}
                onNavigateToDbms={() => setActivePage('reports')}
              />
            )}

            {activePage === 'reports' && (
              <ReportsPage
                currentRobot={currentRobot}
                onNavigateToDbms={() => setActivePage('dbms_studio')}
              />
            )}

            {activePage === 'dbms_studio' && <DbmsStudioPage />}
          </div>
        </main>
      </div>

      {/* Authentication & Profile Switching Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(eng) => setCurrentUser(eng)}
        currentEngineer={currentUser}
      />

      {/* Guided Engineering Demo Walkthrough Tour */}
      <DemoScenarioModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onNavigate={(page) => setActivePage(page)}
      />
    </div>
  );
}
