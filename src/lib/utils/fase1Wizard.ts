export function shouldShowBudgetStepOnEntry({
  isEditMode,
  hasPersistedItems,
}: {
  isEditMode: boolean;
  hasPersistedItems: boolean;
}) {
  return !isEditMode && !hasPersistedItems;
}
