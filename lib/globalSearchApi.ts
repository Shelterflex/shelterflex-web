import { searchProperties } from "@/lib/propertiesApi"
import { apiGet, withQuery } from "@/lib/apiClient"

export interface SearchResult {
  id: string
  type: "property" | "document"
  title: string
  subtitle: string
  href: string
}

export interface GroupedResults {
  label: string
  results: SearchResult[]
}

async function searchPropertiesApi(query: string): Promise<SearchResult[]> {
  try {
    const res = await searchProperties({ query, pageSize: 5 })
    return (res.data ?? []).map((p) => ({
      id: p.listingId,
      type: "property" as const,
      title: p.address,
      subtitle: [p.city, p.area, `${p.bedrooms} bed, ${p.bathrooms} bath`]
        .filter(Boolean)
        .join(" - "),
      href: `/properties/${p.listingId}`,
    }))
  } catch {
    return []
  }
}

async function searchDocumentsApi(query: string): Promise<SearchResult[]> {
  try {
    const path = withQuery("/api/tenant/vault", {
      search: query,
      pageSize: 5,
    })
    const res = await apiGet<{
      data?: Array<{ id: string; fileName: string; category: string }>
    }>(path)
    return (res.data ?? []).map((d) => ({
      id: d.id,
      type: "document" as const,
      title: d.fileName,
      subtitle: d.category,
      href: `/dashboard/tenant/vault`,
    }))
  } catch {
    return []
  }
}

export async function globalSearch(
  query: string,
  isAuthenticated: boolean,
): Promise<GroupedResults[]> {
  if (!query.trim()) return []

  const groups: GroupedResults[] = []

  const properties = await searchPropertiesApi(query)
  if (properties.length > 0) {
    groups.push({ label: "Properties", results: properties })
  }

  if (isAuthenticated) {
    const documents = await searchDocumentsApi(query)
    if (documents.length > 0) groups.push({ label: "Documents", results: documents })
  }

  return groups
}
