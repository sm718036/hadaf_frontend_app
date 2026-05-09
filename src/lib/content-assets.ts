import aboutStudentImage from "@/assets/about-student.jpg";
import contactAgentImage from "@/assets/contact-agent.jpg";
import franceImage from "@/assets/france.jpg";
import germanyImage from "@/assets/germany.jpg";
import heroStudentsImage from "@/assets/hero-students.jpg";
import italyImage from "@/assets/italy.jpg";
import logoImage from "@/assets/logo.png";
import { API_BASE_URL } from "@/lib/api";

const assetMap: Record<string, string> = {
  "about-student": aboutStudentImage,
  "contact-agent": contactAgentImage,
  france: franceImage,
  germany: germanyImage,
  "hero-students": heroStudentsImage,
  italy: italyImage,
  logo: logoImage,
};

export function resolveContentImage(src: string) {
  if (src.startsWith("/uploads/")) {
    return `${API_BASE_URL}${src}`;
  }

  return assetMap[src] || src;
}

export function resolveSectionHref(href: string, isHome: boolean) {
  if (href.startsWith("#")) {
    return isHome ? href : `/${href}`;
  }

  return href;
}
