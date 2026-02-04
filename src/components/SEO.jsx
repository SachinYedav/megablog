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
      : "MegaBlog is a community for writers and readers. Read amazing articles on technology, lifestyle, and more.";

  const domain = window.location.origin;
  const metaImage = image ? image : `${domain}/icons/logo.png`; 
  const metaUrl = url || window.location.href;

  // --- Structured Data (JSON-LD) Creation ---
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": domain,
    }
  ];

  if (type === "article") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
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
          "url": `${domain}/icons/logo.png`
        }
      },
      "datePublished": publishedTime || new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": metaUrl
      }
    });
  }

  return (
    <Helmet>
      {/* 1. Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />
      <meta name="author" content={author} />

      {/* 2. Open Graph (WhatsApp / Facebook) - Dynamic */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
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