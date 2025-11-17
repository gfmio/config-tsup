// Web Worker for background processing

interface WorkerMessage {
  type: 'START_PROCESSING' | 'STOP_PROCESSING';
  data?: any;
}

interface WorkerResponse {
  type: 'PROCESSING_COMPLETE' | 'PROCESSING_ERROR';
  result?: any;
  error?: string;
}

// Heavy computation example
function processData(data: number[]): number[] {
  return data.map(n => {
    // Simulate expensive calculation
    let result = n;
    for (let i = 0; i < 1000; i++) {
      result = Math.sqrt(result * result + 1);
    }
    return result;
  });
}

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  switch (type) {
    case 'START_PROCESSING':
      try {
        // Simulate processing with sample data
        const input = Array.from({ length: 1000 }, (_, i) => i);
        const result = processData(input);

        const response: WorkerResponse = {
          type: 'PROCESSING_COMPLETE',
          result: {
            processed: result.length,
            sample: result.slice(0, 5)
          }
        };

        self.postMessage(response);
      } catch (error) {
        const response: WorkerResponse = {
          type: 'PROCESSING_ERROR',
          error: error.message
        };
        self.postMessage(response);
      }
      break;

    case 'STOP_PROCESSING':
      // Clean up if needed
      break;
  }
});

// Export type for TypeScript
export {};