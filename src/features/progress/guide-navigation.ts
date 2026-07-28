export function nextStep(currentStep: number, totalSteps: number) {
  return Math.min(currentStep + 1, Math.max(totalSteps - 1, 0));
}

export function previousStep(currentStep: number) {
  return Math.max(currentStep - 1, 0);
}

export function restartGuide() {
  return 0;
}
