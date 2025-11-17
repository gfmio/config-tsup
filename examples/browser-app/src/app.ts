// Main application entry point
import { TodoList } from './components/TodoList';
import { ApiClient } from './services/ApiClient';
import { initWorker } from './utils/worker-bridge';

// Initialize the application
async function init() {
  console.log('Initializing app...');

  // Start the web worker
  const worker = await initWorker();

  // Create API client
  const api = new ApiClient('https://api.example.com');

  // Initialize UI components
  const todoList = new TodoList('#todo-container', api);
  await todoList.render();

  // Setup event listeners
  document.addEventListener('DOMContentLoaded', () => {
    console.log('App ready!');
  });

  // Communicate with worker
  worker.postMessage({ type: 'START_PROCESSING' });
  worker.addEventListener('message', (event) => {
    if (event.data.type === 'PROCESSING_COMPLETE') {
      console.log('Worker processing complete:', event.data.result);
    }
  });
}

// Handle dynamic imports for lazy loading
async function loadAdvancedFeatures() {
  const { AdvancedFeatures } = await import('./features/advanced');
  return new AdvancedFeatures();
}

// Export for global access
(window as any).App = {
  init,
  loadAdvancedFeatures
};

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.__TEST__) {
  init();
}