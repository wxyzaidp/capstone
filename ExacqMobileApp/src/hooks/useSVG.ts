import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';

/**
 * Custom hook to load SVG file content as string
 * @param assetModule The SVG asset module (require path)
 * @returns SVG content as string
 */
export const useSVG = (assetModule: any): string | null => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        // Get the asset info
        const asset = Asset.fromModule(assetModule);
        // Ensure the asset is downloaded
        await asset.downloadAsync();
        
        // Fetch the SVG content
        const response = await fetch(asset.localUri || '');
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error('Failed to load SVG:', error);
        setSvgContent(null);
      }
    };

    loadSVG();
  }, [assetModule]);

  return svgContent;
}; 