import { SimulateResponse } from '@bnb-chain/greenfield-cosmos-types/cosmos/tx/v1beta1/service';
import { formatEther } from '@ethersproject/units';

export interface ISimulateGasFee {
  gasLimit: bigint;
  gasPrice: string;
  gasFee: string;
}

export const getGasFeeBySimulate = (
  simulateTxInfo: SimulateResponse,
  denom = 'BNB',
): ISimulateGasFee => {
  if (!simulateTxInfo.gasInfo) throw new Error('gasInfo not found');

  const gasLimit = BigInt(simulateTxInfo.gasInfo?.gasUsed.toNumber());
  const gasPrice = simulateTxInfo.gasInfo?.minGasPrice.replace(denom, '');
  const gasFee = gasLimit * BigInt(gasPrice);

  return {
    gasLimit,
    gasPrice,
    gasFee: formatEther(String(gasFee)),
  };
};