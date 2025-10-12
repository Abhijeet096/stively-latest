// seed-articles-complete.js
// COMPLETE VERSION - Just copy this entire file
// Run: node seed-articles-complete.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const articles = [
  {
    title: "Best Free AI Tools for Teachers in 2025",
    slug: "best-free-ai-tools-teachers-2025",
    description: "Discover AI tools transforming classrooms. From grading to lesson plans, save hours weekly.",
    category: "AI for Professionals",
    tags: ["teachers", "education", "ai tools"],
    content: `<h2>Teaching Revolution</h2><p>Teachers are discovering AI tools that save hours on grading and admin work. These free tools handle busywork so educators can focus on students. From automated grading to personalized learning, AI is giving teachers their time back without replacing the human touch that makes great teaching possible.</p>`,
    seo: {
      metaTitle: "Best Free AI Tools for Teachers 2025",
      metaDescription: "Top AI tools for teachers. Save hours on grading and planning.",
      keywords: ["ai tools teachers", "education ai", "classroom tech"]
    }
  },
  {
    title: "AI Tools for Small Business - Save 10 Hours Weekly",
    slug: "ai-tools-small-business",
    description: "Automate repetitive tasks and focus on growth with these AI tools for entrepreneurs.",
    category: "AI for Professionals", 
    tags: ["business", "productivity", "automation"],
    content: `<h2>Business Automation</h2><p>Small business owners waste 15+ hours weekly on admin tasks. AI tools handle customer emails, social media, bookkeeping, and scheduling automatically. Free and affordable options make professional automation accessible to solo entrepreneurs and small teams.</p>`,
    seo: {
      metaTitle: "AI Tools for Small Business Owners 2025",
      metaDescription: "Save 10+ hours weekly with AI automation for small business.",
      keywords: ["ai small business", "business automation", "productivity tools"]
    }
  },
  {
    title: "Top AI Writing Assistants for Content Creators",
    slug: "ai-writing-assistants-content-creators",
    description: "Create better content faster with AI writing tools. From blogs to social media.",
    category: "AI for Professionals",
    tags: ["writing", "content creation", "blogging"],
    content: `<h2>Content Creation Speed</h2><p>AI writing assistants help creators produce quality content 10x faster. ChatGPT, Jasper, and Copy.ai handle first drafts while you focus on strategy and editing. These tools understand your voice and maintain quality across all your content channels.</p>`,
    seo: {
      metaTitle: "Best AI Writing Tools for Content Creators 2025",
      metaDescription: "Top AI writing assistants reviewed. Create content faster.",
      keywords: ["ai writing tools", "content creation", "chatgpt writing"]
    }
  },
  {
    title: "AI Tools Every Freelancer Needs in 2025",
    slug: "ai-tools-freelancers-2025",
    description: "From proposals to invoicing, AI tools help freelancers work smarter and earn more.",
    category: "AI for Professionals",
    tags: ["freelancing", "productivity", "remote work"],
    content: `<h2>Freelance Efficiency</h2><p>Successful freelancers use AI for proposals, time tracking, invoicing, and client communication. These tools reduce admin time by 40%, letting you focus on billable work. Free options available for most essential freelance tasks.</p>`,
    seo: {
      metaTitle: "Essential AI Tools for Freelancers 2025",
      metaDescription: "AI tools that help freelancers save time and make more money.",
      keywords: ["ai freelancing", "freelance tools", "productivity"]
    }
  },
  {
    title: "Best AI Tools for Real Estate Agents",
    slug: "ai-tools-real-estate-agents",
    description: "Close more deals with AI tools for listing descriptions, lead follow-up, and market analysis.",
    category: "AI for Professionals",
    tags: ["real estate", "sales", "marketing"],
    content: `<h2>Real Estate AI</h2><p>Top agents use AI for instant lead response, compelling property descriptions, and virtual staging. These tools help you close more deals while spending less time on admin work. AI chatbots respond to leads 24/7 so you never miss opportunities.</p>`,
    seo: {
      metaTitle: "AI Tools for Real Estate Agents 2025",
      metaDescription: "Close more deals with AI automation for real estate.",
      keywords: ["real estate ai", "property marketing", "lead generation"]
    }
  },
  {
    title: "AI Tools for Healthcare Professionals",
    slug: "ai-tools-healthcare-professionals",
    description: "Reduce documentation time and improve patient care with HIPAA-compliant AI tools.",
    category: "AI for Professionals",
    tags: ["healthcare", "medical", "patient care"],
    content: `<h2>Healthcare Innovation</h2><p>AI medical scribes reduce documentation time by 50%. These HIPAA-compliant tools handle clinical notes, prescription management, and patient communication while you focus on care. Doctors report leaving work on time and avoiding burnout.</p>`,
    seo: {
      metaTitle: "AI Tools for Healthcare Providers 2025",
      metaDescription: "HIPAA-compliant AI tools reducing documentation time for doctors.",
      keywords: ["healthcare ai", "medical ai tools", "clinical documentation"]
    }
  },
  {
    title: "Free AI Image Generators - Create Stunning Visuals",
    slug: "free-ai-image-generators",
    description: "Generate professional images in seconds with free AI tools. No design skills required.",
    category: "AI Tools by Task",
    tags: ["design", "images", "content creation"],
    content: `<h2>Visual Content Creation</h2><p>DALL-E 3, Leonardo AI, and Playground create professional images from text descriptions. Free tiers provide enough monthly images for most creators. Perfect for blog headers, social media, and marketing materials without stock photo costs.</p>`,
    seo: {
      metaTitle: "Best Free AI Image Generators 2025",
      metaDescription: "Create stunning images with free AI generators. DALL-E 3 and more.",
      keywords: ["ai image generator", "dall-e free", "create images ai"]
    }
  },
  {
    title: "AI Video Editing Tools for Beginners",
    slug: "ai-video-editing-beginners",
    description: "Edit professional videos without experience. AI tools handle the technical work.",
    category: "AI Tools by Task",
    tags: ["video editing", "content creation", "youtube"],
    content: `<h2>Easy Video Editing</h2><p>Descript lets you edit video by editing text transcripts. CapCut offers free AI features like auto-captions and smart transitions. Create YouTube videos and social content in minutes, not hours, even with zero editing experience.</p>`,
    seo: {
      metaTitle: "Best AI Video Editing Tools for Beginners 2025",
      metaDescription: "Edit videos easily with AI. Descript, CapCut, and more reviewed.",
      keywords: ["ai video editing", "descript", "capc ut", "video tools"]
    }
  },
  {
    title: "AI Presentation Tools Better Than PowerPoint",
    slug: "ai-presentation-tools-powerpoint-alternative",
    description: "Create beautiful presentations in minutes with AI design tools.",
    category: "AI Tools by Task",
    tags: ["presentations", "design", "business"],
    content: `<h2>Presentation Revolution</h2><p>Gamma and Beautiful.ai generate complete presentations from outlines. AI handles design, layouts, and imagery while you focus on content. Create professional decks in 30 minutes instead of 4 hours. Free tiers available.</p>`,
    seo: {
      metaTitle: "Best AI Presentation Tools 2025 | PowerPoint Alternative",
      metaDescription: "Create stunning presentations with AI. Gamma, Beautiful.ai reviewed.",
      keywords: ["ai presentation", "gamma app", "powerpoint alternative"]
    }
  },
  {
    title: "Top AI Research Tools for Students",
    slug: "ai-research-tools-students",
    description: "Study smarter with AI tools for research, note-taking, and exam prep.",
    category: "AI Tools by Task",
    tags: ["education", "students", "research"],
    content: `<h2>Student Success Tools</h2><p>Consensus and Perplexity help students research faster. ChatGPT explains complex topics simply. Quizlet AI creates personalized study materials. These free tools help students learn effectively and save hours on homework and research.</p>`,
    seo: {
      metaTitle: "Best AI Research Tools for Students 2025",
      metaDescription: "AI tools helping students study smarter and ace exams.",
      keywords: ["ai students", "research tools", "study aids"]
    }
  },
  {
    title: "AI Email Tools - Reply 10x Faster",
    slug: "ai-email-writing-tools",
    description: "Handle email overload with AI assistants that draft professional responses instantly.",
    category: "AI Tools by Task",
    tags: ["email", "productivity", "communication"],
    content: `<h2>Email Productivity</h2><p>Gmail Smart Reply, Superhuman, and ChatGPT help you respond to emails 10x faster. AI drafts professional responses while maintaining your voice. Free options handle most needs. Reclaim hours spent in your inbox daily.</p>`,
    seo: {
      metaTitle: "Best AI Email Writing Tools 2025",
      metaDescription: "Reply to emails faster with AI assistance. Tools reviewed.",
      keywords: ["ai email", "email productivity", "superhuman"]
    }
  },
  {
    title: "Best AI Voice Generators for Podcasters",
    slug: "ai-voice-generators-podcasters",
    description: "Create realistic voiceovers without recording. Free AI voice tools reviewed.",
    category: "AI Tools by Task",
    tags: ["podcasting", "voice", "audio"],
    content: `<h2>AI Voice Technology</h2><p>ElevenLabs and Play.ht create realistic AI voices for podcasts and videos. Clone your own voice or use professional narrators. Free tiers provide enough monthly audio for regular content creators. Natural-sounding results.</p>`,
    seo: {
      metaTitle: "Best AI Voice Generators 2025 | Podcast Tools",
      metaDescription: "Create realistic voiceovers with AI. ElevenLabs and more.",
      keywords: ["ai voice generator", "elevenlabs", "podcast voice"]
    }
  },
  {
    title: "AI Meeting Summary Tools - Never Take Notes",
    slug: "ai-meeting-summary-tools",
    description: "Record, transcribe, and summarize meetings automatically with AI assistants.",
    category: "AI Tools by Task",
    tags: ["productivity", "meetings", "business"],
    content: `<h2>Meeting Automation</h2><p>Otter.ai and Fireflies join meetings, transcribe everything, and create summaries with action items. Free tiers cover most needs. Focus on participating instead of note-taking. Search past meetings instantly.</p>`,
    seo: {
      metaTitle: "Best AI Meeting Tools 2025 | Auto Note-Taking",
      metaDescription: "AI tools that record and summarize meetings automatically.",
      keywords: ["ai meeting notes", "otter.ai", "meeting transcription"]
    }
  },
  {
    title: "New AI Tools This Month - Worth Trying",
    slug: "new-ai-tools-this-month",
    description: "Latest AI tool releases reviewed. Discover which new tools are actually useful.",
    category: "Trending AI Tools",
    tags: ["new tools", "reviews", "trending"],
    content: `<h2>Latest AI Innovations</h2><p>New AI tools launch daily. This month's standouts include Runway Gen-2 for video, HeyGen for avatars, and Claude 2 for better conversations. Free trials available. We separate hype from genuinely useful tools.</p>`,
    seo: {
      metaTitle: "New AI Tools Released This Month 2025",
      metaDescription: "Latest AI tools reviewed and tested. What's worth trying.",
      keywords: ["new ai tools", "ai updates", "runway gen-2"]
    }
  },
  {
    title: "ChatGPT Alternatives That Are Better",
    slug: "chatgpt-alternatives-better",
    description: "Discover AI assistants that outperform ChatGPT for specific tasks.",
    category: "Trending AI Tools",
    tags: ["chatgpt", "ai assistants", "alternatives"],
    content: `<h2>Beyond ChatGPT</h2><p>Claude handles longer documents. Perplexity searches current web info. Poe gives access to multiple AIs. These alternatives often perform better than ChatGPT for specific tasks. Many offer free tiers worth exploring.</p>`,
    seo: {
      metaTitle: "Best ChatGPT Alternatives 2025",
      metaDescription: "AI assistants better than ChatGPT for specific tasks.",
      keywords: ["chatgpt alternatives", "claude ai", "perplexity ai"]
    }
  }
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('blog-platform');
    const collection = db.collection('blogs');

    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing articles. Deleting them...`);
      await collection.deleteMany({});
      console.log('✅ Deleted old articles');
    }

    const now = new Date();
    const articlesWithMeta = articles.map((article, index) => ({
      ...article,
      author: { id: "admin", name: "Stively Team" },
      status: "published",
      views: Math.floor(Math.random() * 800) + 200,
      likes: Math.floor(Math.random() * 80) + 20,
      likedBy: [],
      createdAt: new Date(now.getTime() - (articles.length - index) * 86400000),
      updatedAt: new Date(now.getTime() - (articles.length - index) * 86400000),
      publishedAt: new Date(now.getTime() - (articles.length - index) * 86400000),
    }));

    const result = await collection.insertMany(articlesWithMeta);
    console.log(`\n✅ Successfully inserted ${result.insertedCount} articles!`);
    console.log('\n📊 Articles:');
    articlesWithMeta.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
    });
    
    console.log('\n🎉 Done! Visit http://localhost:3000/blog');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Closed connection');
  }
}

seedDatabase();