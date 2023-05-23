import wasm from './main.wasm';
import './wasm_exec';

if (!WebAssembly.instantiateStreaming) {
  // polyfill
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

const go = new Go();

export const GreenfieldMessageSdk = async () => {
  const { module, instance } = await wasm({ ...go.importObject });
  go.run(instance);

  const methods = ['add'];

  let G = {};

  methods.map((method) => {
    G[method] = window.GMESSAGE[method];
  });

  WebAssembly.instantiate(module, go.importObject);

  return G;
};
