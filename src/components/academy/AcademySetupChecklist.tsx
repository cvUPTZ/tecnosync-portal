import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [tasks, setTasks] = useState<SetupTask[]>([
    {
      id: 'website-settings',
      title: 'Configure Website Settings',
      description: 'Set up your academy\'s primary color, logo, and contact information',
      completed: false,
      link: '/website-content',
      priority: 'high'
    },
    {
      id: 'team-members',
      title: 'Add Team Members',
      description: 'Add coaches and staff members to your public website',
      completed: false,
      link: '/website-content',
      priority: 'high'
    },
    {
      id: 'about-page',
      title: 'Setup About Page',
      description: 'Create compelling content for your academy\'s about section',
      completed: false,
      link: '/website-content',
      priority: 'medium'
    },
    {
      id: 'student-groups',
      title: 'Create Student Groups',
      description: 'Set up age groups and training categories',
      completed: false,
      link: '/admin/student-management',
      priority: 'high'
    },
    {
      id: 'fee-structure',
      title: 'Define Fee Structure',
      description: 'Set up monthly fees and payment structure',
      completed: false,
      link: '/admin/finance',
      priority: 'medium'
    }
  ]);

  // Calculate completion percentage
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

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
          Academy Setup Progress
          <Badge variant="outline">
            {completionPercentage}% Complete
          </Badge>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{task.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                {task.link && !task.completed && (
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href={task.link} className="inline-flex items-center gap-1">
                      Complete Task
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademySetupChecklist;