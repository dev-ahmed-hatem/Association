import BankAccountManager from "./bank_accounts/BankAccountManager";
import RankFeeManager from "./rank-fees/RankFeeManager";
import TransactionTypeManager from "./transaction-types/TransactionTypeManager";

const FinancialsSettingsTab = () => {
  return (
    <div className="space-y-6">
      <BankAccountManager />
      <TransactionTypeManager />
      <RankFeeManager />
    </div>
  );
};

export default FinancialsSettingsTab;
