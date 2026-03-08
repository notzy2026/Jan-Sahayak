# Avatar Video Files

This directory contains the video files used for the AnimatedAvatar component.

## Required Files

Please place the following video files in this directory:

1. **Video_Generation_Request_Fulfilled (2).mp4**
   - Used for: Thinking state
   - Shows: Avatar in thinking/processing gesture

2. **Video_Generation_For_Happiness (1).mp4**
   - Used for: Happy state
   - Shows: Avatar with happy gesture

3. **Video_Generation_For_Happiness (2).mp4**
   - Used for: Greeting state
   - Shows: Avatar with welcoming gesture

4. **Video_Generation_Confirmation (1).mp4**
   - Used for: Idle, Speaking, and Confused states
   - Shows: Avatar in confirmation/neutral gesture
   - Note: Audio is muted - only gestures are shown

## Video Specifications

- **Format**: MP4 (H.264 codec recommended)
- **Aspect Ratio**: 5:6 (to match avatar container)
- **File Size**: Keep under 5MB for optimal loading
- **Duration**: 2-5 seconds recommended for smooth looping
- **Resolution**: 400x480 or higher

## How to Add Videos

1. Copy your three video files to this directory
2. Ensure the filenames match exactly as listed above
3. The component will automatically load and display them based on avatar state

## State Mapping

| Avatar State | Video File |
|-------------|------------|
| thinking | Video_Generation_Request_Fulfilled (2).mp4 |
| happy | Video_Generation_For_Happiness (1).mp4 |
| greeting | Video_Generation_For_Happiness (2).mp4 |
| idle | Video_Generation_Confirmation (1).mp4 |
| speaking | Video_Generation_Confirmation (1).mp4 |
| confused | Video_Generation_Confirmation (1).mp4 |

**Note:** All videos are muted by default - only gestures are displayed. Speech synthesis audio is handled separately through the useSpeechSynthesis hook.
