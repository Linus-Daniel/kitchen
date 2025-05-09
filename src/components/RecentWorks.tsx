"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "Horizon Towers",
    type: "Mixed-Use Development",
    year: "2023",
    location: "Miami, FL",
    image: "/projects/horizon-towers.jpg",
    slug: "horizon-towers",
    services: ["Master Planning", "Facade Design", "Interior Architecture"]
  },
  {
    id: 2,
    title: "The Arboretum",
    type: "Public Park & Pavilion",
    year: "2023",
    location: "Portland, OR",
    image: "/projects/arboretum.jpg",
    slug: "the-arboretum",
    services: ["Landscape Architecture", "Structural Engineering", "Wayfinding"]
  },
  {
    id: 3,
    title: "Marina Lofts",
    type: "Waterfront Residential",
    year: "2022",
    location: "Chicago, IL",
    image: "/projects/marina-lofts.jpg",
    slug: "marina-lofts",
    services: ["Concept Development", "Construction Documents", "Interior Design"]
  }
];

const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
      className="group relative overflow-hidden rounded-xl"
    >
      <div className="aspect-[4/3] relative">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 p-6 text-white">
        <div className="mb-2">
          <span className="text-sm font-light opacity-80">{project.year} • {project.type}</span>
        </div>
        <h3 className="text-2xl font-medium mb-2">{project.title}</h3>
        <p className="text-sm font-light mb-4">{project.location}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.services.map((service, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full">
              {service}
            </span>
          ))}
        </div>

        <Link 
          href={`/work/${project.slug}`}
          className="inline-flex items-center text-sm font-medium hover:underline"
        >
          View Project
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default function RecentWork() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">
            Recent Work
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our latest architectural explorations and built environments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/work"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Projects
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}