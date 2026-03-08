# Video Avatar Setup Instructions

## Quick Setup

The AnimatedAvatar component has been updated to use your video files instead of SVG graphics.

### Step 1: Add Your Video Files

Copy your three video files to: `jan-sahayak/src/assets/videos/`

Required files:
- `Video_Generation_Request_Fulfilled (2).mp4` (thinking gesture)
- `Video_Generation_For_Happiness (1).mp4` (happy gesture)
- `Video_Generation_Confirmation.mp4` (confirmation gesture)

### Step 2: Test the Avatar

Run the development server:
```bash
cd jan-sahayak
npm run dev
```

### Step 3: Verify States

The avatar will automatically show different videos based on state:

- **Thinking** → Shows thinking video
- **Happy/Greeting** → Shows happiness video
- **Idle/Speaking/Confused** → Shows confirmation video

## What Changed

✅ Replaced SVG avatar with video-based avatar
✅ Added automatic video switching based on state
✅ Videos loop continuously for smooth animation
✅ Maintained all existing features (speech synthesis, speech bubble, replay button)
✅ Kept state-based border animations

## Troubleshooting

**Videos not showing?**
- Ensure video files are in `src/assets/videos/` directory
- Check that filenames match exactly (including spaces and parentheses)
- Verify videos are in MP4 format

**Videos not playing?**
- Check browser console for errors
- Ensure videos are not corrupted
- Try refreshing the page

**Performance issues?**
- Compress videos to under 5MB each
- Use H.264 codec for better browser compatibility
- Reduce video resolution if needed

## Next Steps

1. Copy your video files to the videos directory
2. Test the avatar in different states
3. Adjust video quality/size if needed for performance
