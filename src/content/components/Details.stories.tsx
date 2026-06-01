import type { Meta, StoryObj } from '@storybook/react';
import Details from './Details';

const meta = {
  title: 'Components/Details',
  component: Details,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'youtube-dark',
      values: [{ name: 'youtube-dark', value: '#0f0f0f' }],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Details>;

export default meta;
type Story = StoryObj<typeof meta>;

// Big Buck Bunny — freely licensed, stable video for YouTube embed stories
const BBB_ID = 'aqz-KE-bpKQ';

const DESCRIPTION =
  "Carol Reed's masterwork unfolds in the shadowy ruins of post-war Vienna. The expressionistic cinematography of Robert Krasker, with its deliberately canted angles and stark chiaroscuro contrasts, earned him the Academy Award for Best Cinematography.";

const LONG_DESCRIPTION = `Carol Reed's masterwork unfolds in the shadowy ruins of post-war Vienna. The expressionistic cinematography of Robert Krasker, with its deliberately canted angles and stark chiaroscuro contrasts, would later earn him the Academy Award for Best Cinematography.

The film's iconic score — a solo zither composition by Anton Karas — was discovered entirely by accident when Reed heard the musician playing in a Vienna café. Its insistent, deceptively cheerful melody became one of cinema's most instantly recognizable musical signatures, standing in ironic counterpoint to the moral ambiguity of the story.

Orson Welles, who had initially resisted the role of Harry Lime, reportedly delivered the majority of his screen time in just a few days of shooting. His magnetic performance — confined largely to the film's final act — created one of cinema's most indelible characters despite minimal screen presence.`;

export const NoMedia: Story = {
  args: {
    title: 'The Third Man',
    description: DESCRIPTION,
  },
};

export const WithImages: Story = {
  args: {
    title: 'Film Stills',
    description: DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Vienna street scene',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema2/640/360',
        alt: 'Night pursuit sequence',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema3/640/360',
        alt: 'Harry Lime in shadows',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema4/640/360',
        alt: 'The Ferris wheel scene',
      },
    ],
  },
};

export const WithVideos: Story = {
  args: {
    title: 'Archive Footage',
    description: DESCRIPTION,
    media: [
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 30,
        end: 90,
        title: 'Original Trailer',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 120,
        end: 180,
        title: 'Director Interview',
      },
    ],
  },
};

export const MixedMedia: Story = {
  args: {
    title: 'Production Archive',
    description: DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Vienna 1949',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 30,
        end: 90,
        title: 'Theatrical Trailer',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema3/640/360',
        alt: 'Film noir lighting',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 200,
        end: 260,
        title: 'Score Recording',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema5/640/360',
        alt: 'Behind the scenes',
      },
    ],
  },
};

export const LongDescription: Story = {
  args: {
    title: 'Production Notes',
    description: LONG_DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Vienna 1949',
      },
    ],
  },
};

export const NoTitle: Story = {
  args: {
    description: DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Film still',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema2/640/360',
        alt: 'Film still',
      },
    ],
  },
};

export const WithTimestampsAndTags: Story = {
  args: {
    title: 'The Third Man',
    description: DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Vienna street scene',
      },
    ],
    timestamps: [
      { time: '0:42' },
      { time: '4:15' },
      { time: '8:03' },
      { time: '11:57' },
    ],
    tags: [
      'film noir',
      'post-war',
      'orson welles',
      'vienna',
      '1949',
      'criterion',
    ],
  },
};

export const TimestampsOnly: Story = {
  args: {
    title: 'Related Moments',
    description: DESCRIPTION,
    timestamps: [
      { time: '0:42' },
      { time: '4:15' },
      { time: '8:03' },
    ],
  },
};

export const TagsOnly: Story = {
  args: {
    title: 'The Third Man',
    description: DESCRIPTION,
    tags: [
      'film noir',
      'post-war',
      'orson welles',
      'vienna',
      '1949',
      'criterion',
      'british cinema',
      'expressionism',
    ],
  },
};

export const WithYouTubeClip: Story = {
  args: {
    title: 'Scene Excerpt',
    description: DESCRIPTION,
    media: [
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 90,
        end: 150,
        title: 'The chase sequence (1:30 – 2:30)',
      },
    ],
    timestamps: [
      { time: '1:30' },
      { time: '2:00' },
    ],
    tags: ['excerpt', 'action'],
  },
};

export const MixedWithYouTube: Story = {
  args: {
    title: 'Production Archive',
    description: DESCRIPTION,
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema1/640/360',
        alt: 'Vienna 1949',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 60,
        end: 120,
        title: 'Opening sequence (1:00 – 2:00)',
      },
      {
        type: 'image',
        url: 'https://picsum.photos/seed/cinema3/640/360',
        alt: 'Film noir lighting',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 200,
        end: 240,
        title: 'Forest scene (3:20 – 4:00)',
      },
    ],
    tags: ['film noir', 'archive'],
  },
};

export const MultipleYouTubeClips: Story = {
  args: {
    title: 'Key Scenes',
    description: DESCRIPTION,
    media: [
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 30,
        end: 60,
        title: 'Introduction (0:30 – 1:00)',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 90,
        end: 150,
        title: 'The chase (1:30 – 2:30)',
      },
      {
        type: 'youtube',
        videoId: BBB_ID,
        start: 300,
        end: 360,
        title: 'Climax (5:00 – 6:00)',
      },
    ],
    timestamps: [
      { time: '0:30' },
      { time: '1:30' },
      { time: '5:00' },
    ],
    tags: ['scenes', 'highlights'],
  },
};
