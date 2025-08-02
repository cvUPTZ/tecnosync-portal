import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  full_name: string;
  position: string;
  bio?: string;
  photo_url?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers }) => {
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="text-center">
              <CardContent className="pt-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.photo_url} alt={member.full_name} />
                  <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{member.full_name}</h3>
                <p className="text-tfa-blue">{member.position}</p>
                {member.bio && (
                  <p className="text-sm text-gray-600 mt-2">{member.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;
