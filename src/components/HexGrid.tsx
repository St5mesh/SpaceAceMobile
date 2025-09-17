import React, { useState, useCallback, useRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Sector } from '../types';
import { HexUtils } from '../utils/hexUtils';
import HexTile from './HexTile';

interface HexGridProps {
  sectors: Sector[];
  currentSectorId?: string;
  selectedSectorId?: string | null;
  onSectorPress?: (sector: Sector) => void;
  onSectorSelect?: (sector: Sector | null) => void;
  containerWidth: number;
  containerHeight: number;
  initialScale?: number;
  onZoomChange?: (scale: number) => void;
}

const HexGrid = React.forwardRef<any, HexGridProps>(({
  sectors,
  currentSectorId,
  selectedSectorId,
  onSectorPress,
  onSectorSelect,
  containerWidth,
  containerHeight,
  initialScale = 1,
  onZoomChange,
}, ref) => {
  const [scale, setScale] = useState(initialScale);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const baseHexSize = 80;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const newScale = Math.min(scale * 1.2, 4.0);
      setScale(newScale);
      onZoomChange?.(newScale);
    },
    zoomOut: () => {
      const newScale = Math.max(scale / 1.2, 0.3);
      setScale(newScale);
      onZoomChange?.(newScale);
    },
    centerOnCurrentSector,
  }));

  // Handle zoom changes from ScrollView
  const handleZoom = useCallback((event: any) => {
    const newScale = event.nativeEvent.zoomScale;
    setScale(newScale);
    onZoomChange?.(newScale);
  }, [onZoomChange]);

  // Center the view on current sector
  const centerOnCurrentSector = useCallback(() => {
    if (!currentSectorId || !scrollViewRef.current) return;
    
    const currentSector = sectors.find(s => s.id === currentSectorId);
    if (!currentSector) return;

    const hexSize = baseHexSize * scale;
    const pixelPos = HexUtils.hexToPixel(
      { q: currentSector.hexQ, r: currentSector.hexR },
      hexSize / 2
    );

    const centerX = pixelPos.x + containerWidth / 2 - containerWidth / 2;
    const centerY = pixelPos.y + containerHeight / 2 - containerHeight / 2;

    scrollViewRef.current?.scrollTo({
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      animated: true,
    });
  }, [currentSectorId, sectors, scale, containerWidth, containerHeight]);

  const handleSectorPress = useCallback((sector: Sector) => {
    // If selecting is enabled, handle selection
    if (onSectorSelect) {
      if (selectedSectorId === sector.id) {
        onSectorSelect(null); // Deselect if already selected
      } else {
        onSectorSelect(sector);
      }
    } else if (onSectorPress) {
      // Default behavior - navigate to sector
      onSectorPress(sector);
    }
  }, [selectedSectorId, onSectorSelect, onSectorPress]);

  // Calculate hex positions
  const getHexLayout = () => {
    const hexSize = baseHexSize * scale;
    
    return sectors.map((sector) => {
      const pixelPos = HexUtils.hexToPixel(
        { q: sector.hexQ, r: sector.hexR },
        hexSize / 2
      );
      
      return {
        sector,
        x: pixelPos.x + containerWidth / 2,
        y: pixelPos.y + containerHeight / 2,
        size: hexSize,
      };
    });
  };

  const hexLayout = getHexLayout();

  // Calculate content dimensions for ScrollView
  const getContentDimensions = () => {
    if (hexLayout.length === 0) return { width: containerWidth, height: containerHeight };
    
    const xs = hexLayout.map(h => h.x);
    const ys = hexLayout.map(h => h.y);
    const minX = Math.min(...xs) - baseHexSize;
    const maxX = Math.max(...xs) + baseHexSize;
    const minY = Math.min(...ys) - baseHexSize;
    const maxY = Math.max(...ys) + baseHexSize;
    
    return {
      width: Math.max(containerWidth, maxX - minX),
      height: Math.max(containerHeight, maxY - minY),
      offsetX: Math.max(0, -minX),
      offsetY: Math.max(0, -minY),
    };
  };

  const contentDims = getContentDimensions();

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={{
          width: contentDims.width,
          height: contentDims.height,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        bouncesZoom={true}
        minimumZoomScale={0.3}
        maximumZoomScale={4.0}
        zoomScale={scale}
        centerContent={true}
        decelerationRate="normal"
      >
        <View style={[styles.hexGridContainer]}>
          {hexLayout.map(({ sector, x, y, size }) => (
            <View
              key={sector.id}
              style={[
                styles.hexPosition,
                {
                  left: x + (contentDims.offsetX || 0) - size / 2,
                  top: y + (contentDims.offsetY || 0) - size / 2,
                },
              ]}
            >
              <HexTile
                sector={sector}
                size={size}
                isCurrentSector={sector.id === currentSectorId}
                isSelected={sector.id === selectedSectorId}
                onPress={handleSectorPress}
                showCoordinates={scale > 1.5}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#000011', // Deep space background
  },
  scrollContainer: {
    flex: 1,
  },
  hexGridContainer: {
    flex: 1,
    position: 'relative',
  },
  hexPosition: {
    position: 'absolute',
  },
});

export default HexGrid;