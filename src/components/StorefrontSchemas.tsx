import React, { useEffect } from 'react';

interface StorefrontSchemasProps {
  referenceType?: 'global' | 'product' | 'collection' | 'page';
  referenceId?: string;
}

export const StorefrontSchemas: React.FC<StorefrontSchemasProps> = ({
  referenceType = 'global',
  referenceId = 'global'
}) => {
  useEffect(() => {
    let isMounted = true;

    const fetchAndInjectSchemas = async () => {
      try {
        const url = `/api/schemas/public?referenceType=${encodeURIComponent(referenceType)}&referenceId=${encodeURIComponent(referenceId)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.schemas) return;

        // Remove existing injected dynamic schemas
        const existingTags = document.querySelectorAll('script[data-laam-schema="true"]');
        existingTags.forEach(tag => tag.remove());

        // Deduplication & precedence logic
        // If a specific record schema (product, collection, page) exists, it takes precedence over global schema of the same @type
        const seenTypes = new Set<string>();
        const uniqueSchemas: any[] = [];

        // Sort so that specific record schemas come first (precedence)
        const sorted = [...data.schemas].sort((a, b) => {
          if (a.referenceType !== 'global' && b.referenceType === 'global') return -1;
          if (a.referenceType === 'global' && b.referenceType !== 'global') return 1;
          return 0;
        });

        for (const item of sorted) {
          if (!item.isEnabled || !item.jsonContent) continue;
          try {
            const parsed = JSON.parse(item.jsonContent);
            const schemaType = parsed['@type'] || item.schemaType || 'Thing';
            
            // Duplicate prevention across global and specific scopes
            if (seenTypes.has(schemaType) && item.referenceType === 'global') {
              // Skip global duplicate if specific already added
              continue;
            }
            seenTypes.add(schemaType);
            uniqueSchemas.push(item.jsonContent);
          } catch {
            // If raw json string is invalid, push as is if no parse error
            uniqueSchemas.push(item.jsonContent);
          }
        }

        // Inject into document.head
        uniqueSchemas.forEach((jsonStr, index) => {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-laam-schema', 'true');
          script.setAttribute('data-schema-index', String(index));
          script.text = jsonStr;
          document.head.appendChild(script);
        });
      } catch (err) {
        console.error('Failed to load storefront schemas:', err);
      }
    };

    fetchAndInjectSchemas();

    return () => {
      isMounted = false;
      const existingTags = document.querySelectorAll('script[data-laam-schema="true"]');
      existingTags.forEach(tag => tag.remove());
    };
  }, [referenceType, referenceId]);

  return null;
};
