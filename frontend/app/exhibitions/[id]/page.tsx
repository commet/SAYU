import { Metadata } from 'next';
import ExhibitionDetailClient from './ExhibitionDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch exhibition data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sayu.my';
    const response = await fetch(`${baseUrl}/api/exhibitions/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        title: '전시 정보 | SAYU',
        description: 'SAYU에서 전시 정보를 확인하세요.',
      };
    }

    const result = await response.json();
    const exhibition = result.data;

    if (!exhibition) {
      return {
        title: '전시 정보 | SAYU',
        description: 'SAYU에서 전시 정보를 확인하세요.',
      };
    }

    const title = `${exhibition.title} | ${exhibition.venue} | SAYU`;
    const description = exhibition.description?.slice(0, 160) ||
      `${exhibition.venue}에서 진행하는 "${exhibition.title}" 전시 정보를 확인하세요.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://www.sayu.my/exhibitions/${id}`,
        images: exhibition.image ? [
          {
            url: exhibition.image,
            width: 1200,
            height: 630,
            alt: exhibition.title,
          }
        ] : [],
        siteName: 'SAYU',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: exhibition.image ? [exhibition.image] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '전시 정보 | SAYU',
      description: 'SAYU에서 전시 정보를 확인하세요.',
    };
  }
}

export default async function ExhibitionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ExhibitionDetailClient id={id} />;
}
