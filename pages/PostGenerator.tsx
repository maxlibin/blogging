import React, { useState } from 'react';
import { WordPressSettings, PostStatus, GeneratedPost, ResearchSource } from '../types';
import { performResearch, writeBlogPost } from '../services/gemini';
import { draftToWordPress } from '../services/wordpress';
import { 
  Search, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Zap,
  RotateCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

interface Props {
  wpSettings: WordPressSettings;
}

export const PostGenerator: React.FC<Props> = ({ wpSettings }) => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<PostStatus>(PostStatus.IDLE);
  const [researchData, setResearchData] = useState<{ summary: string, sources: ResearchSource[] } | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
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
    setPublishResult(null);

    try {
      // 1. Research
      const research = await performResearch(topic);
      setResearchData(research);

      // 2. Write
      setStatus(PostStatus.WRITING);
      const postContent = await writeBlogPost(topic, research.summary);
      
      const fullPost: GeneratedPost = {
        title: postContent.title,
        content: postContent.content,
        researchSummary: research.summary,
        sources: research.sources
      };
      setGeneratedPost(fullPost);

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
      setError(err.message || "An unexpected error occurred.");
      setStatus(PostStatus.FAILED);
    }
  };

  const handleManualDraft = async () => {
    if (!generatedPost || !wpSettings.isConnected) return;

    setStatus(PostStatus.DRAFTING);
    try {
      const result = await draftToWordPress(wpSettings, generatedPost.title, generatedPost.content);
      setPublishResult(result);
      setStatus(PostStatus.COMPLETED);
    } catch (err: any) {
      setError("Failed to draft to WordPress: " + err.message);
      setStatus(PostStatus.FAILED);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auto-Write Blog Post</h1>
        <p className="text-slate-500 mt-2">Enter a topic, and our AI will research the latest news, write a humanized post, and automatically draft it to your WordPress.</p>
      </div>

      {/* Topic Input */}
      <Card className="border-indigo-100 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleStart} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="topic">What should we write about?</Label>
              <Input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The impact of quantum computing on cryptography..."
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
              {wpSettings.isConnected ? 'Generate & Draft' : 'Generate Post'}
            </Button>
          </form>
          {wpSettings.isConnected && (
             <p className="text-xs text-green-600 mt-3 flex items-center gap-1 font-medium">
               <CheckCircle2 size={12} /> Auto-draft enabled for connected blog.
             </p>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      {(status !== PostStatus.IDLE) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard 
            icon={Search} 
            title="Latest Research" 
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

      {/* Results Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Research Notes */}
        {researchData && (
          <div className="lg:col-span-1 space-y-6">
             <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="text-indigo-500 h-5 w-5"/> Research Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="prose prose-sm text-slate-600 max-h-[300px] overflow-y-auto pr-2 text-xs">
                      <p className="whitespace-pre-wrap">{researchData.summary}</p>
                   </div>

                   <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-semibold text-sm text-slate-900 mb-3">Sources Used</h4>
                      <ul className="space-y-3">
                        {researchData.sources.length > 0 ? researchData.sources.map((source, i) => (
                          <li key={i} className="text-xs group">
                            <a href={source.uri} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-start gap-2">
                              <ExternalLink size={12} className="shrink-0 mt-0.5 opacity-50 group-hover:opacity-100" />
                              <span className="line-clamp-2">{source.title}</span>
                            </a>
                          </li>
                        )) : (
                          <li className="text-slate-500 italic text-xs">No specific web sources returned.</li>
                        )}
                      </ul>
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        {/* Right: Generated Content */}
        {generatedPost && (
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card>
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <CardTitle>Preview Draft</CardTitle>
                      <CardDescription>Review the generated content before publishing.</CardDescription>
                    </div>
                    
                    {publishResult ? (
                      <Badge variant="success" className="px-3 py-1 text-sm flex gap-2 items-center">
                         <CheckCircle2 size={14} /> Drafted in WP
                         <a href={publishResult.link} target="_blank" rel="noreferrer" className="ml-2 underline text-white/90 hover:text-white">
                           Edit
                         </a>
                      </Badge>
                    ) : (
                      wpSettings.isConnected ? (
                         <Button 
                           onClick={handleManualDraft}
                           disabled={status === PostStatus.DRAFTING}
                           size="sm"
                         >
                           {status === PostStatus.DRAFTING ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                           Draft to WP
                         </Button>
                      ) : (
                        <Badge variant="warning">Connect WP to Draft</Badge>
                      )
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{generatedPost.title}</h1>
                  <div 
                    className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600"
                    dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                  />
                </CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
};

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