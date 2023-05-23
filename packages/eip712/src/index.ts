export const test = async () => {
  const { GreenfieldMessageSdk: GreenfieldWasmSdk } = await import('./wasm/web.js');

  const G = await GreenfieldWasmSdk();
  return G.add(1, 2);
};
