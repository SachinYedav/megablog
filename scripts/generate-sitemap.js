import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Client, Databases, Query } from 'node-appwrite';
import confNode from '../src/conf/conf-node.js';

// ==================================================================
//  CONFIGURATION 
// ==================================================================
const DOMAIN = 'https://megablog.com'; 

async function generateSitemap() {
  console.log("🗺️  Starting Sitemap Generation...");

  if (!confNode.appwriteUrl || !confNode.appwriteProjectId) {
      console.error("❌ CRITICAL ERROR: Appwrite Configuration missing. Check .env file.");
      process.exit(1); 
  }

  try {
    // ==============================================================
    // STEP 1: DEFINE STATIC ROUTES
    // ==============================================================
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/all-posts', changefreq: 'daily', priority: 0.9 },
      { url: '/download', changefreq: 'monthly', priority: 0.8 },
      { url: '/help', changefreq: 'monthly', priority: 0.7 },
      
    ];

    // ==============================================================
    // STEP 2: FETCH DYNAMIC POSTS (FROM APPWRITE)
    // ==============================================================
    console.log("📡 Connecting to Appwrite Database...");

    const client = new Client()
        .setEndpoint(confNode.appwriteUrl)
        .setProject(confNode.appwriteProjectId);
    
    const databases = new Databases(client);

    const response = await databases.listDocuments(
        confNode.appwriteDatabaseId,
        confNode.appwriteCollectionId,
        [
            Query.equal('status', 'active'), 
            Query.limit(1000)                
        ]
    );

    if (response.documents) {
      console.log(`✅ Success: Found ${response.documents.length} active posts.`);
      
      response.documents.forEach((post) => {
        links.push({
          url: `/post/${post.slug || post.$id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: post.$updatedAt 
        });
      });
    }

    // ==============================================================
    // STEP 3: GENERATE XML & SAVE
    // ==============================================================
    const stream = new SitemapStream({ hostname: DOMAIN });
    const xmlString = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );

    const publicDir = './public';
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xmlString);
    
    console.log("🎉 Sitemap generated successfully at ./public/sitemap.xml");

  } catch (error) {
    console.error("❌ SITEMAP GENERATION FAILED:", error.message);
  }
}

generateSitemap();