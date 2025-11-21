
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostStatus, GeneratedPost, ResearchResult, SuggestedTopic } from '../../../types';
import { draftToWordPress } from '../../../lib/wordpress';
import { useWordPress } from '../../../contexts/WordPressContext';
import { Search, Edit3, LayoutTemplate, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { ProcessStepper } from '../../../components/generate/ProcessStepper';
import { ArticlesList } from '../../../components/generate/ArticlesList';
import { TrendRadar } from '../../../components/generate/TrendRadar';
import { TopicInput } from '../../../components/generate/TopicInput';
import { ResearchingLoader } from '../../../components/generate/ResearchingLoader';
import { TopicSelection } from '../../../components/generate/TopicSelection';
import { ContentGenerationLoader } from '../../../components/generate/ContentGenerationLoader';
import { PostEditor } from '../../../components/generate/PostEditor';

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
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Steps visualization state
  type StepStatus = 'waiting' | 'processing' | 'completed' | 'error';
  const [steps, setSteps] = useState<Array<{ id: string; label: string; status: StepStatus; icon: React.ElementType }>>([
    { id: 'research', label: 'Trend Research', status: 'waiting', icon: Search },
    { id: 'strategy', label: 'Topic Strategy', status: 'waiting', icon: LayoutTemplate },
    { id: 'production', label: 'Content Production', status: 'waiting', icon: Edit3 },
  ]);

  const updateStep = (id: string, status: 'waiting' | 'processing' | 'completed' | 'error') => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  // Load existing post if postId is in URL
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');

  useEffect(() => {
    if (postId) {
      loadPost(parseInt(postId));
    }
  }, [postId]);

  const loadPost = async (id: number) => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) return;
      
      const post = await response.json();
      setCurrentPostId(post.id);
      
      // Load research data if available
      if (post.researchSummary && post.trendAnalysis) {
        
        const researchResult: ResearchResult = {
          summary: post.researchSummary,
          sources: post.sources || [],
          trendAnalysis: post.trendAnalysis,
        };
        
        setResearchData(researchResult);
        
        // If content exists, show completed state
        if (post.content) {
          setGeneratedPost({
            title: post.title,
            content: post.content,
            researchSummary: post.researchSummary || '',
            sources: post.sources || [],
            featuredImage: post.featuredImageUrl || undefined,
          });
          setEditorContent(post.content);
          setStatus(PostStatus.COMPLETED);
          updateStep('research', 'completed');
          updateStep('strategy', 'completed');
          updateStep('production', 'completed');
        } else {
          // Show topic selection with suggested topics
          // Use setTimeout to ensure researchData state is fully set before changing status
          setTimeout(() => {
            setStatus(PostStatus.TOPIC_SELECTION);
            updateStep('research', 'completed');
            updateStep('strategy', 'processing');
          }, 100);
        }
      } else if (post.content) {
        // Only content, no research data
        setGeneratedPost({
          title: post.title,
          content: post.content,
          researchSummary: post.researchSummary || '',
          sources: post.sources || [],
          featuredImage: post.featuredImageUrl || undefined,
        });
        setEditorContent(post.content);
        setStatus(PostStatus.COMPLETED);
        updateStep('research', 'completed');
        updateStep('strategy', 'completed');
        updateStep('production', 'completed');
      }
      
      // Load WordPress link if published
      if (post.wordpressLink) {
        setPublishResult({ id: post.wordpressId, link: post.wordpressLink });
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  };

  // Fetch all posts for sidebar
  const fetchAllPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const posts = await response.json();
        setAllPosts(posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load posts on mount
  useEffect(() => {
    fetchAllPosts();
  }, []);

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
        {status !== PostStatus.IDLE && (
          <div className="w-[280px] shrink-0 space-y-6 sticky top-6 hidden lg:block">
              
              {/* Progress Stepper */}
              <ProcessStepper steps={steps} />

              {/* Articles List */}
              <ArticlesList 
                articles={allPosts}
                loading={loadingPosts}
                currentPostId={currentPostId}
                onArticleClick={(id) => window.location.href = `/generate?postId=${id}`}
              />

              {/* Research Radar (Only visible after research is done) */}
              {researchData && <TrendRadar researchData={researchData} />}
          </div>
        )}

        {/* --- RIGHT COLUMN: Workspace --- */}
        <div className="flex-1">
            
            {/* VIEW 1: Initial Input */}
            {status === PostStatus.IDLE && (
                <TopicInput 
                  broadTopic={broadTopic}
                  onTopicChange={setBroadTopic}
                  onSubmit={handleResearch}
                />
            )}

            {/* VIEW 2: Researching Loading State */}
            {status === PostStatus.RESEARCHING && <ResearchingLoader topic={broadTopic} />}

            {/* VIEW 3: Topic Selection */}
            {status === PostStatus.TOPIC_SELECTION && researchData && (
                <TopicSelection 
                  topics={researchData.trendAnalysis.suggested_topics}
                  onSelectTopic={handleSelectTopic}
                  onRefine={() => setStatus(PostStatus.IDLE)}
                />
            )}

            {/* VIEW 4: Generating / Writing Loading State */}
            {(status === PostStatus.WRITING || status === PostStatus.GENERATING_IMAGE) && selectedTopic && (
                <ContentGenerationLoader selectedTopic={selectedTopic} status={status} />
            )}

            {/* VIEW 5: Completed Editor */}
            {(status === PostStatus.COMPLETED || status === PostStatus.CONNECTING_WP || status === PostStatus.DRAFTING) && generatedPost && (
               <PostEditor 
                 generatedPost={generatedPost}
                 editorContent={editorContent}
                 onEditorChange={setEditorContent}
                 status={status}
                 publishResult={publishResult}
                 wpConnected={wpSettings.isConnected}
                 onPublish={handleManualDraft}
               />
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
