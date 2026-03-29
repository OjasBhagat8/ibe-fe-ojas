import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { parseDateParam } from "../../features/search/searchQueryParams";
import { resolveMediaUrl } from "../../features/tenant/mediaUrl";

const DEFAULT_TITLE = "Internet Booking Engine";
const DEFAULT_DESCRIPTION = "Browse properties, compare rooms, and complete your stay booking online.";

const getSiteUrl = () => {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (apiBaseUrl) {
    try {
      return new URL(apiBaseUrl).origin;
    } catch {
      return window.location.origin;
    }
  }

  return window.location.origin;
};

const ensureMetaTag = (key: "name" | "property", value: string) => {
  let tag = document.head.querySelector(`meta[${key}="${value}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(key, value);
    document.head.appendChild(tag);
  }

  return tag;
};

const ensureCanonicalLink = () => {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  return link;
};

const formatShareDate = (value: string | null) => {
  const parsedDate = parseDateParam(value);
  if (!parsedDate) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const PageMetadata = () => {
  const location = useLocation();
  const tenant = useAppSelector((state) => state.tenant.data);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const propertyId = searchParams.get("propertyId");
    const property = tenant?.properties.find((item) => item.propertyId === propertyId);
    const checkInLabel = formatShareDate(searchParams.get("checkIn"));
    const checkOutLabel = formatShareDate(searchParams.get("checkOut"));
    const tenantName = tenant?.tenantName?.trim() || DEFAULT_TITLE;
    const siteUrl = getSiteUrl();
    const image = resolveMediaUrl(tenant?.tenantBanner)
      || resolveMediaUrl(tenant?.tenantLogo)
      || `${siteUrl}/og-default.png`;
    const url = `${siteUrl}${location.pathname}${location.search}`;

    let title = `${tenantName} Internet Booking Engine`;
    let description = `Browse available stays and book online with ${tenantName}.`;

    if (location.pathname.endsWith("/room-results")) {
      const propertyName = property?.propertyName?.trim() || "selected property";

      if (checkInLabel && checkOutLabel) {
        title = `${propertyName} rooms | ${tenantName}`;
        description = `View available rooms at ${propertyName} from ${checkInLabel} to ${checkOutLabel}.`;
      } else {
        title = `${propertyName} room search | ${tenantName}`;
        description = `Explore room availability and rates at ${propertyName}.`;
      }
    } else if (location.pathname.endsWith("/checkout")) {
      title = `Checkout | ${tenantName}`;
      description = `Complete your booking with ${tenantName}.`;
    } else if (location.pathname.endsWith("/confirmation")) {
      title = `Booking confirmation | ${tenantName}`;
      description = `Review your booking confirmation from ${tenantName}.`;
    }

    document.title = title || DEFAULT_TITLE;

    ensureMetaTag("name", "description").setAttribute("content", description || DEFAULT_DESCRIPTION);
    ensureMetaTag("property", "og:type").setAttribute("content", "website");
    ensureMetaTag("property", "og:site_name").setAttribute("content", tenantName || DEFAULT_TITLE);
    ensureMetaTag("property", "og:title").setAttribute("content", title || DEFAULT_TITLE);
    ensureMetaTag("property", "og:description").setAttribute("content", description || DEFAULT_DESCRIPTION);
    ensureMetaTag("property", "og:image").setAttribute("content", image);
    ensureMetaTag("property", "og:image:alt").setAttribute("content", `${tenantName} preview image`);
    ensureMetaTag("property", "og:url").setAttribute("content", url);
    ensureMetaTag("name", "twitter:card").setAttribute("content", "summary_large_image");
    ensureMetaTag("name", "twitter:title").setAttribute("content", title || DEFAULT_TITLE);
    ensureMetaTag("name", "twitter:description").setAttribute("content", description || DEFAULT_DESCRIPTION);
    ensureMetaTag("name", "twitter:image").setAttribute("content", image);
    ensureCanonicalLink().setAttribute("href", url);
  }, [location.pathname, location.search, tenant]);

  return null;
};

export default PageMetadata;
