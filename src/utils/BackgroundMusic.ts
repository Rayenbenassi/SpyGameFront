import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let backgroundMusic: Sound | null = null;

export const playBackgroundMusic = () => {
  if (backgroundMusic) return; // Avoid double loading

  backgroundMusic = new Sound('bgmusic.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Error loading music:', error);
      return;
    }

    console.log('🎵 Music loaded successfully!');
    backgroundMusic?.setVolume(10);
    backgroundMusic?.setNumberOfLoops(-1); // infinite
    backgroundMusic?.play();
  });
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic.release();
    backgroundMusic = null;
  }
};
