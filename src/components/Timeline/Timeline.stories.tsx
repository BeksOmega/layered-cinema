import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Timeline, type TimelineEvent, type TimelineProps } from './Timeline'

// ── Editable wrapper ──────────────────────────────────────────────────────────

function EditableControlled(props: TimelineProps & { initialEvents?: TimelineEvent[] }) {
  const [time, setTime] = useState(props.currentTime)
  const [events, setEvents] = useState<TimelineEvent[]>(props.initialEvents ?? props.events ?? [])

  useEffect(() => { setTime(props.currentTime) }, [props.currentTime])

  return (
    <div className="w-full max-w-2xl space-y-3 p-8">
      <Timeline
        {...props}
        events={events}
        currentTime={time}
        onChange={setTime}
        onEventsChange={setEvents}
        onEventClick={(ev, i) => console.log('event clicked', i, ev)}
        editable
      />
      <pre className="rounded bg-zinc-900 p-2 text-[10px] text-zinc-400">
        {JSON.stringify(events, null, 2)}
      </pre>
    </div>
  )
}

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
    duration: 5580,
    currentTime: 200,
    events: [
      { start: 42,  end: 255, label: 'The Harry Lime Theme' },
      { start: 255, end: 900, label: 'Dutch angle compositions' },
      { start: 483, end: 750, label: 'Shadow as moral indicator' },
    ] satisfies TimelineEvent[],
  },
}

export const Dense: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    duration: 5580,
    currentTime: 1800,
    events: [
      { start: 42,   end: 420,  label: 'The Harry Lime Theme' },
      { start: 255,  end: 900,  label: 'Dutch angle compositions' },
      { start: 483,  end: 750,  label: 'Shadow as moral indicator' },
      { start: 717,  end: 1200, label: "Holly's moral compromise" },
      { start: 980,  end: 1400, label: 'Wet cobblestone motif' },
      { start: 1200, end: 1800, label: "Lime's cat" },
      { start: 1550, end: 2100, label: 'Zither leitmotif' },
      { start: 1900, end: 2400, label: 'The Ferris wheel' },
      { start: 2200, end: 2800, label: 'Post-war moral ambiguity' },
      { start: 2600, end: 3100, label: 'The sewer geography' },
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

export const Editable: Story = {
  render: (args) => (
    <EditableControlled
      {...args}
      initialEvents={[
        { start: 120,  end: 480,  label: 'Opening credits' },
        { start: 600,  end: 1200, label: 'The Third Man theme' },
        { start: 1400, end: 1900, label: 'Ferris wheel scene' },
      ]}
    />
  ),
  args: {
    duration: 5580,
    currentTime: 300,
  },
}
