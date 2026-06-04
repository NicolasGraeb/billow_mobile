import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Alert, FlatList, Dimensions } from 'react-native';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EventList from '@/components/events/EventList';
import FriendRequestsModal from '@/components/modals/FriendRequestsModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import FriendsListModal from '@/components/modals/FriendsListModal';
import { useProfile } from '@/hooks/auth/useProfile';
import { useMyEvents } from '@/hooks/events/useMyEvents';
import { useUploadAvatar } from '@/hooks/media/useUploadAvatar';

export default function Profile() {
  const { logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const { profile, loading, error, refetch: refetchProfile } = useProfile();
  const { events, loading: eventsLoading } = useMyEvents();
  const { pickAndUpload, uploading: avatarUploading } = useUploadAvatar();

  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    router.replace('/(auth)/login');
  };

  if (error && !profile) {
    Alert.alert('Błąd', error);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nie udało się załadować profilu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <ProfileHeader 
              username={profile.username} 
              email={profile.email} 
              friendsCount={profile.friends_count || 0}
              avatarUrl={profile.avatar_url}
              onAvatarPress={() => void pickAndUpload()}
              avatarUploading={avatarUploading}
              onRequestsPress={() => setShowRequestsModal(true)}
              onLogoutPress={() => setShowLogoutModal(true)}
              onFriendsCountPress={() => setShowFriendsModal(true)}
            />
            <EventList events={events} loading={eventsLoading} />
          </>
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: (isSmallScreen ? 55 : 60) + insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />
      <FriendRequestsModal
        visible={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        onFriendAccepted={() => void refetchProfile()}
      />
      <LogoutConfirmModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      <FriendsListModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        currentUserId={profile.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  content: {
    paddingBottom: 20,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#A7B0C0',
    fontSize: 16,
  },
});
