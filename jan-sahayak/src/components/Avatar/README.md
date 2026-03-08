# AnimatedAvatar Component

A friendly AI assistant avatar with video-based animated states and multilingual speech synthesis support.

## Features

- **6 Animation States**: idle, speaking, thinking, happy, confused, greeting
- **Video-Based Animations**: Uses real video files for authentic emotional expressions
  - Thinking state: `Video_Generation_Request_Fulfilled (2).mp4`
  - Happy/Greeting state: `Video_Generation_For_Happiness (1).mp4`
  - Idle/Speaking/Confused state: `Video_Generation_Confirmation.mp4`
- **Multilingual Speech Synthesis**: Supports English, Hindi, Gujarati, Kannada, Bengali
- **Lip-Sync Support**: Speech synthesis synced with avatar animations using word boundary events
- **Gender Toggle**: Switch between male/female avatar representation
- **Speech Bubble**: Displays current text (max 80 chars with ellipsis)
- **Replay Button**: Replay the last spoken message
- **State-Based Visual Effects**:
  - Idle: Cream border
  - Speaking: Pulsing saffron ring animation
  - Thinking: Rotating gray dots ring
  - Happy: Green sparkle ring
  - Confused: Amber ring
  - Greeting: Pulsing saffron border

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | string | 'idle' | Current avatar state: 'idle', 'speaking', 'thinking', 'happy', 'confused', 'greeting' |
| `size` | number | 280 | Avatar size in pixels |
| `currentText` | string | '' | Text to display in speech bubble and speak (max 80 chars displayed) |
| `onSpeakingEnd` | function | undefined | Callback when speaking animation completes |
| `gender` | string | 'male' | Initial gender: 'male' or 'female' |
| `autoSpeak` | boolean | false | Automatically speak the currentText when state is 'speaking' |

## Usage

### Basic Usage

```jsx
import AnimatedAvatar from './components/Avatar/AnimatedAvatar'

function MyComponent() {
  return (
    <AnimatedAvatar 
      state="greeting"
      currentText="Welcome to Jan-Sahayak!"
    />
  )
}
```

### With Speech Synthesis

```jsx
import { useState } from 'react'
import AnimatedAvatar from './components/Avatar/AnimatedAvatar'

function MyComponent() {
  const [avatarState, setAvatarState] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSpeak = (text) => {
    setMessage(text)
    setAvatarState('speaking')
  }

  return (
    <AnimatedAvatar 
      state={avatarState}
      currentText={message}
      autoSpeak={true}
      onSpeakingEnd={() => setAvatarState('idle')}
    />
  )
}
```

### All States Example

```jsx
// Greeting state with auto-speak
<AnimatedAvatar 
  state="greeting"
  currentText="Namaste! Welcome to Jan-Sahayak"
  autoSpeak={true}
/>

// Speaking state
<AnimatedAvatar 
  state="speaking"
  currentText="I'm here to help you find welfare schemes"
  autoSpeak={true}
/>

// Thinking state
<AnimatedAvatar 
  state="thinking"
  currentText="Let me check that for you..."
/>

// Happy state
<AnimatedAvatar 
  state="happy"
  currentText="Great! I found 5 schemes for you"
/>

// Confused state
<AnimatedAvatar 
  state="confused"
  currentText="I'm not sure I understood. Could you clarify?"
/>

// Idle state
<AnimatedAvatar 
  state="idle"
/>
```

## Speech Synthesis Hook

The component uses the `useSpeechSynthesis` hook for multilingual text-to-speech:

```jsx
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

const { speak, stop, isSpeaking } = useSpeechSynthesis('hi') // Hindi

speak(
  'नमस्ते',
  () => console.log('Started speaking'),
  () => console.log('Finished speaking'),
  (event) => console.log('Word boundary:', event)
)
```

### Supported Languages

- `en` - English (en-US)
- `hi` - Hindi (hi-IN)
- `gu` - Gujarati (gu-IN)
- `kn` - Kannada (kn-IN)
- `bn` - Bengali (bn-IN)

## Customization

### Video Mapping

Videos are automatically selected based on the avatar state:
- **Thinking state** → `Video_Generation_Request_Fulfilled (2).mp4`
- **Happy/Greeting states** → `Video_Generation_For_Happiness (1).mp4`
- **Idle/Speaking/Confused states** → `Video_Generation_Confirmation.mp4`

To replace videos, update the files in `src/assets/videos/` directory.

### Animation Speed

Videos play at their native speed and loop continuously for each state.

### Border Colors

State-based border colors are defined in the component:
- Idle: Cream
- Speaking: Saffron with pulse animation
- Thinking: Gray with spin animation
- Happy: Green with sparkle animation
- Confused: Amber
- Greeting: Saffron with pulse

### Speech Rate

Speech rate is automatically adjusted for language clarity:
- English: 1.0x (normal)
- Indian languages: 0.9x (slightly slower for better clarity)

## Performance Considerations

- Videos are preloaded and cached by the browser
- Video playback is GPU-accelerated for smooth performance
- Component uses React hooks for efficient state management
- Speech is automatically cancelled when component unmounts
- No lag during language switching - speech synthesis adapts instantly
- Videos loop seamlessly for continuous animation

## Video Requirements

- Format: MP4 (H.264 codec recommended)
- Aspect ratio: Should match the avatar container (5:6 ratio)
- File size: Keep under 5MB for optimal loading
- Duration: 2-5 seconds recommended for smooth looping

## Accessibility

- Gender toggle has proper `aria-label`
- Replay button has proper `aria-label`
- Speech bubble text respects language-specific fonts
- Visual state indicators complement audio feedback

## Browser Support

Video playback is supported in all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)

Speech Synthesis API is supported in:
- Chrome 33+
- Firefox 49+
- Safari 7+
- Edge 14+

Note: Voice availability varies by browser and operating system.
