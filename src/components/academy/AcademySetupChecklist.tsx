// components/academy/AcademySetupChecklist.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
  priority: 'high' | 'medium' | 'low';
}

interface AcademySetupChecklistProps {
  academyId: string;
  academySubdomain: string;
}

const AcademySetupChecklist: React.FC<AcademySetupChecklistProps> = ({
  academyId,
  academySubdomain
}) => {
  const [setupTasks, setSetupTasks] = React.useState<SetupTask[]>([
    {
      id: 'logo',
      title: 'Upload Academy Logo',
      description: 'Add your academy logo to improve brand recognition',
      completed: false,
      link: `/admin/settings/branding`,
      priority: 'high'
    },
    {
      id: 'team',
      title: 'Add Team Members',
      description: 'Add coaches and staff to your public website',
      completed: false,
      link: `/admin/team`,
      priority: 'high'
    },
    {
      id: 'content',
      title: 'Customize Website Content',
      description: 'Update homepage and about page content',
      completed: false,
      link: `/admin/website/pages`,
      priority: 'medium'
    },
    {
      id: 'contact',
      title: 'Verify Contact Information',
      description: 'Ensure all contact details are correct',
      completed: false,
      link: `/admin/settings/contact`,
      priority: 'medium'
    },
    {
      id: 'students',
      title: 'Add First Students',
      description: 'Start managing your academy students',
      completed: false,
      link: `/admin/students`,
      priority: 'low'
    },
    {
      id: 'registration',
      title: 'Set Up Registration Forms',
      description: 'Configure registration process for new students',
      completed: false,
      link: `/admin/registration/settings`,
      priority: 'low'
    }
  ]);

  const completedTasks = setupTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / setupTasks.length) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Academy Setup Checklist
          <span className="text-sm font-normal text-gray-600">
            {completedTasks}/{setupTasks.length} completed
          </span>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupTasks.map((task) => (
          <div 
            key={task.id}
            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-shrink-0 mt-1">
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {task.title}
                </h4>
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {task.description}
              </p>
              {task.link && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  asChild
                >
                  <a href={task.link} className="inline-flex items-center">
                    Complete Task
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
