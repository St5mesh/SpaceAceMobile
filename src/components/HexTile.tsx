import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sector, SectorType } from '../types';
import { getSectorAsset, BACK_CARD, BLANK_CARD } from '../data/sectorAssets';

interface HexTileProps {
  sector: Sector;
  size: number;
  isCurrentSector: boolean;
  onPress: (sector: Sector) => void;
  showCoordinates?: boolean;
}

const HexTile: React.FC<HexTileProps> = ({
  sector,
  size,
  isCurrentSector,
  onPress,
  showCoordinates = false,
}) => {
  const sectorAsset = getSectorAsset(sector.name);
  
  // Determine which image to show
  const getImageSource = () => {
    if (!sector.discoveredAt) {
      // Show back card for undiscovered sectors
      return require('../../assets/Hex Cards Formatted/!Back.png');
    }
    
    if (sectorAsset) {
      // Map known sector names to their images
      const imageMap: Record<string, any> = {
        'Antilae.png': require('../../assets/Hex Cards Formatted/Antilae.png'),
        'Arrak.png': require('../../assets/Hex Cards Formatted/Arrak.png'),
        'Asimov.png': require('../../assets/Hex Cards Formatted/Asimov.png'),
        'Bandor.png': require('../../assets/Hex Cards Formatted/Bandor.png'),
        'Beez.png': require('../../assets/Hex Cards Formatted/Beez.png'),
        'Bloom.png': require('../../assets/Hex Cards Formatted/Bloom.png'),
        'Corsair.png': require('../../assets/Hex Cards Formatted/Corsair.png'),
        'Douglas.png': require('../../assets/Hex Cards Formatted/Douglas.png'),
        'Efflux.png': require('../../assets/Hex Cards Formatted/Efflux.png'),
        'Eidolon.png': require('../../assets/Hex Cards Formatted/Eidolon.png'),
        'Fluffulon.png': require('../../assets/Hex Cards Formatted/Fluffulon.png'),
        'Frigus.png': require('../../assets/Hex Cards Formatted/Frigus.png'),
        'Gazer.png': require('../../assets/Hex Cards Formatted/Gazer.png'),
        'Gemma.png': require('../../assets/Hex Cards Formatted/Gemma.png'),
        'Glorp.png': require('../../assets/Hex Cards Formatted/Glorp.png'),
        'Hondo.png': require('../../assets/Hex Cards Formatted/Hondo.png'),
        'Hope.png': require('../../assets/Hex Cards Formatted/Hope.png'),
        'Ionos.png': require('../../assets/Hex Cards Formatted/Ionos.png'),
        'Jurassi.png': require('../../assets/Hex Cards Formatted/Jurassi.png'),
        'Lanai.png': require('../../assets/Hex Cards Formatted/Lanai.png'),
        'Lumina.png': require('../../assets/Hex Cards Formatted/Lumina.png'),
        'Lupin.png': require('../../assets/Hex Cards Formatted/Lupin.png'),
        'Maelstro.png': require('../../assets/Hex Cards Formatted/Maelstro.png'),
        'Magrath.png': require('../../assets/Hex Cards Formatted/Magrath.png'),
        'Malalo.png': require('../../assets/Hex Cards Formatted/Malalo.png'),
        'Revati.png': require('../../assets/Hex Cards Formatted/Revati.png'),
        'Rukbat.png': require('../../assets/Hex Cards Formatted/Rukbat.png'),
        'Scintilla.png': require('../../assets/Hex Cards Formatted/Scintilla.png'),
        'Snacc.png': require('../../assets/Hex Cards Formatted/Snacc.png'),
        'Snodd.png': require('../../assets/Hex Cards Formatted/Snodd.png'),
        'Solaris.png': require('../../assets/Hex Cards Formatted/Solaris.png'),
        'Toblero.png': require('../../assets/Hex Cards Formatted/Toblero.png'),
        'Tyranus.png': require('../../assets/Hex Cards Formatted/Tyranus.png'),
        'Vanta.png': require('../../assets/Hex Cards Formatted/Vanta.png'),
        'Vega.png': require('../../assets/Hex Cards Formatted/Vega.png'),
        'Viridis.png': require('../../assets/Hex Cards Formatted/Viridis.png'),
        'Wolfram.png': require('../../assets/Hex Cards Formatted/Wolfram.png'),
        'Xinti.png': require('../../assets/Hex Cards Formatted/Xinti.png'),
      };
      
      return imageMap[sectorAsset.imageName] || require('../../assets/Hex Cards Formatted/!Blank.png');
    }
    
    // Fallback for unknown sectors
    return require('../../assets/Hex Cards Formatted/!Blank.png');
  };

  const getBorderColor = () => {
    if (isCurrentSector) return '#007AFF';
    if (sector.isDangerous) return '#DC3545';
    
    switch (sector.type) {
      case SectorType.CIVILIZED:
        return '#28A745';
      case SectorType.FRONTIER:
        return '#FFC107';
      case SectorType.DANGEROUS:
        return '#DC3545';
      case SectorType.ANOMALY:
        return '#6F42C1';
      default:
        return '#6C757D';
    }
  };

  const hexStyle = {
    width: size,
    height: size * 0.87, // Proper hex height ratio
    borderRadius: size * 0.1,
  };

  const overlayStyle = {
    ...hexStyle,
    borderWidth: isCurrentSector ? 3 : 2,
    borderColor: getBorderColor(),
  };

  return (
    <TouchableOpacity
      style={[styles.hexContainer, hexStyle]}
      onPress={() => onPress(sector)}
      activeOpacity={0.7}
    >
      <ImageBackground
        source={getImageSource()}
        style={[styles.hexImage, hexStyle]}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay for borders and current sector highlight */}
        <View style={[styles.hexOverlay, overlayStyle]}>
          {/* Current sector indicator */}
          {isCurrentSector && (
            <View style={styles.currentIndicator}>
              <Ionicons name="location" size={size * 0.15} color="white" />
            </View>
          )}
          
          {/* Danger indicator */}
          {sector.isDangerous && (
            <View style={styles.dangerIndicator}>
              <Ionicons name="warning" size={size * 0.12} color="#DC3545" />
            </View>
          )}
          
          {/* Coordinate display for small tiles or when requested */}
          {(showCoordinates || size < 100) && (
            <View style={styles.coordinatesContainer}>
              <Text style={[styles.coordinatesText, { fontSize: size * 0.08 }]}>
                {sector.hexQ},{sector.hexR}
              </Text>
            </View>
          )}
          
          {/* Sector name for discovered sectors on larger tiles */}
          {sector.discoveredAt && size > 120 && (
            <View style={styles.nameContainer}>
              <Text style={[styles.sectorName, { fontSize: size * 0.1 }]} numberOfLines={2}>
                {sector.name}
              </Text>
            </View>
          )}
          
          {/* Unknown sector overlay */}
          {!sector.discoveredAt && (
            <View style={styles.unknownOverlay}>
              <Ionicons name="help-circle" size={size * 0.2} color="white" />
              <Text style={[styles.unknownText, { fontSize: size * 0.08 }]}>
                Unknown
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hexContainer: {
    margin: 2,
    // Create hexagonal shape with clipping
    transform: [{ rotate: '0deg' }],
  },
  hexImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    borderRadius: 8,
  },
  hexOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  currentIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 2,
  },
  dangerIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  coordinatesText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  nameContainer: {
    position: 'absolute',
    bottom: 8,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: 4,
  },
  sectorName: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  unknownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  unknownText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default HexTile;