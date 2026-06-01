import { useState } from 'react';

import { Switch } from '@/components/ui/switch';

const STORAGE_KEY_PREFIX = 'layered-cinema:';

interface Props {
  videoId: string;
}

export default function CinemaModeToggle({ videoId }: Props) {
  const [cinemaOn, setCinemaOn] = useState(
    localStorage.getItem(STORAGE_KEY_PREFIX + videoId) === 'on',
  );

  function handleToggle(checked: boolean) {
    if (checked) {
      localStorage.setItem(STORAGE_KEY_PREFIX + videoId, 'on');
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + videoId);
    }
    document.documentElement.dataset.layeredCinema = checked ? 'on' : 'off';
    setCinemaOn(checked);
  }

  return (
    <div className="flex items-center justify-between pb-4">
      <label
        htmlFor="cinema-mode-switch"
        className="text-[14px] font-medium cursor-pointer select-none"
      >
        Cinema Mode
      </label>
      <Switch
        id="cinema-mode-switch"
        checked={cinemaOn}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
