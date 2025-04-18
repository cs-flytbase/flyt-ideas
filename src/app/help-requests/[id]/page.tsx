'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
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

interface PageProps {
  params: { id: string };
}

export default function HelpRequestDetailPage({ params }: PageProps) {
  const [newResponse, setNewResponse] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'open' | 'assigned' | 'in_progress' | 'resolved'>('assigned');

  const helpRequest = {
    id: params.id,
    title: 'Authentication flow not working properly',
    description: `We're experiencing issues with our authentication flow where users are sometimes getting logged out unexpectedly. I've verified that the tokens are being set correctly but something is causing them to expire or become invalid sooner than they should.

Steps to reproduce:
1. Login to the application
2. Navigate between pages for about 5 minutes
3. Attempt to access a protected route

Expected behavior: User stays logged in
Actual behavior: User is sometimes redirected to login

Any help debugging this would be much appreciated!`,
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
        id: 'response1',
        content: 'Have you checked the token expiration settings in your Clerk dashboard?',
        createdAt: '2025-03-17T15:45:00Z',
        user: {
          id: 'user3',
          name: 'Alex Johnson',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1234567'
        }
      },
      {
        id: 'response2',
        content: 'Thanks Alex, I checked and they seem okay. Could it be the refresh mechanism?',
        createdAt: '2025-03-17T16:30:00Z',
        user: {
          id: 'user2',
          name: 'Pat Miller',
          avatarUrl: 'https://avatars.githubusercontent.com/u/4567890'
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

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const colorMap = {
      low: 'bg-slate-100',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-amber-100 text-amber-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return <Badge className={colorMap[priority]}> {priority.charAt(0).toUpperCase() + priority.slice(1)} </Badge>;
  };

  const getStatusBadge = (status: typeof currentStatus) => {
    const badgeMap = {
      open: 'bg-green-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      resolved: 'border text-muted-foreground'
    };
    return <Badge className={badgeMap[status]}> {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} </Badge>;
  };

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value as typeof currentStatus);
  };

  const handleSubmitResponse = () => {
    console.log('Submitting response:', newResponse);
    setNewResponse('');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/help-requests">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="ml-1">Back to Help Requests</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle>{helpRequest.title}</CardTitle>
                    {getStatusBadge(helpRequest.status)}
                    {getPriorityBadge(helpRequest.priority)}
                  </div>
                  <CardDescription className="mt-2">
                    Requested by {helpRequest.createdBy.name} on {formatDate(helpRequest.createdAt)}
                  </CardDescription>
                </div>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
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
              <div className="mt-3 flex flex-wrap gap-2">
                {helpRequest.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage src={helpRequest.createdBy.avatarUrl} />
                  <AvatarFallback>{helpRequest.createdBy.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{helpRequest.createdBy.name}</div>
                  <div className="text-sm text-muted-foreground mb-2">{formatDate(helpRequest.createdAt)}</div>
                  <p className="whitespace-pre-wrap text-sm">{helpRequest.description}</p>
                </div>
              </div>
            </CardContent>
            {helpRequest.assignedTo && (
              <CardFooter className="bg-muted/50 border-t">
                <div className="flex w-full justify-between items-center">
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

          <h2 className="text-xl font-bold mt-6">Responses ({helpRequest.responses.length})</h2>

          <div className="space-y-4">
            {helpRequest.responses.map(response => (
              <Card key={response.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
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
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add a Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px]"
                placeholder="Write your response..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button onClick={handleSubmitResponse}>Submit Response</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
