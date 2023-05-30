import { fetchWithTimeout } from '@/utils/http';
import { IFetchNonce, IUpdateOneSpPubKeyParams } from '../types/storage';

export const fetchNonce = async ({
  spEndpoint,
  spName,
  spAddress,
  address,
  domain,
}: IFetchNonce) => {
  const url = `${spEndpoint}/auth/request_nonce`;
  const headers = new Headers({
    'X-Gnfd-User-Address': address,
    'X-Gnfd-App-Domain': domain,
  });
  const result = await fetchWithTimeout(url, {
    headers,
  });
  if (!result.ok) {
    return { code: -1, nonce: null };
  }
  const res = await result.json();

  return {
    endpoint: spEndpoint,
    address: spAddress,
    name: spName,
    nonce: res.next_nonce,
  };
};

export const updateOneSpPubKey = async ({
  address,
  domain,
  sp,
  pubKey,
  expireDate,
  authorization,
}: IUpdateOneSpPubKeyParams) => {
  const url = `${sp.endpoint}/auth/update_key`;
  const nonce = sp.nonce + '';
  const headers = new Headers({
    'X-Gnfd-User-Address': address,
    'X-Gnfd-App-Domain': domain,
    'X-Gnfd-App-Reg-Nonce': nonce,
    'X-Gnfd-App-Reg-Public-Key': pubKey,
    'X-Gnfd-App-Reg-Expiry-Date': expireDate,
    Authorization: authorization,
  });
  const result = await fetchWithTimeout(url, {
    headers,
    method: 'POST',
  });
  if (!result.ok) {
    return { code: -1, data: { address }, message: 'upload sp pubKey error.' };
  }

  return {
    code: 0,
    data: {
      ...sp,
    },
  };
};