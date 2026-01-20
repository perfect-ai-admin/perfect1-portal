import FinancialWorkbench from '../financial/FinancialWorkbench';
import UpgradePrompt from '../UpgradePrompt';

export default function FinancialTab({ data, hasAccess = true }) {
  if (!hasAccess) {
    return <UpgradePrompt feature="finance" />;
  }
  
  return <FinancialWorkbench data={data} />;
}