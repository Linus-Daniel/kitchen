"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const blogPosts = [
  {
    id: "sustainable-architecture-future",
    title: "The Future of Sustainable Architecture",
    excerpt: "Exploring innovative materials and techniques shaping tomorrow's green buildings.",
    date: "May 15, 2023",
    category: "Sustainability",
    image: "/images/project1.jpg",
    readTime: "5 min read"
  },
  {
    id: "urban-spaces-reimagined",
    title: "Urban Spaces Reimagined",
    excerpt: "How we transformed a derelict industrial area into a vibrant community hub.",
    date: "April 2, 2023",
    category: "Urban Design",
    image: "/images/project1.jpg",
    readTime: "7 min read"
  },
  {
    id: "psychology-of-space",
    title: "The Psychology of Space",
    excerpt: "Understanding how architectural design influences human behavior and wellbeing.",
    date: "March 18, 2023",
    category: "Design Theory",
    image: "/images/project2.jpg",
    readTime: "4 min read"
  },
  {
    id: "biophilic-design",
    title: "Embracing Biophilic Design",
    excerpt: "Integrating nature into built environments for healthier living spaces.",
    date: "February 5, 2023",
    category: "Design Theory",
    image: "/images/project3.jpg",
    readTime: "6 min read"
  }
];

export default function BlogPage() {
  return (
    <main className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light mb-4">Architectural Insights</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Exploring design philosophy, industry trends, and our latest projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blogs/${post.id}`}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-2">
                  <span className="text-sm text-stone-500">{post.date} • {post.readTime}</span>
                  <h2 className="text-xl font-light my-2 group-hover:text-amber-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-stone-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center text-amber-500 group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-medium">Read Article</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="px-6 py-3 border border-stone-300 rounded-full text-stone-700 hover:bg-stone-100 transition-colors">
            Load More Articles
          </button>
        </div>
      </div>
    </main>
  );
}