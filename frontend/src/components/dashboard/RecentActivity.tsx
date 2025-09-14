import Card, { CardHeader, CardContent } from '../ui/Card';

interface ActivityItem {
  id: string;
  type: 'sale' | 'inventory' | 'support' | 'coupon';
  message: string;
  timestamp: string;
}

export default function RecentActivity() {
  // Mock data - will be replaced with real data from microservices
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'sale',
      message: 'New order #1234 received',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      type: 'inventory',
      message: 'Product "Laptop" stock updated',
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      type: 'support',
      message: 'Support ticket #567 created',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'coupon',
      message: 'Coupon "SAVE20" activated',
      timestamp: '2 hours ago'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'inventory':
        return '📦';
      case 'support':
        return '🎫';
      case 'coupon':
        return '🎟️';
      default:
        return '📋';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}