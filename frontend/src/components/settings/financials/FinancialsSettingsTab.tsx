import BankAccountManager from "./bank_accounts/BankAccountManager";
import TransactionTypeManager from "./transaction-types/TransactionTypeManager";

const FinancialsSettingsTab = () => {
  return (
    <div className="space-y-6">
      <BankAccountManager />
      <TransactionTypeManager />
    </div>
  );
};

export default FinancialsSettingsTab;
