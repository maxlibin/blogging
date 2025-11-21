"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, TrendingUp, Calendar, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

interface Post {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  wordpressLink?: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recentPosts = posts.slice(0, 5);
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500 text-lg">Welcome back! Here's what's happening with your blog.</p>
        </div>
        <Link href="/generate">
          <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 text-base px-6 py-6 rounded-full gap-2">
            <Sparkles size={18} fill="currentColor" className="text-purple-200" /> Create New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Posts" value={posts.length.toString()} icon={FileText} color="blue" />
        <StatCard title="Published" value={publishedCount.toString()} icon={TrendingUp} color="green" />
        <StatCard title="Drafts" value={draftCount.toString()} icon={Calendar} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
              <div className="space-y-1">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest content generated and published.</CardDescription>
              </div>
              <Link href="/generate">
                <Button variant="ghost" size="sm" className="text-purple-600 font-semibold hover:bg-purple-50 rounded-full">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  Error loading posts: {error}
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-semibold">No posts yet</p>
                  <p className="text-sm">Create your first post to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FileText size={18} />
                         </div>
                         <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{post.title}</h4>
                          <p className="text-xs text-slate-400 font-medium">Updated on {new Date(post.updatedAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={post.status} />
                        {post.wordpressLink ? (
                          <a href={post.wordpressLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-purple-600 transition-colors rounded-full">
                              <ArrowRight size={18} />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-purple-600 transition-colors rounded-full">
                            <ArrowRight size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] shadow-xl text-white p-8 flex flex-col justify-between h-full relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                   <Calendar size={24} className="text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Auto-Pilot Mode</h3>
                <p className="text-slate-400 leading-relaxed mb-8">Set up a weekly schedule. AI will research, draft, and publish automatically.</p>
              </div>
              <Button variant="secondary" className="w-full bg-white text-slate-900 hover:bg-purple-50 font-bold rounded-xl py-6">
                Configure Schedule
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  }[color] || "bg-slate-100 text-slate-600";

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={`p-4 rounded-2xl ${colorClasses}`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "outline" | "success" | "warning" = "secondary";
  if (status === 'published') variant = "success";
  if (status === 'draft') variant = "secondary";
  if (status === 'researching') variant = "warning";
  
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  return <Badge variant={variant} className="px-3 py-1 rounded-full font-semibold">{displayStatus}</Badge>;
};
