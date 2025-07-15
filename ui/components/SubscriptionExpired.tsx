'use client';

interface SubscriptionExpiredProps {
  subscriptionEndDate?: string;
}

export default function SubscriptionExpired({ subscriptionEndDate }: SubscriptionExpiredProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Aboneliğiniz sona erdi</h2>
        {subscriptionEndDate && (
          <p className="text-gray-700 dark:text-gray-300">
            {new Date(subscriptionEndDate).toLocaleDateString('tr-TR')} tarihinde aboneliğiniz sona erdi.
          </p>
        )}
        <a href="/dashboard/billing" className="btn btn-primary btn-md">
          Aboneliği Yenile
        </a>
      </div>
    </div>
  );
}

