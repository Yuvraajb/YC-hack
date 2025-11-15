import PaymentCard from '../PaymentCard';

export default function PaymentCardExample() {
  const mockPayment = {
    txId: 'tx_9f8e7d6c5b4a3210fedcba9876543210',
    amount: 0.75,
    timestamp: 'Today at 3:42 PM',
    status: 'success' as const,
  };

  return (
    <div className="max-w-sm">
      <PaymentCard payment={mockPayment} />
    </div>
  );
}
