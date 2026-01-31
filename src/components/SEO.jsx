import React from "react";
import { Helmet } from "react-helmet-async";

function SEO({ 
    title, 
    description, 
    image, 
    url, 
    type = "website", 
    author = "MegaBlog Team", 
    publishedTime 
}) {
  const siteName = "MegaBlog";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  const rawDescription = String(description || "");
  const metaDescription = rawDescription.trim() !== "" 
      ? rawDescription.substring(0, 160) 
      : "A community for writers and readers to share ideas.";

  const metaImage = image || "/icons/logo.png"; 
  const metaUrl = url || window.location.href;

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "BlogPosting" : "WebSite",
    "headline": fullTitle,
    "description": metaDescription,
    "image": metaImage,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/icons/logo.png`
      }
    },
    "datePublished": publishedTime || new Date().toISOString(),
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": metaUrl
    }
  };

  return (
    <Helmet>
      {/* 1. Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} key="desc" />
      <link rel="canonical" href={metaUrl} />
      <meta name="author" content={author} />

      {/* 2. Social Media Tags (Open Graph) */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} key="og:title" />
      <meta property="og:description" content={metaDescription} key="og:desc" />
      <meta property="og:image" content={metaImage} key="og:image" />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />

      {/* 3. Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* 4. Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}

export default SEO;