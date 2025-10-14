"use client";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  LuCalendar as Calendar,
  LuClock as Clock,
  LuUser as User,
} from "react-icons/lu";
import Link from "next/link";
import { useParams } from "next/navigation";

const blogPosts = [
  {
    id: "sustainable-architecture-future",
    title: "The Future of Sustainable Architecture",
    content: `
      <h2>Introduction</h2>
      <p>The architecture industry stands at a pivotal moment in history, where sustainable design is no longer optional but essential. As we face climate challenges, architects are reimagining how buildings interact with their environments.</p>
      
      <h2>Innovative Materials</h2>
      <p>New materials like self-healing concrete, transparent wood, and carbon-negative bricks are revolutionizing construction. These materials reduce environmental impact while maintaining structural integrity.</p>
      
      <h2>Energy Efficiency</h2>
      <p>Modern designs incorporate passive heating and cooling systems, dramatically reducing energy consumption. The Edge in Amsterdam serves as a prime example, producing more energy than it consumes.</p>
      
      <h2>Case Study: Bosco Verticale</h2>
      <p>Milan's Vertical Forest demonstrates how urban buildings can host diverse ecosystems, with over 900 trees and 20,000 plants across two towers.</p>
      
      <h2>Looking Ahead</h2>
      <p>The future lies in regenerative architecture - buildings that actively improve their environments. Projects like the Sahara Forest Project show how architecture can reverse desertification.</p>
    `,
    date: "May 15, 2023",
    category: "Sustainability",
    image: "/images/project1.jpg",
    readTime: "5 min read",
    author: "Umson Studio",
    authorAvatar: "/images/avatar.webp",
  },
  // ... other posts
];

export default function BlogPost() {
  const params = useParams();
  const id = params.id as string;
  const post = blogPosts.find((post) => post.id === id);

  if (!post) {
    return notFound();
  }

  return (
    <main className="py-20 bg-white">
      <article className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <span className="text-sm text-amber-500 uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-light mt-2 mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-stone-500 mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-12">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t border-stone-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100">
              <Image
                src={post.authorAvatar}
                alt={post.author}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">{post.author}</h3>
              <p className="text-stone-600">
                Principal Architect at Rossi Architecture
              </p>
            </div>
          </div>
        </div>
      </article>

      <section className="container mx-auto px-6 mt-20">
        <h2 className="text-2xl font-light mb-8">More Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts
            .filter((p) => p.id !== params.slug)
            .slice(0, 3)
            .map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-light group-hover:text-amber-500 transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
