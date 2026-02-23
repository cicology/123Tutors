import { useEffect } from "react";

const DEFAULT_TITLE = "123Tutors Platform";
const DEFAULT_DESCRIPTION =
  "Find tutors, manage lessons, and run student, tutor, and admin workflows on 123Tutors.";

function ensureMeta(name, attr = "name") {
  const selector = `meta[${attr}="${name}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  return element;
}

export default function Seo({ title, description, noIndex = false }) {
  useEffect(() => {
    const nextTitle = title ? `${title} | 123Tutors` : DEFAULT_TITLE;
    const nextDescription = description || DEFAULT_DESCRIPTION;
    const currentUrl = window.location.href;

    document.title = nextTitle;
    ensureMeta("description").setAttribute("content", nextDescription);
    ensureMeta("og:title", "property").setAttribute("content", nextTitle);
    ensureMeta("og:description", "property").setAttribute("content", nextDescription);
    ensureMeta("og:type", "property").setAttribute("content", "website");
    ensureMeta("og:url", "property").setAttribute("content", currentUrl);
    ensureMeta("twitter:card", "name").setAttribute("content", "summary_large_image");
    ensureMeta("twitter:title", "name").setAttribute("content", nextTitle);
    ensureMeta("twitter:description", "name").setAttribute("content", nextDescription);
    ensureMeta("robots", "name").setAttribute(
      "content",
      noIndex ? "noindex, nofollow" : "index, follow",
    );

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);
  }, [title, description, noIndex]);

  return null;
}

