
"use client";

import React, { useState, useEffect } from 'react';
import { PostStatus, GeneratedPost, ResearchResult, SuggestedTopic } from '../../../types';
import { draftToWordPress } from '../../../lib/wordpress';
import { useWordPress } from '../../../contexts/WordPressContext';
import { 
  Search, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Zap,
  BarChart2,
  Edit3,
  Sparkles,
  Image as ImageIcon,
  Circle,
  ArrowRight,
  LayoutTemplate,
  MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { TipTapEditor } from '../../../components/TipTapEditor';
import { cn } from '../../../lib/utils';

interface ThinkingStep {
  id: string;
  label: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  icon?: React.ElementType;
}

export default function PostGenerator() {
  const { settings: wpSettings } = useWordPress();
  
  // State
  const [broadTopic, setBroadTopic] = useState('');
  const [status, setStatus] = useState<PostStatus>(PostStatus.IDLE);
  const [researchData, setResearchData] = useState<ResearchResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SuggestedTopic | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editorContent, setEditorContent] = useState<string>(''); 
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ id: number, link: string } | null>(null);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);

  // Steps visualization state
  const [steps, setSteps] = useState<ThinkingStep[]>([
    { id: 'research', label: 'Trend Research', status: 'waiting', icon: Search },
    { id: 'strategy', label: 'Topic Strategy', status: 'waiting', icon: LayoutTemplate },
    { id: 'production', label: 'Content Production', status: 'waiting', icon: Edit3 },
  ]);

  const updateStep = (id: string, status: ThinkingStep['status']) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  // --- STEP 1: Perform Research ---
  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadTopic.trim()) return;

    setError(null);
    setStatus(PostStatus.RESEARCHING);
    updateStep('research', 'processing');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: broadTopic }),
      });

      if (!response.ok) {
        throw new Error('Research failed');
      }

      const research: ResearchResult = await response.json();
      setResearchData(research);
      
      // Save research to database
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Research: ${broadTopic}`,
          content: '',
          status: 'researching',
          researchSummary: research.summary,
          trendAnalysis: research.trendAnalysis,
          sources: research.sources,
        }),
      });
      
      if (postResponse.ok) {
        const savedPost = await postResponse.json();
        setCurrentPostId(savedPost.id);
      }
      
      updateStep('research', 'completed');
      updateStep('strategy', 'processing'); // Move focus to next step
      setStatus(PostStatus.TOPIC_SELECTION);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Research failed.");
      setStatus(PostStatus.FAILED);
      updateStep('research', 'error');
    }
  };

  // --- STEP 2: Select Topic & Generate ---
  const handleSelectTopic = async (topic: SuggestedTopic) => {
    setSelectedTopic(topic);
    setStatus(PostStatus.GENERATING_IMAGE); // Start with image or writing
    updateStep('strategy', 'completed');
    updateStep('production', 'processing');
    
    try {
        // Parallel Execution: Generate Image AND Write Post
        const imagePromise = fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topic.title }),
        }).then(res => res.json());

        const writingPromise = fetch('/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: topic.title, 
            researchSummary: researchData?.summary || "" 
          }),
        }).then(res => res.json());
        
        // We wait for writing to finish to show content, image can load in when ready if it takes longer
        // but for simplicity in this flow, let's wait for both or handle sequentially
        
        setStatus(PostStatus.GENERATING_IMAGE);
        const { imageUrl: featuredImage } = await imagePromise;
        
        setStatus(PostStatus.WRITING);
        const postContent = await writingPromise;

        const fullPost: GeneratedPost = {
            title: postContent.title,
            content: postContent.content,
            researchSummary: researchData?.summary || "",
            sources: researchData?.sources || [],
            featuredImage: featuredImage || undefined
        };

        setGeneratedPost(fullPost);
        setEditorContent(postContent.content);
        
        // Update database with generated content
        if (currentPostId) {
          await fetch(`/api/posts/${currentPostId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: postContent.title,
              content: postContent.content,
              status: 'draft',
              featuredImageUrl: featuredImage || null,
            }),
          });
        }
        
        updateStep('production', 'completed');
        setStatus(PostStatus.COMPLETED);

    } catch (err: any) {
        console.error(err);
        setError("Failed to generate content.");
        setStatus(PostStatus.FAILED);
        updateStep('production', 'error');
    }
  };

  const handleManualDraft = async () => {
    if (!generatedPost || !wpSettings.isConnected) return;

    setStatus(PostStatus.CONNECTING_WP);
    try {
      const result = await draftToWordPress(wpSettings, generatedPost.title, editorContent);
      setPublishResult(result);
      
      // Update database with WordPress info
      if (currentPostId) {
        await fetch(`/api/posts/${currentPostId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'published',
            wordpressId: result.id,
            wordpressLink: result.link,
          }),
        });
      }
      
      setStatus(PostStatus.COMPLETED);
    } catch (err: any) {
      setError("Failed to draft to WordPress: " + err.message);
      setStatus(PostStatus.FAILED);
    }
  };

  const resetAll = () => {
      setBroadTopic('');
      setStatus(PostStatus.IDLE);
      setResearchData(null);
      setSelectedTopic(null);
      setGeneratedPost(null);
      setEditorContent('');
      setPublishResult(null);
      setSteps([
        { id: 'research', label: 'Trend Research', status: 'waiting', icon: Search },
        { id: 'strategy', label: 'Topic Strategy', status: 'waiting', icon: LayoutTemplate },
        { id: 'production', label: 'Content Production', status: 'waiting', icon: Edit3 },
      ]);
  };

  const getBreadcrumbText = () => {
    if (status === PostStatus.IDLE) return 'New Project';
    if (status === PostStatus.RESEARCHING) return 'Trend Research';
    if (status === PostStatus.TOPIC_SELECTION) return 'Topic Strategy';
    if (status === PostStatus.GENERATING_IMAGE || status === PostStatus.WRITING) return 'Content Production';
    if (generatedPost) return 'Editor';
    return 'Writer';
  };

  return (
    <div className="w-full pb-20 space-y-8 animate-in fade-in duration-700">
      
      {/* Minimalist Breadcrumb Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400 font-medium">Page:</span>
          <span className="text-slate-700 font-semibold">Writer / {getBreadcrumbText()}</span>
        </div>
        
        <div className="flex items-center gap-3">
             {status !== PostStatus.IDLE && (
                 <Button variant="ghost" size="sm" onClick={resetAll} className="text-slate-400 hover:text-red-500 h-9 px-3 text-xs font-medium">
                    Start Over
                 </Button>
             )}
             <div className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-help transition-colors shadow-sm">
                <span className="font-bold text-sm">?</span>
             </div>
             <Button variant="outline" className="rounded-full h-9 px-5 text-xs font-bold border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm">
                Share
             </Button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* --- LEFT COLUMN: Process & Intelligence --- */}
        <div className="w-[280px] shrink-0 space-y-6 sticky top-6 hidden lg:block">
            
            {/* Progress Stepper */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Process</h3>
                    <div className="space-y-0 relative">
                        {/* Connecting line background */}
                        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-100 z-0" />
                        
                        {steps.map((step, index) => {
                            const Icon = step.icon || Circle;
                            const isActive = step.status === 'processing';
                            const isCompleted = step.status === 'completed';
                            const isWaiting = step.status === 'waiting';
                            
                            return (
                                <div key={step.id} className="relative z-10 flex items-start gap-4 pb-8 last:pb-0 group">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 bg-white", 
                                        isCompleted ? "border-green-500 text-green-600" :
                                        isActive ? "border-purple-500 text-purple-600 shadow-[0_0_0_4px_rgba(168,85,247,0.1)]" :
                                        step.status === 'error' ? "border-red-200 text-red-500" :
                                        "border-slate-100 text-slate-300"
                                    )}>
                                        {isCompleted ? <CheckCircle2 size={18} strokeWidth={2.5} /> : 
                                         isActive ? <Loader2 size={20} className="animate-spin" /> : 
                                         <Icon size={18} />}
                                    </div>
                                    <div className="pt-2">
                                        <h4 className={cn("font-bold text-sm leading-none", isActive ? "text-purple-900" : isCompleted ? "text-slate-900" : "text-slate-400")}>
                                            {step.label}
                                        </h4>
                                        {isActive && (
                                            <p className="text-[11px] text-purple-500 font-medium mt-1.5 animate-pulse">
                                                {step.id === 'research' ? 'Scanning...' : step.id === 'production' ? 'Drafting...' : 'Thinking...'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Research Radar (Only visible after research is done) */}
            {researchData && (
                <Card className="border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-500">
                    <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trend Radar</h3>
                        <BarChart2 size={14} className="text-slate-400" />
                    </div>
                    <CardContent className="p-6 space-y-6">
                         {/* Sentiment */}
                         <div>
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-xs font-semibold text-slate-500">Market Sentiment</span>
                               <Badge variant={researchData.trendAnalysis.sentiment === 'positive' ? 'success' : researchData.trendAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-[10px] px-2 py-0 h-5">
                                  {researchData.trendAnalysis.sentiment}
                               </Badge>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", 
                                  researchData.trendAnalysis.sentiment === 'positive' ? "bg-green-500 w-[85%]" :
                                  researchData.trendAnalysis.sentiment === 'negative' ? "bg-red-500 w-[25%]" : "bg-slate-400 w-[50%]"
                               )} />
                            </div>
                         </div>

                         {/* Key Events */}
                         <div className="space-y-3">
                            <span className="text-xs font-semibold text-slate-500">Key Events & Signals</span>
                            <div className="space-y-2">
                               {researchData.trendAnalysis.key_events.slice(0, 3).map((event, i) => (
                                  <div key={i} className="flex gap-2 items-start p-2 bg-slate-50 rounded-md border border-slate-100">
                                     <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                     <p className="text-xs text-slate-700 leading-relaxed">{event}</p>
                                  </div>
                               ))}
                            </div>
                         </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* --- RIGHT COLUMN: Workspace --- */}
        <div className="flex-1">
            
            {/* VIEW 1: Initial Input */}
            {status === PostStatus.IDLE && (
                <div className="p-8 md:p-12 text-center space-y-8 min-h-[500px] flex flex-col justify-center items-center">
                    <div className="max-w-lg mx-auto space-y-4">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">What's your niche?</h2>
                        <p className="text-slate-500 text-lg">Enter a broad topic (e.g., "Sustainable Fashion" or "AI in Marketing") and let our agents research trends for you.</p>
                    </div>
                    
                    <form onSubmit={handleResearch} className="w-full max-w-xl mx-auto relative">
                        <Input 
                            value={broadTopic}
                            onChange={(e) => setBroadTopic(e.target.value)}
                            placeholder="Enter a topic..."
                            className="h-14 text-lg pl-6 pr-14 rounded-xl shadow-md border-slate-200 focus:border-purple-500"
                            autoFocus
                        />
                        <Button 
                            type="submit" 
                            disabled={!broadTopic}
                            className="absolute right-2 top-2 h-10 w-10 p-0 rounded-lg bg-purple-600 hover:bg-purple-700"
                        >
                            <ArrowRight size={20} />
                        </Button>
                    </form>

                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        {['Crypto Trends', 'Healthy Living', 'SaaS Growth', 'Remote Work'].map(t => (
                            <button key={t} onClick={() => setBroadTopic(t)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm rounded-full border border-slate-200 transition-colors">
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* VIEW 2: Researching Loading State */}
            {status === PostStatus.RESEARCHING && (
                <div className="p-12 min-h-[500px] flex flex-col justify-center items-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search size={24} className="text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-8 mb-2">Analyzing the web for "{broadTopic}"</h3>
                    <p className="text-slate-500 animate-pulse">Reading latest news • Identifying trends • Checking sources</p>
                </div>
            )}

            {/* VIEW 3: Topic Selection */}
            {status === PostStatus.TOPIC_SELECTION && researchData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">Suggested Strategies</h2>
                        <Badge variant="secondary" className="h-8 px-3 text-sm">Select a topic to generate</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {researchData.trendAnalysis.suggested_topics.map((topic, idx) => (
                            <div 
                                key={idx}
                                onClick={() => handleSelectTopic(topic)}
                                className="group relative bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md mb-3">
                                        Option {idx + 1}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-purple-700 transition-colors">
                                        {topic.title}
                                    </h3>
                                </div>
                                
                                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                                    {topic.rationale}
                                </p>
                                
                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-purple-600">
                                    <MousePointerClick size={14} />
                                    Click to write this article
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                         <p className="text-sm text-slate-500">Don't like these? <button onClick={() => setStatus(PostStatus.IDLE)} className="text-purple-600 font-bold hover:underline">Refine your topic</button></p>
                    </div>
                </div>
            )}

            {/* VIEW 4: Generating / Writing Loading State */}
            {(status === PostStatus.WRITING || status === PostStatus.GENERATING_IMAGE) && selectedTopic && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 min-h-[500px] flex flex-col justify-center items-center text-center">
                    <div className="relative mb-8">
                         {/* Overlapping avatars for agents */}
                         <div className="flex items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg z-20 flex items-center justify-center text-purple-600 overflow-hidden relative">
                                <div className="absolute inset-0 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                                <Edit3 size={24} />
                            </div>
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg z-10 -ml-6 flex items-center justify-center text-orange-500 overflow-hidden relative">
                                <div className="absolute inset-0 border-4 border-orange-100 border-b-orange-500 rounded-full animate-spin"></div>
                                <ImageIcon size={24} />
                            </div>
                         </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Creating content for <br/>
                        <span className="text-purple-600">"{selectedTopic.title}"</span>
                    </h3>
                    
                    <div className="space-y-2 mt-6 max-w-md">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{status === PostStatus.GENERATING_IMAGE ? '40%' : '85%'}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full bg-purple-600 rounded-full transition-all duration-[2000ms]", status === PostStatus.GENERATING_IMAGE ? "w-[40%]" : "w-[85%]")}></div>
                        </div>
                        <p className="text-sm text-slate-500 pt-2">
                            {status === PostStatus.GENERATING_IMAGE ? "Designing custom featured image..." : "Drafting final paragraphs..."}
                        </p>
                    </div>
                </div>
            )}

            {/* VIEW 5: Completed Editor */}
            {(status === PostStatus.COMPLETED || status === PostStatus.CONNECTING_WP || status === PostStatus.DRAFTING) && generatedPost && (
               <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in fade-in duration-500">
                  {/* Editor Toolbar Header */}
                  <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white sticky top-0 z-20">
                     <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="rounded-md bg-purple-50 text-purple-700 border-purple-100">
                           AI Generated
                        </Badge>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        {publishResult ? (
                           <Badge variant="success" className="h-9 px-4 rounded-md gap-2 text-sm">
                              <CheckCircle2 size={14} /> Published
                              <a href={publishResult.link} target="_blank" rel="noreferrer" className="underline text-white/80 hover:text-white">View</a>
                           </Badge>
                        ) : (
                           wpSettings.isConnected ? (
                              <Button onClick={handleManualDraft} disabled={status === PostStatus.CONNECTING_WP} className="bg-slate-900 text-white hover:bg-slate-800 rounded-md h-9 px-6 font-bold text-xs">
                                 {status === PostStatus.CONNECTING_WP ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <Zap className="mr-2 h-3 w-3" />}
                                 Publish to WordPress
                              </Button>
                           ) : (
                              <div className="flex items-center gap-2">
                                  <Badge variant="warning" className="h-9 px-4 rounded-md">Connect WP to Publish</Badge>
                              </div>
                           )
                        )}
                     </div>
                  </div>

                  {/* Editor Body */}
                  <div className="flex-1 bg-white p-0 relative flex flex-col">
                     
                     {/* Featured Image Section */}
                     {generatedPost.featuredImage && (
                        <div className="w-full bg-slate-50 relative group border-b border-slate-100">
                           <div className="aspect-video max-h-[400px] w-full overflow-hidden relative">
                               <img 
                                  src={generatedPost.featuredImage} 
                                  alt="Featured" 
                                  className="w-full h-full object-cover" 
                               />
                           </div>
                           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm">
                              <ImageIcon size={12} className="text-purple-600" /> Featured Image
                           </div>
                        </div>
                     )}

                     <div className="flex-1">
                         <TipTapEditor 
                            content={generatedPost.content} 
                            onChange={setEditorContent} 
                            className="border-none shadow-none rounded-none min-h-[600px] p-8 md:p-12"
                         />
                     </div>
                  </div>
               </Card>
            )}
            
            {/* Error State */}
            {error && (
                <Alert variant="destructive" className="mt-6 border-red-200 bg-red-50 text-red-900 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-lg font-bold text-red-700">Process Failed</AlertTitle>
                    <AlertDescription className="mt-2">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </div>
  );
}
