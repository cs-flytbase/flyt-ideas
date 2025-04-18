'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { MainLayout } from '@/components/main-layout';

// ⛳ Fix: Accept async params object (Next.js 15 compatibility)
export default async function HelpRequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 👈 must await this or build will fail

  const [newResponse, setNewResponse] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'open' | 'assigned' | 'in_progress' | 'resolved'>('assigned');

  // Simulated help request (replace with fetch logic later)
  const helpRequest = {
    id,
    title: 'Authentication flow not working properly',
    description: `We're experiencing issues with our authentication flow where users are sometimes getting logged out unexpectedly...`,
    status: currentStatus,
    priority: 'high' as const,
    createdAt: '2025-03-17T14:30:00Z',
    createdBy: {
      id: 'user2',
      name: 'Pat Miller',
      avatarUrl: 'https://avatars.githubusercontent.com/u/4567890'
    },
    assignedTo: {
      id: 'user3',
      name: 'Alex Johnson',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1234567'
    },
    tags: ['auth', 'clerk', 'bug'],
    responses: [
      {
        id: '1',
        content: 'Have you checked the token expiration settings in your Clerk dashboard?',
        createdAt: '2025-03-17T15:45:00Z',
        user: {
          id: 'user3',
          name: 'Alex Johnson',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1234567'
        }
      }
    ]
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

  const getStatusBadge = (status: typeof currentStatus) => {
    const map = {
      open: 'bg-green-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      resolved: 'border text-muted-foreground'
    };
    return <Badge className={map[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const map = {
      low: 'bg-slate-100',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-amber-100 text-amber-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return <Badge className={map[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const handleStatusChange = (val: string) =>
    setCurrentStatus(val as typeof currentStatus);

  const handleSubmitResponse = () => {
    console.log('Response submitted:', newResponse);
    setNewResponse('');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/help-requests">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="ml-1">Back</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{helpRequest.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(helpRequest.status)}
                    {getPriorityBadge(helpRequest.priority)}
                  </div>
                  <CardDescription className="mt-2">
                    Requested by {helpRequest.createdBy.name} on {formatDate(helpRequest.createdAt)}
                  </CardDescription>
                </div>
                <Select value={helpRequest.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {helpRequest.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={helpRequest.createdBy.avatarUrl} />
                  <AvatarFallback>{helpRequest.createdBy.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{helpRequest.createdBy.name}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {formatDate(helpRequest.createdAt)}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{helpRequest.description}</p>
                </div>
              </div>
            </CardContent>
            {helpRequest.assignedTo && (
              <CardFooter className="bg-muted/50 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Assigned to:</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={helpRequest.assignedTo.avatarUrl} />
                      <AvatarFallback>{helpRequest.assignedTo.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{helpRequest.assignedTo.name}</span>
                  </div>
                  <Button size="sm" variant="outline">Reassign</Button>
                </div>
              </CardFooter>
            )}
          </Card>

          <h2 className="text-xl font-semibold mt-4">Responses ({helpRequest.responses.length})</h2>

          {helpRequest.responses.map(response => (
            <Card key={response.id}>
              <CardHeader className="pb-2">
                <div className="flex gap-2 items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={response.user.avatarUrl} />
                    <AvatarFallback>{response.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{response.user.name}</div>
                    <CardDescription>{formatDate(response.createdAt)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{response.content}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Add a Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Write your response..."
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button onClick={handleSubmitResponse}>Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
