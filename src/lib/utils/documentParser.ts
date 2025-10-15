import mammoth from 'mammoth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface ParsedDocument {
  html: string;
  images: string[];
  title: string;
  excerpt: string;
}

// Upload image to S3
async function uploadImageToS3(
  imageBuffer: Buffer,
  imageName: string
): Promise<string> {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      console.warn('⚠️ AWS credentials not configured, skipping image upload');
      return ''; // Return empty string if AWS not configured
    }

    const timestamp = Date.now();
    const filename = `imported-images/${timestamp}-${imageName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: imageBuffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
    console.log('✅ Image uploaded to S3:', url);
    return url;
  } catch (error) {
    console.error('❌ Error uploading image to S3:', error);
    return ''; // Return empty string on error, don't fail the whole import
  }
}

// Post-process HTML to improve formatting and table support
function postProcessWordHtml(html: string): string {
  // Convert text alignment classes to TiptapEditor-compatible format
  html = html.replace(/class="text-center"/g, 'style="text-align: center"');
  html = html.replace(/class="text-right"/g, 'style="text-align: right"');
  html = html.replace(/class="text-justify"/g, 'style="text-align: justify"');
  html = html.replace(/class="text-left"/g, 'style="text-align: left"');

  // Improve table formatting - add basic styling for better display
  html = html.replace(/<table[^>]*>/g, '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;">');
  html = html.replace(/<td[^>]*>/g, '<td style="border: 1px solid #ddd; padding: 8px;">');
  html = html.replace(/<th[^>]*>/g, '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; font-weight: bold;">');

  // Preserve line breaks and spacing
  html = html.replace(/\r?\n/g, ' ');
  html = html.replace(/\s+/g, ' ');

  // Fix nested formatting issues
  html = html.replace(/<p>\s*<\/p>/g, '<br>'); // Replace empty paragraphs with breaks
  
  // Ensure images have proper styling
  html = html.replace(/<img([^>]*)>/g, '<img$1 style="max-width: 100%; height: auto; display: block; margin: 1em 0;">');

  // Preserve blockquotes formatting
  html = html.replace(/<blockquote[^>]*>/g, '<blockquote style="margin: 1em 0; padding: 0 1em; border-left: 4px solid #ddd; font-style: italic;">');

  return html.trim();
}

// Parse Word Document (.docx)
export async function parseWordDocument(
  buffer: Buffer
): Promise<ParsedDocument> {
  try {
    const imageMap: Map<string, string> = new Map();
    let imageCounter = 0;

    const result = await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          try {
            const imageBuffer = await image.read();
            const imageName = `image-${imageCounter++}.png`;
            const imageUrl = await uploadImageToS3(imageBuffer, imageName);
            
            if (imageUrl) {
              imageMap.set(imageName, imageUrl);
              return { src: imageUrl };
            } else {
              console.warn('⚠️ Image upload failed or AWS not configured, skipping image');
              return { src: '' }; // Skip image if upload fails
            }
          } catch (error) {
            console.error('❌ Error processing image:', error);
            return { src: '' };
          }
        }),
        styleMap: [
          // Headings
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p[style-name='Title'] => h1:fresh",
          
          // Text formatting
          "b => strong",
          "i => em",
          "u => u",
          "strike => s",
          
          // Text alignment - preserve alignment information
          "p[style-name='Center'] => p.text-center",
          "p[style-name='Right'] => p.text-right", 
          "p[style-name='Justify'] => p.text-justify",
          
          // Lists
          "p[style-name='List Paragraph'] => li:fresh",
          
          // Tables - preserve table structure
          "table => table",
          "tr => tr", 
          "td => td",
          "th => th",
          
          // Preserve some common Word styles
          "p[style-name='Quote'] => blockquote > p:fresh",
          "p[style-name='Intense Quote'] => blockquote > p:fresh",
          "p[style-name='Caption'] => figcaption:fresh",
          
          // Code blocks
          "p[style-name='Code'] => pre:fresh",
          "span[style-name='Code'] => code",
        ],
        
        // Include table processing
        includeDefaultStyleMap: true,
      }
    );

    let html = result.value;

    // Post-process HTML to improve table and formatting support
    html = postProcessWordHtml(html);

    // Extract title (first h1 or first paragraph)
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, '')
      : 'Imported Document';

    // Remove title from content if found
    if (titleMatch) {
      html = html.replace(titleMatch[0], '');
    }

    // Extract excerpt (first paragraph)
    const excerptMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
    const excerpt = excerptMatch
      ? excerptMatch[1].replace(/<[^>]*>/g, '').substring(0, 200)
      : '';

    // Clean up HTML
    html = html
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim();

    return {
      html,
      images: Array.from(imageMap.values()),
      title,
      excerpt,
    };
  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error('Failed to parse Word document');
  }
}

// Parse PDF Document - Temporarily disabled due to build issues
export async function parsePDFDocument(
  buffer: Buffer
): Promise<ParsedDocument> {
  // Temporarily disable PDF parsing due to ESM compatibility issues with pdf-parse
  throw new Error('PDF parsing is temporarily unavailable. Please upload a Word document (.docx) instead, or convert your PDF to .docx format first.');
}