import React from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import App from './App';
import './index.css';
import { GlobalErrorBoundary } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import type { UIComponent } from '@/types/canvas';

// Application version for logging and backups
const APP_VERSION = '1.0.0';

// Initialize theme detection and application preferences
const initializeTheme = (): 'dark' | 'light' => {
  // Check if theme is already saved in localStorage
  const savedTheme = localStorage.getItem('editor-theme') as 'dark' | 'light' | null;

  if (savedTheme) {
    return savedTheme;
  }

  // Detect system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const detectedTheme = systemPrefersDark ? 'dark' : 'light';

  // Save detected preference
  localStorage.setItem('editor-theme', detectedTheme);

  return detectedTheme;
};

// Create default root component
const createDefaultRootComponent = (): UIComponent => {
  const rootId = 'root';

  return {
    id: rootId,
    type: 'container',
    props: {},
    styles: {
      display: { base: 'block' },
      minHeight: { base: '100vh' },
      width: { base: '100%' },
      backgroundColor: { base: '#ffffff' },
    },
    parent: null,
    children: [],
    metadata: {
      isVisible: true,
      isLocked: false,
      name: 'Root Container',
    },
  };
};

// Initialize store state from localStorage or create default project
const initializeStore = () => {
  try {
    // Check for saved project data
    const savedProjectData = localStorage.getItem('last_project');

    if (savedProjectData) {
      const parsedData = JSON.parse(savedProjectData);

      // Validate that the data has the expected structure
      if (parsedData && typeof parsedData === 'object' && parsedData.components) {
        // Load the saved state
        useEditorStore.getState().loadState(parsedData.components);

        // Ensure rootId is set correctly
        const rootIds = Object.keys(parsedData.components).filter(
          id => parsedData.components[id].parent === null
        );

        if (rootIds.length > 0) {
          useEditorStore.getState().setRootId(rootIds[0]);
        } else {
          // If no root found, create default
          initializeDefaultProject();
        }

        console.info(`[CraftUI v${APP_VERSION}] Loaded saved project with ${Object.keys(parsedData.components).length} components`);
      } else {
        console.warn('[CraftUI] Invalid saved project data, initializing default project');
        initializeDefaultProject();
      }
    } else {
      // No saved data, create default project
      initializeDefaultProject();
    }
  } catch (error) {
    console.error('[CraftUI] Failed to load saved project:', error);
    // Initialize default project on error
    initializeDefaultProject();
  }
};

// Create and set default project structure
const initializeDefaultProject = () => {
  const rootComponent = createDefaultRootComponent();

  // Set the store state
  useEditorStore.getState().loadState({ [rootComponent.id]: rootComponent });
  useEditorStore.getState().setRootId(rootComponent.id);

  console.info(`[CraftUI v${APP_VERSION}] Initialized default project with root container`);
};

// Register service worker for PWA functionality (production only)
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.info('[CraftUI] Service Worker registered:', registration.scope);
    } catch (error) {
      console.error('[CraftUI] Service Worker registration failed:', error);
    }
  }
};

// Initialize application
const initializeApp = () => {
  // Detect and set theme
  const theme = initializeTheme();
  console.info(`[CraftUI v${APP_VERSION}] Theme initialized: ${theme}`);

  // Initialize store state
  initializeStore();

  // Register service worker
  registerServiceWorker();

  // Log application start
  console.info(`[CraftUI v${APP_VERSION}] Application initialized successfully`);
};

// Initialize before rendering
initializeApp();

// Create root and render application
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
