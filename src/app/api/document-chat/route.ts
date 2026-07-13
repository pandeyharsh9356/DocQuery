import { Groq } from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import pdf from 'pdf-parse';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured.');
  return new Groq({ apiKey });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Backend ko mila:", body);
    const { question, documentId, context: bodyContext } = body;

    if (!question) {
      return Response.json({ error: 'Question is required.' }, { status: 400 });
    }

    let context = bodyContext || '';

    if (!context && documentId) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!doc) {
        return Response.json({ error: 'Document not found in database.' }, { status: 404 });
      }

      if (doc.textContent) {
        context = doc.textContent;
      } else {
        // Fallback: parse PDF from disk dynamically
        const pdfPath = path.join(process.cwd(), 'public', 'uploads', doc.fileKey);
        if (fs.existsSync(pdfPath)) {
          console.log(`Dynamically parsing PDF for existing document ${documentId}...`);
          const dataBuffer = fs.readFileSync(pdfPath);
          const parsed = await pdf(dataBuffer);
          context = parsed.text || '';
          
          // Cache the text content in the database
          await prisma.document.update({
            where: { id: documentId },
            data: { textContent: context },
          });
        } else {
          console.error(`PDF file not found on disk at: ${pdfPath}`);
        }
      }
    }

    // TEMPORARY FIX: Truncate context to a maximum of 4000 characters to prevent rate_limit_exceeded (TPM limits) on Groq.
    const truncatedContext = context.length > 4000 ? context.slice(0, 4000) + '... [content truncated]' : context;

    // Grounding prompt with the retrieved context
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert document assistant. Answer the user's question based ONLY on the following PDF content: "${truncatedContext}". If the answer is not in the content or if the PDF text is empty, answer that you cannot find the answer in the uploaded PDF. Do not say that the PDF is not attached.`,
        },
        { role: 'user', content: question },
      ],
    });

    const answer = chatCompletion.choices[0]?.message?.content ?? 'No response returned.';
    return Response.json({ answer }, { status: 200 });

  } catch (error) {
    console.error('Document-chat route error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to fetch response' }, { status: 500 });
  }
}
