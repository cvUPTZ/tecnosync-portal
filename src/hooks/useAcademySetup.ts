import { useState, useEffect } from 'react';

export const useAcademySetup = (academyId?: string) => {
  const [setupStatus, setSetupStatus] = useState({
    isComplete: false,
    completedTasks: 0,
    totalTasks: 5
  });

  return setupStatus;
};