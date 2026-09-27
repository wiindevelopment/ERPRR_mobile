import React from 'react';
import GinReturnTabList from '../components/GinReturnTabList';
import { getCreatedGins, getCreatedReturns, verifyGinGate, verifyReturnGate } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function OutgoingGatePassesScreen() {
  const { user } = useAuth();

  return (
    <GinReturnTabList
      ginLabel="Created GINs"
      returnLabel="Created Returns"
      accentColor="#B9560F"
      fetchGins={getCreatedGins}
      fetchReturns={getCreatedReturns}
      ginVerified={(item) => item.isGateVerified === true}
      returnVerified={(item) => item.isGateVerified === true}
      ginFilter={(item) => item.isAuthorized === true}
      returnFilter={(item) => item.isApproved === true}
      onVerifyGin={(item) => verifyGinGate(item.ginId, user?.employeeCode ?? '')}
      onVerifyReturn={(item) => verifyReturnGate(item.stockReturnId, user?.employeeCode ?? '')}
    />
  );
}
