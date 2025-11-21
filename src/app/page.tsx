

import React from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Settings, 
  BarChart2, 
  FileText, 
  ChevronDown, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft,
  AlignCenter,
  List,
  MoreHorizontal,
  Zap,
  Star,
  MessageSquare,
  RefreshCw,
  X,
  CheckCircle2,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-100/50 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2 cursor-pointer">
           <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg transform -rotate-6">
             <div className="w-3 h-3 bg-white rounded-full" />
           </div>
           <span className="text-2xl font-bold tracking-tight">Ai<span className="text-purple-600">Writer</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors">Home</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
           <SignedOut>
             <SignInButton mode="modal">
               <button className="text-sm font-medium text-slate-900 hidden sm:block hover:text-purple-600 transition-colors">
                 Login
               </button>
             </SignInButton>
             <SignUpButton mode="modal">
               <button className="bg-black text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all hover:scale-105 shadow-lg">
                 Free Trials
               </button>
             </SignUpButton>
           </SignedOut>
           <SignedIn>
             <Link href="/dashboard">
               <Button variant="ghost" className="text-sm font-medium text-slate-900 hover:text-purple-600">
                 Dashboard
               </Button>
             </Link>
             <UserButton afterSignOutUrl="/" />
           </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative">
        
        {/* Floating Shapes Decoration */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rotate-45 hidden md:block animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-green-400 rounded-full hidden md:block animate-bounce" />
        <div className="absolute bottom-40 left-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-purple-400 rotate-12 hidden md:block" />

        <div className="flex flex-col lg:flex-row items-start gap-12 mb-20 relative z-20">
          <div className="flex-1 pt-4">
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-slate-900">
              Instant Marketing Copy <br/>
              with Free AI Writer
            </h1>
             <Link href="/dashboard">
               <button className="bg-[#8B5CF6] text-white text-base font-bold px-8 py-3.5 rounded-full hover:bg-[#7C3AED] transition-all shadow-[0_10px_20px_-5px_rgba(139,92,246,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(139,92,246,0.5)] hover:-translate-y-1">
                 Generate Now
               </button>
             </Link>
          </div>

          <div className="flex-1 max-w-md lg:pt-6">
            <p className="text-slate-500 text-lg leading-relaxed">
              Generate 80+ types of copy in seconds with the AI Writer. Write unique & plagiarism-free content for blogs, articles, ads, products, websites & social media.
            </p>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative w-full max-w-6xl mx-auto perspective-[2000px]">
          
          {/* Mockup Container */}
          <div className="bg-white rounded-[2rem] border border-purple-100 shadow-2xl shadow-purple-200/50 overflow-hidden relative z-10 transform transition-transform hover:scale-[1.01] duration-500">
             
             {/* Mockup Header */}
             <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white">
               <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                 <span className="text-slate-400">Page:</span>
                 <span>Writer / Blog Introduction</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">?</div>
                 <button className="px-4 py-1.5 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50">Share</button>
               </div>
             </div>

             {/* Mockup Toolbar */}
             <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50/30 gap-4 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mr-4 shrink-0">
                  <span>File</span>
                  <RefreshCw size={14} className="text-slate-400" />
                </div>
                
                <div className="h-4 w-px bg-slate-200 shrink-0" />
                
                <div className="flex items-center gap-1 text-slate-600 shrink-0 cursor-pointer hover:bg-slate-200/50 px-2 py-1 rounded">
                   <span className="text-xs font-medium">Normal Text</span>
                   <ChevronDown size={12} />
                </div>

                <div className="h-4 w-px bg-slate-200 shrink-0" />

                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                  <Bold size={16} className="cursor-pointer hover:text-slate-900" />
                  <Italic size={16} className="cursor-pointer hover:text-slate-900" />
                  <Underline size={16} className="cursor-pointer hover:text-slate-900" />
                  <span className="font-serif italic font-bold cursor-pointer hover:text-slate-900">A<span className="text-xs align-super">i</span></span>
                </div>

                <div className="h-4 w-px bg-slate-200 shrink-0" />

                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                  <AlignLeft size={16} className="cursor-pointer hover:text-slate-900" />
                  <AlignCenter size={16} className="cursor-pointer hover:text-slate-900" />
                  <List size={16} className="cursor-pointer hover:text-slate-900" />
                  <MoreHorizontal size={16} className="cursor-pointer hover:text-slate-900" />
                </div>
                
                <div className="ml-auto flex items-center gap-4 shrink-0">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1 cursor-pointer hover:text-slate-900"><span className="text-purple-600">✓</span> Apply Style</span>
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1 relative cursor-pointer hover:text-slate-900">
                    <Settings size={12} /> All Tools
                    
                    {/* Annotation: More Options */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                      <div className="bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg relative animate-bounce">
                        More options
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#10B981] rotate-45"></div>
                      </div>
                    </div>
                  </span>
                </div>
             </div>

             {/* Mockup Body */}
             <div className="flex min-h-[600px]">
               
               {/* Sidebar Icons */}
               <div className="w-16 border-r border-slate-100 flex flex-col items-center py-6 gap-8 text-slate-400 bg-slate-50/30 shrink-0">
                 <div className="p-2 bg-slate-200/50 rounded-lg text-slate-600 cursor-pointer"><FileText size={20} /></div>
                 <PenTool size={20} className="cursor-pointer hover:text-slate-600 transition-colors" />
                 <MessageSquare size={20} className="cursor-pointer hover:text-slate-600 transition-colors" />
                 <BarChart2 size={20} className="cursor-pointer hover:text-slate-600 transition-colors" />
                 <Settings size={20} className="cursor-pointer hover:text-slate-600 transition-colors" />
               </div>

               {/* Settings Panel */}
               <div className="w-72 border-r border-slate-100 p-6 bg-slate-50/10 hidden md:block shrink-0">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-6">
                     <div className="flex justify-between items-center">
                       <h3 className="font-semibold text-slate-900">Content Filter</h3>
                     </div>

                     <div className="space-y-2 relative">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                       <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                         About Marketing
                       </div>
                       
                       {/* Annotation: Title Here */}
                       <div className="absolute top-8 right-[-110px] z-20 hidden lg:block pointer-events-none">
                         <div className="relative">
                           <div className="bg-[#EC4899] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                             Title here
                           </div>
                           <svg className="absolute top-1/2 -left-8 -translate-y-1/2 w-8 h-8 text-[#EC4899]" viewBox="0 0 50 20" fill="none">
                              <path d="M48 10 H2" stroke="currentColor" strokeWidth="2" markerStart="url(#arrow)" />
                           </svg>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                       <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-400 h-24">
                         Write about marketing & business strategy with some tips.
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</label>
                       <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">Automation <X size={8}/></span>
                         <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">Artificial <X size={8}/></span>
                         <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">Strategy <X size={8}/></span>
                         <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">Marketing AI <X size={8}/></span>
                       </div>
                     </div>

                     <button className="w-full py-3 rounded-xl border-2 border-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center gap-2 mt-4 hover:bg-purple-50 transition-colors">
                       Generate Now <SparklesIcon className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Editor Area */}
               <div className="flex-1 p-8 relative">
                 
                 <div className="max-w-2xl mx-auto">
                   <div className="flex items-center gap-2 mb-6">
                     <div className="w-5 h-5 text-purple-600"><Zap size={20} fill="currentColor" /></div>
                     <span className="font-bold text-slate-900">Generate Blog</span>
                   </div>

                   <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight relative inline-block">
                     AI in Marketing Open
                     <br />
                     Create New Era.
                     
                     {/* Annotation: Edit Title */}
                     <div className="absolute bottom-2 -right-24 hidden lg:block pointer-events-none">
                        <div className="bg-[#F59E0B] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg relative">
                           Edit title
                           <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[#F59E0B] -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                        </div>
                     </div>
                   </h1>

                   <p className="text-xl text-slate-400 font-light mb-12">
                     Write about marketing & business strategy with some tips
                   </p>

                   {/* Feature Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                     <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-purple-200 hover:shadow-md transition-all bg-white cursor-pointer">
                        <Zap size={20} className="text-slate-900" />
                        <span className="text-xs font-bold text-slate-900">Idea Generation</span>
                     </div>
                     <div className="border border-green-200 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm bg-white cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
                        <Star size={20} className="text-slate-900" />
                        <span className="text-xs font-bold text-slate-900">AI Magic</span>
                     </div>
                     <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-purple-200 hover:shadow-md transition-all bg-white cursor-pointer">
                        <MessageSquare size={20} className="text-slate-900" />
                        <span className="text-xs font-bold text-slate-900">Suggestion</span>
                     </div>
                   </div>
                 </div>

               </div>

             </div>
          </div>
          
          {/* Background Glow behind Mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-[60px] -z-10 rounded-full" />

        </div>
      </div>

      {/* Logo Cloud Section */}
      <div className="py-12 border-y border-slate-100 bg-white/50">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-500 font-medium text-sm mb-8 uppercase tracking-widest">Trusted by 10,000+ professional writers</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholder SVGs for Logos */}
               <LogoPlaceholder name="TechCrunch" />
               <LogoPlaceholder name="Forbes" />
               <LogoPlaceholder name="Wired" />
               <LogoPlaceholder name="Medium" />
               <LogoPlaceholder name="Ghost" />
            </div>
         </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-50/50 relative overflow-hidden">
         {/* Background Orbs */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-3xl -z-10" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-3xl -z-10" />

         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything you need to dominate content</h2>
               <p className="text-lg text-slate-500">
                  Stop wrestling with writer's block. AiWriter gives you a complete suite of tools to research, write, and publish 10x faster.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <FeatureCard 
                 icon={Zap} 
                 title="Instant Generation" 
                 description="Create full-length, SEO-optimized articles in seconds with just a topic." 
                 color="purple"
               />
               <FeatureCard 
                 icon={BarChart2} 
                 title="Trend Radar" 
                 description="AI proactively scans the web for real-time trends and news to ground your content." 
                 color="orange"
               />
               <FeatureCard 
                 icon={RefreshCw} 
                 title="WordPress Sync" 
                 description="Connect your blog once. Draft and publish content directly from the dashboard." 
                 color="green"
               />
               <FeatureCard 
                 icon={MessageSquare} 
                 title="Humanized Tone" 
                 description="Our proprietary engine removes the 'AI fluff' for engaging, conversational writing." 
                 color="pink"
               />
               <FeatureCard 
                 icon={Globe} 
                 title="SEO Optimized" 
                 description="Content structured with proper H1-H3 tags, lists, and keywords to rank higher." 
                 color="blue"
               />
               <FeatureCard 
                 icon={Layers} 
                 title="Multi-Format" 
                 description="Not just blogs. Generate social captions, newsletters, and ad copy in one click." 
                 color="yellow"
               />
            </div>
         </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 space-y-8">
                  <h2 className="text-4xl font-bold text-slate-900">From idea to published post in 3 simple steps.</h2>
                  <p className="text-lg text-slate-500">No complex prompts needed. Just tell us what you want to write about, and we handle the research, outlining, and drafting.</p>
                  
                  <div className="space-y-6">
                     <StepItem number="01" title="Enter your topic" description="Type a keyword or headline. That's it." />
                     <StepItem number="02" title="AI Researches & Writes" description="We scan the web for facts and write a human-like draft." />
                     <StepItem number="03" title="Edit & Publish" description="Tweak using our rich editor and send to WordPress instantly." />
                  </div>
                  
                  <div className="pt-4">
                     <Link href="/dashboard">
                       <Button size="lg" className="rounded-full px-8 bg-slate-900 hover:bg-slate-800">
                         Start Writing for Free <ArrowRight className="ml-2 h-4 w-4" />
                       </Button>
                     </Link>
                  </div>
               </div>
               
               <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-orange-100 rounded-[3rem] transform rotate-3 -z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                    alt="Workflow" 
                    className="rounded-[2.5rem] shadow-2xl border-8 border-white"
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
               <p className="text-slate-400 text-lg">Start for free, upgrade as you scale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               {/* Free Plan */}
               <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 flex flex-col hover:border-slate-600 transition-colors">
                  <div className="mb-8">
                     <h3 className="text-xl font-semibold mb-2">Starter</h3>
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-slate-400">/mo</span>
                     </div>
                     <p className="text-slate-400 mt-4 text-sm">Perfect for hobbyists just starting out.</p>
                  </div>
                  <ul className="space-y-4 flex-1 mb-8">
                     <PricingCheck text="5 AI Blog Posts / mo" />
                     <PricingCheck text="Basic Research" />
                     <PricingCheck text="Standard Support" />
                  </ul>
                  <Link href="/dashboard">
                     <button className="w-full py-3 rounded-full border border-slate-600 font-bold hover:bg-white hover:text-black transition-all">Get Started</button>
                  </Link>
               </div>

               {/* Pro Plan */}
               <div className="bg-white text-slate-900 rounded-3xl p-8 flex flex-col shadow-2xl shadow-purple-500/20 transform md:-translate-y-4 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">Most Popular</div>
                  <div className="mb-8">
                     <h3 className="text-xl font-semibold mb-2 text-purple-600">Pro Writer</h3>
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-slate-500">/mo</span>
                     </div>
                     <p className="text-slate-500 mt-4 text-sm">For serious bloggers and marketers.</p>
                  </div>
                  <ul className="space-y-4 flex-1 mb-8">
                     <PricingCheck text="Unlimited AI Posts" dark />
                     <PricingCheck text="Advanced Trend Radar" dark />
                     <PricingCheck text="WordPress Auto-Sync" dark />
                     <PricingCheck text="Priority Support" dark />
                  </ul>
                  <Link href="/dashboard">
                     <button className="w-full py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">Start Pro Trial</button>
                  </Link>
               </div>

               {/* Business Plan */}
               <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 flex flex-col hover:border-slate-600 transition-colors">
                  <div className="mb-8">
                     <h3 className="text-xl font-semibold mb-2">Agency</h3>
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">$99</span>
                        <span className="text-slate-400">/mo</span>
                     </div>
                     <p className="text-slate-400 mt-4 text-sm">For teams and multiple sites.</p>
                  </div>
                  <ul className="space-y-4 flex-1 mb-8">
                     <PricingCheck text="Everything in Pro" />
                     <PricingCheck text="10+ User Seats" />
                     <PricingCheck text="API Access" />
                     <PricingCheck text="Custom Integrations" />
                  </ul>
                  <Link href="/dashboard">
                     <button className="w-full py-3 rounded-full border border-slate-600 font-bold hover:bg-white hover:text-black transition-all">Contact Sales</button>
                  </Link>
               </div>
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg transform -rotate-6">
                        <div className="w-3 h-3 bg-white rounded-full" />
                     </div>
                     <span className="text-xl font-bold tracking-tight">Ai<span className="text-purple-600">Writer</span></span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                     The world's most advanced AI writing assistant. Create, edit, and publish content 10x faster.
                  </p>
               </div>
               
               <div>
                  <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                  <ul className="space-y-4 text-sm text-slate-500">
                     <li><a href="#" className="hover:text-purple-600">Features</a></li>
                     <li><a href="#" className="hover:text-purple-600">Pricing</a></li>
                     <li><a href="#" className="hover:text-purple-600">API</a></li>
                     <li><a href="#" className="hover:text-purple-600">Integrations</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-slate-500">
                     <li><a href="#" className="hover:text-purple-600">About Us</a></li>
                     <li><a href="#" className="hover:text-purple-600">Careers</a></li>
                     <li><a href="#" className="hover:text-purple-600">Blog</a></li>
                     <li><a href="#" className="hover:text-purple-600">Contact</a></li>
                  </ul>
               </div>
               
               <div>
                  <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
                  <ul className="space-y-4 text-sm text-slate-500">
                     <li><a href="#" className="hover:text-purple-600">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-purple-600">Terms of Service</a></li>
                     <li><a href="#" className="hover:text-purple-600">Cookie Policy</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
               <p>&copy; 2024 AiWriter Inc. All rights reserved.</p>
               <div className="flex gap-6">
                  <a href="#" className="hover:text-purple-600">Twitter</a>
                  <a href="#" className="hover:text-purple-600">LinkedIn</a>
                  <a href="#" className="hover:text-purple-600">Instagram</a>
               </div>
            </div>
         </div>
      </footer>

    </div>
  );
}

/* --- Sub Components --- */

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 3V8M12 8L9.5 5.5M12 8L14.5 5.5M12 8V13M8 12H3M8 12L5.5 9.5M8 12L5.5 14.5M8 12H13M16 12H21M16 12L18.5 9.5M16 12L18.5 14.5M16 12H11M12 16V21M12 16L9.5 18.5M12 16L14.5 18.5M12 16V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LogoPlaceholder({ name }: { name: string }) {
   return (
      <div className="text-xl font-bold text-slate-400 flex items-center gap-2">
         <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
         {name}
      </div>
   )
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
   return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${color}-100 text-${color}-600`}>
            <Icon size={24} className={`text-${color}-600`} />
         </div>
         <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
         <p className="text-slate-500 leading-relaxed">{description}</p>
      </div>
   )
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
   return (
      <div className="flex gap-6 items-start">
         <span className="text-4xl font-black text-purple-100 leading-none">{number}</span>
         <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
            <p className="text-slate-500">{description}</p>
         </div>
      </div>
   )
}

function PricingCheck({ text, dark }: { text: string, dark?: boolean }) {
   return (
      <li className="flex items-center gap-3 text-sm">
         <div className={`w-5 h-5 rounded-full flex items-center justify-center ${dark ? 'bg-purple-100 text-purple-600' : 'bg-slate-700 text-white'}`}>
            <CheckCircle2 size={12} />
         </div>
         <span className={dark ? 'text-slate-600' : 'text-slate-300'}>{text}</span>
      </li>
   )
}