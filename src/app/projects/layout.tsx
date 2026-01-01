import { ReactNode } from 'react';

interface ProjectsLayoutProps {
  children: ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="projects-layout">
      {children}
    </div>
  );
}