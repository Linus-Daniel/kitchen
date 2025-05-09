// components/Skills.tsx
'use client';
import { motion } from 'framer-motion';
import { FaReact, FaNode, FaDatabase, FaGitAlt, FaFigma } from 'react-icons/fa';
import { SiTailwindcss, SiNextdotjs, SiMongodb, SiTypescript } from 'react-icons/si';

const skills = [
  { name: 'React', icon: FaReact, level: 90 },
  { name: 'Next.js', icon: SiNextdotjs, level: 85 },
  { name: 'Tailwind CSS', icon: SiTailwindcss, level: 80 },
  { name: 'Node.js', icon: FaNode, level: 85 },
  { name: 'MongoDB', icon: SiMongodb, level: 75 },
  { name: 'TypeScript', icon: SiTypescript, level: 70 },
  { name: 'Git', icon: FaGitAlt, level: 88 },
  { name: 'Figma', icon: FaFigma, level: 65 },
];

const Skills = () => {
  return (
    <section
      id="skills"
      className="relative w-full min-h-screen bg-gradient-to-tr from-black via-gray-900 to-gray-950 text-white py-20 px-4"
    >
      <motion.h2
        className="text-4xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        My Skills
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {skills.map((skill, i) => {
          const Icon = skill.icon;
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl hover:scale-105 transition-transform shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 + i * 0.1 }}
              viewport={{ once: true }}
            >
              <Icon className="text-4xl text-blue-400 mb-2" />
              <h4 className="text-lg font-semibold text-gray-200">{skill.name}</h4>
              <div className="w-full mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  transition={{ duration: 1 + i * 0.1 }}
                />
              </div>
              <p className="text-sm mt-1 text-gray-400">{skill.level}%</p>
            </motion.div>
          );
        })}
      </div>

      {/* Fancy glowing background */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1.6 }}
        transition={{ duration: 6, ease: 'easeOut' }}
        style={{ left: '-10%', top: '20%' }}
      />
    </section>
  );
};

export default Skills;
