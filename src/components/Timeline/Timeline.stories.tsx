import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Timeline, type TimelineEvent, type TimelineProps } from './Timeline'

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

function Controlled(props: TimelineProps) {
  const [time, setTime] = useState(props.currentTime)

  useEffect(() => {
    setTime(props.currentTime)
  }, [props.currentTime])

  return (
    <div className="w-full max-w-2xl p-8">
      <Timeline
        {...props}
        currentTime={time}
        onChange={setTime}
        onEventClick={(ev, i) => console.log('event clicked', i, ev)}
      />
    </div>
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    duration: 120,
    currentTime: 38,
    events: [
      { start: 8, end: 22, label: 'Opening' },
      { start: 45, end: 68, label: 'Climax' },
      { start: 90, end: 108, label: 'Ending' },
    ] satisfies TimelineEvent[],
  },
}

export const Dense: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    duration: 180,
    currentTime: 72,
    events: [
      { start: 4, end: 14, label: 'Scene 1' },
      { start: 17, end: 28, label: 'Scene 2' },
      { start: 30, end: 42, label: 'Scene 3' },
      { start: 44, end: 54, label: 'Scene 4' },
      { start: 57, end: 68, label: 'Scene 5' },
      { start: 70, end: 80, label: 'Scene 6' },
      { start: 83, end: 98, label: 'Scene 7' },
      { start: 100, end: 112, label: 'Scene 8' },
      { start: 118, end: 138, label: 'Finale' },
      { start: 148, end: 162, label: 'Scene 10' },
      { start: 166, end: 175, label: 'Credits' },
    ] satisfies TimelineEvent[],
  },
}

export const NoEvents: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    duration: 90,
    currentTime: 15,
    events: [],
  },
}
