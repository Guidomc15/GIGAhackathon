// Implements Qollab's callPromising interface using the local Python server.
function method(name) {
  return {
    async callPromising(arg) {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({method: name, arg}),
      });
      if (!response.ok) throw new Error(`Servidor local: HTTP ${response.status}`);
      return JSON.stringify(await response.json());
    },
  };
}

export const dispatch_json = method('dispatch_json');
export const start_json = method('start_json');
export const poll_json = method('poll_json');
export const demo_json = method('demo_json');
