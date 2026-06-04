import { View, Text, StyleSheet, Platform, Dimensions, ActivityIndicator } from 'react-native';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/components/common/UserAvatar';

interface ProfileHeaderProps {
  username: string;
  email: string;
  friendsCount: number;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
  avatarUploading?: boolean;
  onRequestsPress?: () => void;
  onLogoutPress?: () => void;
  onFriendsCountPress?: () => void;
}

export default function ProfileHeader({
  username,
  email,
  friendsCount,
  avatarUrl,
  onAvatarPress,
  avatarUploading,
  onRequestsPress,
  onLogoutPress,
  onFriendsCountPress,
}: ProfileHeaderProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;

  const containerStyle = [
    styles.container,
    {
      marginHorizontal: isSmallScreen ? 16 : 20,
      marginTop: isSmallScreen ? 16 : 20,
    },
  ];

  const contentStyle = [
    styles.content,
    {
      paddingVertical: isSmallScreen ? 20 : isLargeScreen ? 28 : 24,
      paddingHorizontal: isSmallScreen ? 16 : 20,
    },
  ];

  return (
    <View style={containerStyle}>
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Platform.OS === 'android' 
              ? 'rgba(10,9,6,0.5)' 
              : 'rgba(10,9,6,0.35)',
          },
        ]}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 20,
          },
        ]}
      />

      <View style={contentStyle}>
        {onLogoutPress && (
          <AnimatedPressable
            style={styles.logoutButton}
            onPress={onLogoutPress}
          >
            <Ionicons 
              name="log-out-outline" 
              size={isSmallScreen ? 22 : 24} 
              color="#EF4444" 
            />
          </AnimatedPressable>
        )}
        <AnimatedPressable
          onPress={onAvatarPress}
          disabled={!onAvatarPress || avatarUploading}
          style={styles.avatarWrap}
        >
          <UserAvatar size={isLargeScreen ? 88 : isSmallScreen ? 72 : 80} imageUrl={avatarUrl} showMargin={false} />
          {avatarUploading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#FFB90D" />
            </View>
          )}
          {onAvatarPress && !avatarUploading && (
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color="#0A0906" />
            </View>
          )}
        </AnimatedPressable>
        <Text 
          style={[
            styles.username,
            {
              fontSize: isSmallScreen ? 20 : isLargeScreen ? 26 : 22,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {username}
        </Text>
        <Text 
          style={[
            styles.email,
            {
              fontSize: isSmallScreen ? 13 : 14,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {email}
        </Text>
        <View style={styles.statsRow}>
          <AnimatedPressable 
            style={styles.statsContainer}
            onPress={onFriendsCountPress}
            disabled={!onFriendsCountPress}
          >
            <Text style={[
              styles.statValue,
              {
                fontSize: isSmallScreen ? 16 : isLargeScreen ? 20 : 18,
              },
            ]}>{friendsCount}</Text>
            <Text style={[
              styles.statLabel,
              {
                fontSize: isSmallScreen ? 11 : 12,
              },
            ]}>Znajomi</Text>
          </AnimatedPressable>
          {onRequestsPress && (
            <AnimatedPressable
              style={styles.requestsButton}
              onPress={onRequestsPress}
            >
              <Ionicons 
                name="mail-outline" 
                size={isSmallScreen ? 16 : 18} 
                color="#FFB90D" 
              />
              <Text style={[
                styles.requestsButtonText,
                {
                  fontSize: isSmallScreen ? 11 : 12,
                },
              ]}>Oczekujące</Text>
            </AnimatedPressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
  },
  avatarWrap: {
    marginBottom: 8,
    position: 'relative',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 9, 6, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFB90D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0E0A',
  },
  logoutButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#E5E7EB',
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  email: {
    color: '#A7B0C0',
    textAlign: 'center',
    width: '100%',
  },
  statsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  statsContainer: {
    alignItems: 'center',
    gap: 2,
    minWidth: 60,
  },
  statValue: {
    color: '#E5E7EB',
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    color: '#A7B0C0',
    textAlign: 'center',
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 185, 13, 0.2)',
  },
  requestsButtonText: {
    color: '#FFB90D',
    fontWeight: '600',
  },
});

