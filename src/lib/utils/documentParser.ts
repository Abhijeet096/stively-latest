import mammoth from 'mammoth';
const pdfParse = require('pdf-parse');
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
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1:fresh",
          "b => strong",
          "i => em",
          "u => u",
        ],
      }
    );

    let html = result.value;

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

// Parse PDF Document
export async function parsePDFDocument(
  buffer: Buffer
): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;

    // Convert plain text to HTML with basic formatting
    const lines = text.split('\n').filter((line: string) => line.trim());
    let html = '';
    let title = '';

    lines.forEach((line: string, index: number) => {
      const trimmedLine = line.trim();
      
      if (index === 0 && trimmedLine.length < 100) {
        // First line as title
        title = trimmedLine;
        html += `<h1>${trimmedLine}</h1>\n`;
      } else if (trimmedLine.length < 50 && /^[A-Z]/.test(trimmedLine)) {
        // Short lines starting with capital - likely headings
        html += `<h2>${trimmedLine}</h2>\n`;
      } else if (trimmedLine) {
        // Regular paragraphs
        html += `<p>${trimmedLine}</p>\n`;
      }
    });

    const excerpt = lines
      .slice(1, 3)
      .join(' ')
      .substring(0, 200);

    return {
      html,
      images: [],
      title: title || 'Imported PDF',
      excerpt,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
}