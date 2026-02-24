const siteContent = {
  hero: {
    tagline: "Next-Gen Prompt Engineering",
    title: `Master the art of <br> <span class="text-gradient-accent italic pr-2">synthetic</span> intelligence.`,
    description: "A curated marketplace for editorial-grade prompts. Optimized for GPT-4, Midjourney, and Claude.",
    cta: "Explore Marketplace"
  },
  aboutHero: {
    tagline: "Our Story",
    title: `We are building the <br> <span class="text-gradient-accent">language of tomorrow.</span>`,
    description: "Prompster is the world's first editorial marketplace for synthetic intelligence. We bridge the gap between human creativity and machine capability."
  },
  bestSeller: {
    productId: 1,
    title: "Best Selling Product",
    rank: "#1 in Marketplace",
    tag: "Midjourney v6",
    productName: "SaaS Landing Page Architect",
    price: 850,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop"
  },
  dailyDrop: {
    productId: 12,
    title: "Daily Free Drop",
    name: "Minimalist Vector Logos",
    description: `High-quality SVG pack for branding. Includes 50+ geometric shapes and abstract symbols. <span class="text-green-400 font-medium whitespace-nowrap">100% Free today.</span>`,
    badge: "Preview",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  featuredCollection: {
    productId: 13,
    title: "Enterprise SEO Suite",
    description: "A complete bundle of 50+ prompts for keyword research, content clustering, and technical audit. Verified by top SEO agencies.",
    price: 4500
  },
  mission: {
    title: "Our Mission",
    description1: "We believe that prompt engineering is the coding of the future. But unlike traditional code, it is nuanced, artistic, and deeply human. Our mission is to empower creators to monetize their expertise and help businesses unlock the true potential of AI.",
    description2: "We curate quality over quantity. Every prompt on our platform is rigorously tested, version-controlled, and optimized for specific model architectures.",
    stats: [
      { value: "10k+", label: "Curated Prompts" },
      { value: "50k+", label: "Active Creators" }
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
  },
  whyChooseUs: [
    {
      icon: "lucide:shield-check",
      color: "blue",
      title: "Vetted Quality",
      description: "Every submission undergoes a strict review process. We don't just accept any text; we accept engineering."
    },
    {
      icon: "lucide:zap",
      color: "purple",
      title: "Model Specific",
      description: "Prompts tailored for specific model versions (v4, v5.2, v6). No more guessing if a prompt works."
    },
    {
      icon: "lucide:users",
      color: "green",
      title: "Community First",
      description: "A thriving ecosystem of prompt engineers. Learn, share, and earn from the best in the industry."
    }
  ],
  team: [
    {
      name: "Arbaz Ali",
      role: "Founder & CEO",
      roleColor: "text-blue-400",
      bio: "Visionary leader obsessed with the intersection of AI and human creativity.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
      borderHover: "group-hover:border-blue-500"
    },
    {
      name: "Sarah Chen",
      role: "Head of Engineering",
      roleColor: "text-purple-400",
      bio: "Architecting the semantic framework that powers our search algorithms.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      borderHover: "group-hover:border-purple-500"
    },
    {
      name: "Marcus Rowe",
      role: "Lead Designer",
      roleColor: "text-green-400",
      bio: "Crafting pixel-perfect experiences for the next generation of web.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
      borderHover: "group-hover:border-green-500"
    },
    {
      name: "Elena Rodriguez",
      role: "Community Lead",
      roleColor: "text-yellow-400",
      bio: "Building bridges between creators, buyers, and enthusiasts.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
      borderHover: "group-hover:border-yellow-500"
    }
  ],
  reviews: [
    {
      name: "Alex Morgan",
      role: "Product Designer",
      image: "https://i.pravatar.cc/100?img=12",
      stars: 5,
      text: "The SaaS prompt pack saved me weeks of copywriting work. The output quality is consistently amazing."
    },
    {
      name: "Sarah Jenkins",
      role: "Indie Developer",
      image: "https://i.pravatar.cc/100?img=33",
      stars: 5,
      text: "I bought the icon pack and the SEO suite. Both are top tier. Highly recommend Prompster."
    },
    {
      name: "David Chen",
      role: "Marketing Lead",
      image: "https://i.pravatar.cc/100?img=59",
      stars: 5,
      text: "Finally a marketplace that understands quality. The Prompt Engineering guide was a game changer."
    }
  ],
  digitalAssets: [
    {
      _id: 101,
      title: "Neon Glass Icons",
      desc: "Premium 3D glassmorphism icons for modern UI projects.",
      tag: "Icon Pack",
      price: 1200,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      meta: "Size: 420MB"
    },
    {
      _id: 102,
      title: "Fintech Dashboard UI",
      desc: "Complete Figma kit for financial apps with dark/light modes.",
      tag: "UI Kit",
      price: 2500,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      meta: "Figma"
    },
    {
      _id: 103,
      title: "iPhone 15 Mockups",
      desc: "High-resolution PSD mockups in various environments.",
      tag: "Mockups",
      price: 900,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      meta: "PSD"
    },
    {
      _id: 104,
      title: "Stellar Grotesk",
      desc: "Modern sans-serif font family with 12 weights.",
      tag: "Font",
      price: 1500,
      image: "https://images.unsplash.com/photo-1558655146-d09347e0b7a9?q=80&w=600&auto=format&fit=crop",
      meta: "TTF/OTF"
    },
    {
      _id: 105,
      title: "Grunge Textures Pack",
      desc: "50+ High-res grit and grime textures for overlays.",
      tag: "Textures",
      price: 350,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      meta: "JPEG"
    },
    {
      _id: 106,
      title: "Loading Animations",
      desc: "Smooth JSON animations for web and mobile loaders.",
      tag: "Lottie",
      price: 800,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      meta: "JSON"
    }
  ]
};
