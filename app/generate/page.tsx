"use client";

import React, { useState } from 'react';
import { PostStatus, GeneratedPost, ResearchSource, ResearchResult } from '../../types';
import { performResearch, writeBlogPost } from '../../services/gemini';
import { draftToWordPress } from '../../services/wordpress';
import { useWordPress } from '../../contexts/WordPressContext';
import { 
  Search, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Zap,
  TrendingUp,
  MessageSquare,
  Newspaper,
  Edit3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { TipTapEditor } from '../../components/TipTapEditor';
import { cn } from '../../lib/utils';

export default function PostGenerator() {
  const { settings: wpSettings } = useWordPress();
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<PostStatus>(PostStatus.IDLE);
  const [researchData, setResearchData] = useState<ResearchResult | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editorContent, setEditorContent] = useState<string>(''); // State for Tiptap editor
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ id: number, link: string } | null>(null);

  const isProcessing = status === PostStatus.RESEARCHING || status === PostStatus.WRITING || status === PostStatus.DRAFTING;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus(PostStatus.RESEARCHING);
    setError(null);
    setResearchData(null);
    setGeneratedPost(null);
    setEditorContent('');
    setPublishResult(null);

    try {
      // 1. Research
      const research = await performResearch(topic);
      setResearchData(research);

      // 2. Write
      setStatus(PostStatus.WRITING);
      const postContent = await writeBlogPost(topic, research.summary); // Note: prompt might need to handle JSON summary now
      
      const fullPost: GeneratedPost = {
        title: postContent.title,
        content: postContent.content,
        researchSummary: research.summary,
        sources: research.sources
      };
      setGeneratedPost(fullPost);
      setEditorContent(postContent.content); // Initialize editor

      // 3. Auto Draft if Connected
      if (wpSettings.isConnected) {
        setStatus(PostStatus.DRAFTING);
        const result = await draftToWordPress(wpSettings, postContent.title, postContent.content);
        setPublishResult(result);
        setStatus(PostStatus.COMPLETED);
      } else {
        setStatus(PostStatus.COMPLETED);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(PostStatus.FAILED);
    }
  };

  const handleManualDraft = async () => {
    if (!generatedPost || !wpSettings.isConnected) return;

    setStatus(PostStatus.DRAFTING);
    try {
      // Use editorContent instead of generatedPost.content to include edits
      const result = await draftToWordPress(wpSettings, generatedPost.title, editorContent);
      setPublishResult(result);
      setStatus(PostStatus.COMPLETED);
    } catch (err: any) {
      setError("Failed to draft to WordPress: " + err.message);
      setStatus(PostStatus.FAILED);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auto-Write Blog Post</h1>
        <p className="text-slate-500 mt-2">Enter a topic to generate a trend report, write a humanized post, and edit it before drafting.</p>
      </div>

      {/* Topic Input */}
      <Card className="border-indigo-100 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleStart} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="topic">Topic or Keyword</Label>
              <Input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI agents in 2025"
                disabled={isProcessing}
                className="h-12 text-lg"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!topic || isProcessing}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto"
            >
              {isProcessing ? (
                 <Loader2 className="animate-spin mr-2" />
              ) : (
                 <Zap className="mr-2 h-4 w-4" />
              )}
              {wpSettings.isConnected ? 'Generate & Draft' : 'Generate Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      {(status !== PostStatus.IDLE) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard 
            icon={Search} 
            title="Trend Radar Research" 
            status={status === PostStatus.RESEARCHING ? 'active' : (researchData ? 'done' : 'pending')} 
          />
          <StepCard 
            icon={FileText} 
            title="Humanized Writing" 
            status={status === PostStatus.WRITING ? 'active' : (generatedPost ? 'done' : 'pending')} 
          />
          <StepCard 
            icon={Send} 
            title="Draft to WordPress" 
            status={status === PostStatus.DRAFTING ? 'active' : (publishResult ? 'done' : (wpSettings.isConnected ? 'pending' : 'pending'))} 
            disabled={!wpSettings.isConnected && !publishResult && status !== PostStatus.DRAFTING}
          />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => setStatus(PostStatus.IDLE)} className="w-fit border-red-200 hover:bg-red-50 text-red-800">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: Trend Radar Dashboard */}
        {researchData && (
          <div className="xl:col-span-1 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" /> Trend Radar Analysis
            </h3>
            
            {/* Sentiment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Community Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-slate-900 capitalize">{researchData.trendAnalysis.sentiment}</div>
                  <Badge variant={researchData.trendAnalysis.sentiment === 'positive' ? 'success' : researchData.trendAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                    {researchData.trendAnalysis.sentiment}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-2">Based on recent discussions and articles.</p>
              </CardContent>
            </Card>

            {/* Key Drivers / Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Key Drivers & Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {researchData.trendAnalysis.key_events.map((event, i) => (
                   <div key={i} className="flex gap-3 items-start">
                     <div className="min-w-[4px] h-4 mt-1 bg-indigo-500 rounded-full" />
                     <p className="text-sm text-slate-700 leading-relaxed">{event}</p>
                   </div>
                 ))}
              </CardContent>
            </Card>

             {/* Sources Breakdown */}
             <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Intelligence Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1"><Newspaper size={12} /> News & Official</h5>
                    <ul className="space-y-2">
                      {researchData.trendAnalysis.sources_news.map((s, i) => (
                        <li key={i} className="text-xs truncate text-slate-600 hover:text-indigo-600 transition-colors">
                          <a href="#" className="flex items-center gap-2">
                            <ExternalLink size={10} /> {s}
                          </a>
                        </li>
                      ))}
                      {researchData.trendAnalysis.sources_news.length === 0 && <li className="text-xs text-slate-400">No news sources found.</li>}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1"><MessageSquare size={12} /> Community & Social</h5>
                    <ul className="space-y-2">
                      {researchData.trendAnalysis.sources_social.map((s, i) => (
                        <li key={i} className="text-xs truncate text-slate-600 hover:text-indigo-600 transition-colors">
                          <a href="#" className="flex items-center gap-2">
                            <ExternalLink size={10} /> {s}
                          </a>
                        </li>
                      ))}
                      {researchData.trendAnalysis.sources_social.length === 0 && <li className="text-xs text-slate-400">No social signals found.</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right: Content Editor */}
        {generatedPost && (
          <div className="xl:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="h-full border-indigo-200/50 shadow-sm flex flex-col">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2"><Edit3 size={18} className="text-indigo-600" /> Content Editor</CardTitle>
                      <CardDescription>Edit your post below before publishing.</CardDescription>
                    </div>
                    
                    {publishResult ? (
                      <Badge variant="success" className="px-3 py-1 text-sm flex gap-2 items-center">
                         <CheckCircle2 size={14} /> Drafted in WP
                         <a href={publishResult.link} target="_blank" rel="noreferrer" className="ml-2 underline text-white/90 hover:text-white">
                           Open
                         </a>
                      </Badge>
                    ) : (
                      wpSettings.isConnected ? (
                         <Button 
                           onClick={handleManualDraft}
                           disabled={status === PostStatus.DRAFTING}
                           className="bg-slate-900 text-white hover:bg-slate-800"
                           size="sm"
                         >
                           {status === PostStatus.DRAFTING ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                           Draft to WordPress
                         </Button>
                      ) : (
                        <Badge variant="warning">Connect WP to Draft</Badge>
                      )
                    )}
                  </div>
                </CardHeader>
                
                <div className="flex-1 bg-white p-0">
                  {/* Pass the generated content and the change handler to the Tiptap editor */}
                  <TipTapEditor 
                    content={generatedPost.content} 
                    onChange={setEditorContent} 
                    className="min-h-[600px] border-none rounded-none shadow-none"
                  />
                </div>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
}

const StepCard = ({ icon: Icon, title, status, disabled }: { icon: any, title: string, status: 'pending' | 'active' | 'done', disabled?: boolean }) => {
  return (
    <Card className={cn("transition-all duration-300", 
        disabled && "opacity-50 bg-slate-50",
        status === 'active' && "border-indigo-500 ring-1 ring-indigo-500 shadow-md",
        status === 'done' && "border-green-500 bg-green-50/30"
      )}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-full", 
          status === 'active' ? "bg-indigo-100 text-indigo-600" : 
          status === 'done' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
        )}>
          {status === 'active' ? <Loader2 className="animate-spin h-5 w-5" /> : (status === 'done' ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />)}
        </div>
        <div className="flex flex-col">
          <span className={cn("font-medium text-sm", status === 'active' ? "text-indigo-900" : "text-slate-700")}>{title}</span>
          {status === 'active' && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Processing...</span>}
        </div>
      </CardContent>
    </Card>
  );
};
