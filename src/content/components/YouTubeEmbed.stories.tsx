import type { Meta, StoryObj } from '@storybook/react';
import YouTubeEmbed from './YouTubeEmbed';

// Big Buck Bunny — freely licensed, stable video ID
const BBB_ID = 'aqz-KE-bpKQ';

const meta = {
  title: 'Components/YouTubeEmbed',
  component: YouTubeEmbed,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f0f0f' }],
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0f0f0f',
          padding: '2rem',
        }}
      >
        <div style={{ width: '640px', aspectRatio: '16/9' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof YouTubeEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullVideo: Story = {
  args: {
    videoId: BBB_ID,
    title: 'Big Buck Bunny',
  },
};

export const ClipWithStartOnly: Story = {
  args: {
    videoId: BBB_ID,
    start: 90,
    title: 'Starting at 1:30',
  },
};

export const ClipWithStartAndEnd: Story = {
  args: {
    videoId: BBB_ID,
    start: 90,
    end: 150,
    title: 'Clip: 1:30 – 2:30',
  },
};

export const ShortClip: Story = {
  args: {
    videoId: BBB_ID,
    start: 200,
    end: 220,
    title: '20-second clip',
  },
};
