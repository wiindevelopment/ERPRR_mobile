import React from 'react';
import GinReturnTabList from '../components/GinReturnTabList';
import { getIncomingGins, getIncomingReturns, verifyGinArrival, verifyReturnArrival } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function IncomingGatePassesScreen() {
  const { user } = useAuth();

  return (
    <GinReturnTabList
      ginLabel="Incoming GINs"
      returnLabel="Incoming Returns"
      accentColor="#176B4D"
      fetchGins={getIncomingGins}
      fetchReturns={getIncomingReturns}
      ginVerified={(item) => item.isArrivalGateVerified === true}
      returnVerified={(item) => item.isArrivalGateVerified === true}
      onVerifyGin={(item) => verifyGinArrival(item.ginId, user?.employeeCode ?? '')}
      onVerifyReturn={(item) => verifyReturnArrival(item.stockReturnId, user?.employeeCode ?? '')}
    />
  );
}
