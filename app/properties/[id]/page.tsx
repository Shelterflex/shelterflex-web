import type { Metadata } from "next";
import { getProperty } from "@/lib/propertiesApi";
import PropertyDetailClient from "./PropertyDetailClient";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const defaultTitle = "Property Details | ShelterFlex";
const defaultDescription =
  "Explore verified property details, amenities, and neighborhood context on ShelterFlex.";

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await getProperty(id);
    const property = response.data;

    const title = `${property.address} - ${property.city || "Nigeria"} | ShelterFlex`;
    const description = `Discover ${property.address} in ${property.city || "Nigeria"}, including key details like bedrooms, bathrooms, and pricing.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;

  return <PropertyDetailClient propertyId={id} />;
}
