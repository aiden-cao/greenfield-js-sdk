import { Bucket } from '@/components/bucket';
import { Deposit } from '@/components/deposit';
import { Group } from '@/components/group';
import { Mirror } from '@/components/mirror';
import { ObjectComponent } from '@/components/object';
import { OffChainAuth } from '@/components/offchainauth';
import { Transfer } from '@/components/transfer';
import { WalletInfo } from '@/components/walletInfo';
import { Withdraw } from '@/components/withdraw';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useAccount } from 'wagmi';

export default function Tx() {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  if (!isMounted) return null;

  return (
    <div style={{ padding: 10 }}>
      <WalletInfo />

      <hr style={{ margin: '10px 0' }} />

      {isConnected && (
        <>
          <Deposit />
          <hr style={{ margin: '10px 0' }} />
          <Transfer />
          <hr style={{ margin: '10px 0' }} />
          <Withdraw />
          <hr style={{ margin: '10px 0' }} />
          <OffChainAuth />
          <hr style={{ margin: '10px 0' }} />
          <Bucket />
          <hr style={{ margin: '10px 0' }} />
          <ObjectComponent />
          <hr style={{ margin: '10px 0' }} />
          <Group />
          <hr style={{ margin: '10px 0' }} />
          <Mirror />
        </>
      )}
    </div>
  );
}
