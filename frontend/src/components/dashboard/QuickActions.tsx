import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';

export default function QuickActions() {
  const actions = [
    { label: 'Add Product', action: () => console.log('Add Product') },
    { label: 'Create Coupon', action: () => console.log('Create Coupon') },
    { label: 'View Orders', action: () => console.log('View Orders') },
    { label: 'Support Tickets', action: () => console.log('Support Tickets') },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="w-full"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}