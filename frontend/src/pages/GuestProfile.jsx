import React from 'react';
import Guest360Details from '../components/GuestManagement/Guest360Details';

export default function GuestProfile({ guest, onBack }) {
  const targetId = guest?.id || guest?.guest_id || guest?.guestId || guest?.targetId;
  return (
    <Guest360Details
      guestId={targetId}
      guestObj={guest}
      onBack={onBack}
    />
  );
}
