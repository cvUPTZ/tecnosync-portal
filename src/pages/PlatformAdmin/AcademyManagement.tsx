import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditAcademyForm from '@/components/PlatformAdmin/EditAcademyForm';

interface Academy {
  id: string;
  name: string;
  subdomain: string;
  created_at: string;
  modules: Record<string, boolean>;
}

const AcademyManagement = () => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAcademies();
  }, []);

  const fetchAcademies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcademies(data || []);
    } catch (error) {
      console.error('Error fetching academies:', error);
      toast({ title: 'Error', description: 'Failed to fetch academies.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading academies...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Academies</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Academies</CardTitle>
          <CardDescription>
            A list of all academies on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academies.map((academy) => (
                <TableRow key={academy.id}>
                  <TableCell className="font-medium">{academy.name}</TableCell>
                  <TableCell>{academy.subdomain}</TableCell>
                  <TableCell>{new Date(academy.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Dialog open={editingAcademy?.id === academy.id} onOpenChange={(isOpen) => !isOpen && setEditingAcademy(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingAcademy(academy)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {editingAcademy?.name}</DialogTitle>
                        </DialogHeader>
                        {editingAcademy && (
                          <EditAcademyForm
                            academy={editingAcademy}
                            onSuccess={() => {
                              setEditingAcademy(null);
                              fetchAcademies();
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyManagement;
