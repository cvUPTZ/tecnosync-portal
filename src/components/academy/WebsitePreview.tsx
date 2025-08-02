// components/academy/WebsitePreview.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Smartphone, Monitor } from 'lucide-react';

interface WebsitePreviewProps {
  subdomain: string;
  academyName: string;
  template: string;
  primaryColor: string;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  subdomain,
  academyName,
  template,
  primaryColor
}) => {
  const publicUrl = `${window.location.origin}/site/${subdomain}`;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Website Preview
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Monitor className="h-4 w-4 mr-1" />
              Desktop
            </Button>
            <Button variant="outline" size="sm">
              <Smartphone className="h-4 w-4 mr-1" />
              Mobile
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="border rounded-lg p-6 text-white text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <h1 className="text-2xl font-bold mb-2">{academyName}</h1>
            <p className="opacity-90">Welcome to our Football Academy where champions are made!</p>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Your website is live at:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {publicUrl}
              </code>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="font-medium">Template</div>
              <div className="text-gray-600 capitalize">{template}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="font-medium">Theme Color</div>
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-gray-600">{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
