"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Sustainable Architecture",
    excerpt:
      "Exploring innovative materials and techniques shaping tomorrow's green buildings.",
    date: "May 15, 2023",
    category: "Sustainability",
    image: "/images/project1.jpg",
  },
  {
    id: 2,
    title: "Urban Spaces Reimagined",
    excerpt:
      "How we transformed a derelict industrial area into a vibrant community hub.",
    date: "April 2, 2023",
    category: "Urban Design",
    image: "/images/project2.jpg",
  },
  {
    id: 3,
    title: "The Psychology of Space",
    excerpt:
      "Understanding how architectural design influences human behavior and wellbeing.",
    date: "March 18, 2023",
    category: "Design Theory",
    image: "/images/project3.jpg",
  },
];

export default function Blog() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest text-amber-500">
            LATEST INSIGHTS
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-2">
            Design Perspectives
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              variants={cardVariants}
              className="group"
            >
              <Link href={`/blog/${post.id}`}>
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
                  <span className="text-sm text-stone-500">{post.date}</span>
                  <h3 className="text-xl font-light my-2 group-hover:text-amber-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-stone-600">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-amber-500 group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-medium">Read More</span>
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-stone-300 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
          >
            View All Articles
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}